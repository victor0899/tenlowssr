import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { Country } from 'src/app/interfaces/countries';
import { GraphResponse } from 'src/app/interfaces/graph';
import { BankAccountData, ViewsPayments, ViewsPaymentsInfo } from 'src/app/interfaces/payments';
import { UserAuth } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { PublicService } from 'src/app/services/public.service';
import { StripeService } from 'src/app/services/stripe.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'modal-bank-account',
    templateUrl: 'modal-bank-account.component.html',
    styleUrls: ['./modal-bank-account.component.scss']
})

export class AddBankAccountModal {
    formBankAccount: FormGroup = this.form.group({
        iban: ['', [Validators.required, Validators.pattern(this.publicService.regExpIBAN), Validators.minLength(24), Validators.maxLength(29)]],
        address: ['', [Validators.required, Validators.minLength(6)]],
        zip_code: ['', [Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.pattern(this.publicService.regExpPostalCode)]],
        name: ['', [Validators.required, Validators.pattern(this.publicService.regExpString)]],
        country: ['', [Validators.required, Validators.pattern(this.publicService.regExpString), Validators.minLength(3)]]
    });
    isLoading: boolean = false;
    isPressButton: boolean = false;
    userCurrent!: UserAuth;

    currentView!: ViewsPayments;

    cssFloatLabel: string = "";
    cssInputTxt: string = "";
    cssSpanValidation: string = "";
    cssInputToggle: string = "";

    optionsFieldsEdit: Array<ViewsPaymentsInfo>;

    dataValid: any;

    countries: Array<Country> = [];
    filteredCountry!: Observable<Country[]>;
    constructor(
        public dialogRef: MatDialogRef<AddBankAccountModal>,
        private form: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public publicService: PublicService,
        private stripeService: StripeService,
        private paymentService: PaymentsService,
        private globalService: GlobalService,
        private userService: UserService,
    ) {
        this.userCurrent = this.userService.currentUser!;
        this.setBankAccountInForm();
        this.countries = this.publicService.countries;
        this.cssFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-tl-primary-medium";
        this.cssInputTxt = this.publicService.cssInputBase + " focus:border-tl-primary-medium border-tl-gray-border";
        this.cssSpanValidation = this.publicService.cssSpanValidationBase + " text-tl-gray-border";
        this.cssInputToggle = this.publicService.cssInputToggle;
        this.optionsFieldsEdit = this.publicService.viewsPaymentsPanel;
        this.dataValid = data.dataValid;
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

    onNoClick(): void {
        this.dialogRef.close();
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

    async validateForm() {
        this.formBankAccount.markAllAsTouched()
        this.isPressButton = true;
        console.log("🚀 ~ validateForm ~ this.formBankAccount:", this.formBankAccount)
        if (this.formBankAccount.invalid) return;
        this.isLoading = true;
        const { iban, address, zip_code, name, country } = this.formBankAccount.value;
        const ibanNumber: string = iban.replace(/\s/g, '');
        this.isPressButton = false;
        try {
            const resCreated = await this.stripeService.validationStripe(
                this.dataValid.email,
                ibanNumber,
                name,
                this.dataValid.first_name,
                this.dataValid.last_name,
                this.dataValid.phone,
                this.dataValid.day,
                this.dataValid.month,
                this.dataValid.year,
                this.dataValid.line1,
                this.dataValid.city,
                this.dataValid.postal_code,
                this.dataValid.state,
                this.dataValid.country,
                'create'
            )
            console.log('errrorrr', resCreated)
            if (resCreated.createStripe == null){
                this.globalService.showInfo({ msg: 'Error, contactar con soporte: '});
            }else{
                this.data.onSuccess(resCreated.createStripe);
                this.dialogRef.close();
            }
        } catch (error: any) {
            console.error('Error al crear la cuenta de Stripe:', error);
            this.globalService.showInfo({ msg: 'Error creando la cuenta de Stripe: ' + error?.message});
        } finally {
            this.isLoading = false;
        }
    }

    async updateBankAccount(payload: BankAccountData) {
        try {
            const response: GraphResponse = await this.paymentService.registerAccountBank(payload);
            if (response.errors) throw (response.errors);
            console.log("🚀 ~ updateBankAccount ~ response:", response);

            const { 0: value, 1: msg } = response.data.updateAccountBank;

            if (value !== '1') {
                return this.globalService.showInfo({ msg: 'pages.payments_panel.cant_add_bank_account' });
            }

            this.userCurrent.bankaccount = payload;
            this.userService.setCurrentUser(this.userCurrent);
            this.globalService.showInfo({ msg: 'pages.payments_panel.bank_account_add_success' });
        } catch (error) {
            console.log("🚀 ~ updateBankAccount ~ error:", error)
            this.globalService.showInfo({ msg: 'messages.global_err' });
        } finally {
            this.isLoading = false;
        }
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
        this.formBankAccount.markAsUntouched();
        this.isPressButton = false;
        this.currentView = view;
    }

}