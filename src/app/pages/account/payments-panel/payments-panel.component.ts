import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import moment from 'moment';
import { Observable, map, startWith } from 'rxjs';
import { Country } from 'src/app/interfaces/countries';
import { GraphResponse } from 'src/app/interfaces/graph';
import { BankAccountData, ChargeData, Payments, StatusCharge, ViewsPayments, ViewsPaymentsInfo } from 'src/app/interfaces/payments';
import { PaginatorInfo } from 'src/app/interfaces/public';
import { DataValidStripe, UserAuth } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { PublicService } from 'src/app/services/public.service';
import { StripeService } from 'src/app/services/stripe.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-payments-panel',
  templateUrl: './payments-panel.component.html',
  styleUrls: ['./payments-panel.component.scss']
})
export class PaymentsPanelComponent implements OnInit {
  @ViewChild(MatTable) table!: MatTable<Payments>;
  @ViewChild('matPagPayments') matPagPayments!: MatPaginator;
  @ViewChild('matPagCharges') matPagCharges!: MatPaginator;


  cssFloatLabel: string = "";
  cssInputTxt: string = "";
  cssSpanValidation: string = "";
  cssInputToggle: string = "";

  currentView!: ViewsPayments;
  isLoading: boolean = true;
  isPressButton: boolean = false;

  optionsFieldsEdit: Array<ViewsPaymentsInfo>;

  pagePayment: number = 1;
  payments: Payments[] = [];
  isLoadPayments: boolean = false;

  paginatorPayments: PaginatorInfo = {
    count: 0,
    currentPage: 0,
    firstItem: 0,
    hasMorePages: false,
    lastItem: 0,
    lastPage: 0,
    perPage: 0,
    total: 0,
    __typename: ''
  };
  myPaymentsColumns: string[] = [
    'product_id',
    'status',
    'amount',
    'shipping_method'
  ];


  pageCharges: number = 1;
  charges: ChargeData[] = [];
  isLoadCharges: boolean = false;
  paginatorCharges: PaginatorInfo = {
    count: 0,
    currentPage: 0,
    firstItem: 0,
    hasMorePages: false,
    lastItem: 0,
    lastPage: 0,
    perPage: 0,
    total: 0,
    __typename: ''
  };

  myChargesColumns: string[] = [
    'product',
    'status',
    'amount',
    'shipping_method'
  ];

  dataValidStripe!: any;
  stripe_id!: any;

  userCurrent!: UserAuth;
  formBankAccount: FormGroup = this.form.group({
    iban: ['', [Validators.required, Validators.pattern(this.publicService.regExpIBAN), Validators.minLength(24), Validators.maxLength(29)]],
    address: ['', [Validators.required, Validators.minLength(6)]],
    zip_code: ['', [Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.pattern(this.publicService.regExpPostalCode)]],
    name: ['', [Validators.required, Validators.pattern(this.publicService.regExpString)]],
    country: ['', [Validators.required, Validators.pattern(this.publicService.regExpString), Validators.minLength(3)]]
  });

  countries: Array<Country> = [];
  filteredCountry!: Observable<Country[]>;

  constructor(
    private form: FormBuilder,
    private stripeService: StripeService,
    private router: Router,
    public publicService: PublicService,
    private paymentService: PaymentsService,
    private userService: UserService,
    private globalService: GlobalService,
    private lang: LangService
  ) {
    this.userCurrent = this.userService.currentUser!;
    this.setBankAccountInForm();
    this.countries = this.publicService.countries;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-tl-primary-medium";
    this.cssInputTxt = this.publicService.cssInputBase + " focus:border-tl-primary-medium border-tl-gray-border";
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + " text-tl-gray-border";
    this.cssInputToggle = this.publicService.cssInputToggle;
    this.optionsFieldsEdit = this.publicService.viewsPaymentsPanel;
    /// ********************
    if (this.country) {
      this.filteredCountry = this.country.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCountry(value || '')),
      );
    }
  }

  get country() {
    return this.formBankAccount.get('country');
  }

  async ngOnInit() {
    await this.getHistoryPayments();
    await this.getHistoryCharges();
    this.isLoading = false;
  }

  private _filterCountry(value: string): Country[] {
    const filterValue = value.toLowerCase();

    return this.countries.filter(option => {

      if (option.name) {
        return option.name.toLowerCase().includes(filterValue);
      }

      return option.name.toLowerCase().includes(filterValue);
    }
    );
  }

  getLabelShippingMethod(method: string) {
    if (method == 'in_person') return 'labels.in_person';
    if (method == 'my_address') return 'labels.my_adress';
    return 'labels.delivery_address';
  }

  setBankAccountInForm() {
    const { bankaccount } = this.userCurrent;

    if (!bankaccount) return;

    console.log("🚀 ~ setBankAccountInForm ~ bankaccount:", bankaccount)

    this.formBankAccount.patchValue({
      iban: bankaccount.iban,
      address: bankaccount.address,
      zip_code: bankaccount.zip_code,
      name: bankaccount.name,
      country: bankaccount.country
    });
  }

  formattedIban(event: any) {
    event.target.value = event.target.value.split(' ').join('').replace(/(.{4})/g, "$1 ");
    return;
  }

  selectView(view: ViewsPayments) {
    if (view == 'BANK_DATA') {
      let response = this.globalService.getData(this.globalService.STORAGE_USER)
      this.stripe_id = response.stripe_id
      let dataValid = {
        email: this.userCurrent.email,
        first_name: this.userCurrent.name,
        last_name: this.userCurrent.last_name,
        phone: this.userCurrent.personal_info != null ? `+${this.userCurrent.personal_info.phone_country_code}${this.userCurrent.personal_info.phone}` : '',
        day: this.userCurrent.personal_info?.birthdate != null ? moment(this.userCurrent.personal_info.birthdate).format('DD') : '',
        month: this.userCurrent.personal_info?.birthdate != null ? moment(this.userCurrent.personal_info.birthdate).format('MM') : '',
        year: this.userCurrent.personal_info?.birthdate != null ? moment(this.userCurrent.personal_info.birthdate).format('YYYY') : '',
        line1: this.userCurrent.personal_info?.address,
        city: this.userCurrent.personal_info?.city_id,
        postal_code: this.userCurrent.personal_info?.zip_code,
        state: this.userCurrent.personal_info?.state_id,
        country: this.userCurrent.personal_info?.country_id,
      };
      
      
      const fieldLabels: Record<string, string> = {
        email: 'correo electrónico',
        first_name: 'nombre',
        last_name: 'apellido',
        phone: 'número de teléfono',
        day: 'día de nacimiento',
        month: 'mes de nacimiento',
        year: 'año de nacimiento',
        line1: 'dirección',
        city: 'ciudad',
        postal_code: 'código postal',
        state: 'provincia',
        country: 'país',
      };
      
      const missingFields = Object.entries(dataValid)
        .filter(([_, value]) => value === null || value === undefined || value === '')
        .map(([key]) => fieldLabels[key] || key); 
      
     
      const birthdateFields = ['día de nacimiento', 'mes de nacimiento', 'año de nacimiento'];
      const missingBirthdate = birthdateFields.some(field => missingFields.includes(field));
      
      let message = missingFields
        .filter(field => !birthdateFields.includes(field)) 
        .join(', ');
      
      if (missingBirthdate) {
        message = message ? `${message}, fecha de nacimiento` : 'fecha de nacimiento';
      }
      
      if (missingFields.length === 0) {
        const ref = this.globalService.showInfoBank();
        this.dataValidStripe = dataValid;
        this.formBankAccount.markAsUntouched();
        this.isPressButton = false;
        this.currentView = view;
      } else {
        console.warn('Campos faltantes:', missingFields);
        this.globalService.showInfo({
          msg: `Información del usuario incompleta: ${message}`
        });
      }
      
      
    } else {
      this.formBankAccount.markAsUntouched();
      this.isPressButton = false;
      this.currentView = view;
    }
  }

  back() {
    this.router.navigate([this?.lang?._locale == 'es' ? 'cuenta/opciones' :'account/options']);
  }

  async getHistoryPayments() {
    try {
      const response: GraphResponse = await this.paymentService.getPaymentsUser(this.pagePayment);
      console.log("🚀 ~ getHistoryPayments ~ response:", response.data.payments);
      if (response.errors) throw (response.errors);
      const { payments } = response.data;
      this.paginatorPayments = { ...payments.paginatorInfo };
      this.payments = [...payments.data];
      this.isLoadPayments = false;
    } catch (error) {
      console.log("🚀 ~ getHistoryPayments ~ error:", error)
    }
  }

  async eventPaymentsTable(e: PageEvent) {
    this.isLoadPayments = true;

    if (e.previousPageIndex == undefined) return;

    if (e.previousPageIndex > this.matPagPayments.pageIndex) {
      this.pagePayment--;
    } else {
      this.pagePayment++;
    }

    if (this.pagePayment > this.paginatorPayments.lastPage) return;

    await this.getHistoryPayments();

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  async getHistoryCharges() {
    try {
      const response: GraphResponse = await this.paymentService.getChargesUser(this.pageCharges);
      console.log("🚀 ~ getHistoryCharges ~ response:", response.data);
      const { charges } = response.data;
      this.paginatorCharges = { ...charges.paginatorInfo };
      this.charges = [...charges.data];
      this.isLoadCharges = false;
    } catch (error) {
      console.log("🚀 ~ getHistoryCharges ~ error:", error)
    }
  }

  async eventChargesTable(e: PageEvent) {
    this.isLoadCharges = true;

    if (e.previousPageIndex == undefined) return;

    if (e.previousPageIndex > this.matPagCharges.pageIndex) {
      this.pageCharges--;
    } else {
      this.pageCharges++;
    }

    if (this.pageCharges > this.paginatorCharges.lastPage) return;

    await this.getHistoryCharges();

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  getTextStatus(status: StatusCharge) {
    const _msg = (label: string) => `pages.payments_panel.${label}`;

    const labels = {
      created: _msg('created'),
      pending: _msg('pending'),
      complete: _msg('complete'),
      canceled: _msg('canceled'),
      refused: _msg('refused')
    };

    return labels[status];
  }

  getErrorLabel(formField: string) {
    const inputCtrl = this.formBankAccount.get(formField);

    // if(this.isPressButton) return 'messages.field_required';

    if (!inputCtrl?.touched) return '';

    if (!inputCtrl?.value) return 'messages.field_required';

    if (inputCtrl?.value == '') return 'messages.field_required';

    if (inputCtrl?.invalid) return 'messages.enter_valid_field';

    if (inputCtrl.errors) {
      if (inputCtrl.errors['maxlength']) return 'components.update_phone.limit_length_phone';
      if (inputCtrl.errors['pattern']) return 'messages.enter_valid_field';
    }

    return '';
  }

  validateForm() {
    this.formBankAccount.markAllAsTouched()
    this.isPressButton = true;
    console.log("🚀 ~ validateForm ~ this.formBankAccount:", this.formBankAccount)
    if (this.formBankAccount.invalid) return;
    this.isLoading = true;
    const { iban, address, zip_code, name, country } = this.formBankAccount.value;
    const ibanNumber: string = iban.replace(/\s/g, '');
    this.isPressButton = false;
    this.updateBankAccount({ iban: ibanNumber, address, zip_code, name, country });
  }

  async updateBankAccount(payload: BankAccountData) {
    try {
      const resCreated = await this.stripeService.validationStripe(
        this.dataValidStripe.email,
        payload.iban,
        payload.name,
        this.dataValidStripe.first_name,
        this.dataValidStripe.last_name,
        this.dataValidStripe.phone,
        this.dataValidStripe.day,
        this.dataValidStripe.month,
        this.dataValidStripe.year,
        this.dataValidStripe.line1,
        this.dataValidStripe.city,
        this.dataValidStripe.postal_code,
        this.dataValidStripe.state,
        this.dataValidStripe.country,
        this.stripe_id == null ? 'create' : 'edit'
      );
      if (resCreated?.errors) {
        const errorMessage = resCreated.errors[0]?.message || 'Error desconocido';
        this.globalService.showInfo({ 
          msg: errorMessage.includes('Error creando la cuenta de Stripe:') 
            ? errorMessage.split('Error creando la cuenta de Stripe:')[1].trim()
            : errorMessage
        });
        return;
      }
      if (!resCreated?.createStripe) {
        this.globalService.showInfo({ msg: 'Error al procesar la solicitud' });
        return;
      }
      this.stripe_id = resCreated.createStripe.id;
      this.formBankAccount.patchValue({
        iban: null,
        address: null,
        zip_code: null,
        name: null,
        country: null
      });
      this.globalService.showInfo({ msg: 'pages.payments_panel.bank_account_add_success' });
  
    } catch (error: any) {
      console.error('Error detallado:', error);
      
      let errorMessage = 'Error desconocido';
      
      if (error.message) {
        errorMessage = error.message;
        if (error.graphQLErrors?.[0]?.message) {
          errorMessage = error.graphQLErrors[0].message;
        }
        if (errorMessage.includes('Error creando la cuenta de Stripe:')) {
          errorMessage = errorMessage.split('Error creando la cuenta de Stripe:')[1].trim();
        }
      }
      
      this.globalService.showInfo({ msg: errorMessage });
    } finally {
      this.isLoading = false;
    }
  }
}