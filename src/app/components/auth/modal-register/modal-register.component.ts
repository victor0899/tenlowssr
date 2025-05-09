import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GraphQLErrors } from '@apollo/client/errors';
import { lastValueFrom, Observable, map, startWith } from 'rxjs';
import { SignupParams } from 'src/app/interfaces/auth';
import { Country } from 'src/app/interfaces/countries';
import { GraphResponse } from 'src/app/interfaces/graph';
import { UserAuth } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-modal-register',
  templateUrl: './modal-register.component.html',
  styleUrls: ['./modal-register.component.scss']
})
export class ModalRegisterComponent implements OnInit {
  cssInputBase: string;
  cssFloatLabel: string;
  cssSpanValidation: string;
  sended: boolean = false;
  isAcceptTerms: boolean = false;
  signupForm!: FormGroup;
  typePasswordInput: 'text' | 'password' = 'password';
  iconBtnEye: 'eye-outline' | 'eye-off-outline' = 'eye-outline';

  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';

  // Propiedades para el manejo de países
  countries: Country[] = [];
  filteredCountry!: Observable<Country[]>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public publicService: PublicService,
    private globalService: GlobalService,
    private userService: UserService,
    private lang: LangService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalRegisterComponent>
  ) {
    this.cssInputBase = this.publicService.cssInputBase;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase;
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + ' text-tl-dark-gray text-xs';
    this.countries = this.publicService.countries;
  }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.minLength(8), Validators.maxLength(40), Validators.required, Validators.pattern(this.publicService.regExpPassword)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(this.publicService.regExpString)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(this.publicService.regExpString)]],
      phone_country_code: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(this.publicService.regExpPhone), Validators.maxLength(20), Validators.minLength(8)]]
    });

    const phoneCountryControl = this.signupForm.get('phone_country_code');
    if (phoneCountryControl) {
      this.filteredCountry = phoneCountryControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCountry(value || '')),
      );
    }
  }

  private _filterCountry(value: string): Country[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(option => 
      option.name.toLowerCase().includes(filterValue)
    );
  }

  changeTypeInput() {
    (this.typePasswordInput == 'password') ? this.typePasswordInput = 'text' : this.typePasswordInput = 'password';
    (this.iconBtnEye == 'eye-outline') ? this.iconBtnEye = 'eye-off-outline' : this.iconBtnEye = 'eye-outline';
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get name() {
    return this.signupForm.get('name');
  }

  get lastName() {
    return this.signupForm.get('lastName');
  }

  get phone() {
    return this.signupForm.get('phone');
  }

  get phone_country_code() {
    return this.signupForm.get('phone_country_code');
  }

  getValidationEmailMsg() {
    if (this.email?.errors) {
      const { errors } = this.email;
      if (errors['required']) return 'messages.field_required';
      if (errors['email']) return 'pages.login.enter_valid_email';
    }
    return 'messages.field_required';
  }

  getValidationPasswordMsg() {
    if (this.password?.errors) {
      const { errors } = this.password;
      if (errors['required']) return 'messages.field_required';
      if (errors['minlength']) return 'pages.login.min_password_char';
      if (errors['maxlength']) return 'pages.login.max_password_char';
      if (errors['pattern']) return 'pages.sign_up.err_pattern_password';
    }
    return 'messages.field_required';
  }

  formatPhoneCountryCode(phone_country_code: string) {
    if (!phone_country_code.startsWith('+')) {
      return `+${phone_country_code}`;
    }
    return phone_country_code;
  }

  onAcceptTerms(event: MatCheckboxChange) {
    this.isAcceptTerms = event.checked;
  }

  async validateForm() {
    this.signupForm.markAllAsTouched();
    this.sended = true;

    if (!this.isAcceptTerms) {
      this.sended = false;
      return this.globalService.showToast(
        this.lang._('pages.sign_up.accept_terms_err'),
        this.lang._('labels.close'),
        'top'
      );
    }

    if (this.signupForm.invalid) return this.sended = false;

    await this.authUser();
    this.sended = false;
  }

  async authUser() {
    try {
      const phoneCountryCode = this.phone_country_code?.value || '';
      const phoneNumber = this.phone?.value || '';

      const payload: SignupParams = {
        name: this.name?.value,
        last_name: this.lastName?.value,
        email: this.email?.value,
        password: this.password?.value,
        phone: phoneNumber,
        phone_country_code: this.formatPhoneCountryCode(phoneCountryCode) 
      };

      const response: GraphResponse = await this.authService.signupUser(payload);

      if (response?.errors) {
        throw (this.errorHandling(response.errors));
      }

      const { registerUser } = response.data;

      if (!registerUser.email_verified_at) {
        this.dialogRef.close();
        this.globalService.showInfo({
          msg: this.lang._('messages.email_verify_register')
        });
        return;
      }

      this.goAccountPage(response.data.registerUser);

    } catch (error: any) {
      this.sended = false;
      let msg: string = this.lang._('messages.global_err');
      msg = this.inspectingError(error);
      this.globalService.showToast(msg, this.lang._('labels.close'));
    }
  }

  errorHandling(errResponse: any) {
    const errors: GraphQLErrors = errResponse;

    const validationErrors = errors.filter((err) => {
      if (err.extensions['validation']) return true;
    });

    if (validationErrors.length) {
      const msgsErr = validationErrors.map(err => err.extensions['validation'])
      return { validations: msgsErr };
    }

    return { graphql: errors };
  }

  inspectingError(error: any) {
    let msg: string = 'User could not be registered';

    if ("message" in error) {
      msg = error.message;
    }

    if (error.validations) {
      const validations = Object.values(error.validations[0]);
      if (validations instanceof Array) msg = validations[0] as string;
    }

    if ("graphql" in error) {
      if (error.graphql instanceof Array) {
        msg = error.graphql[0].debugMessage;
      }
    }

    if (msg.includes('[HTTP 400]') || msg[0].includes('[HTTP 400]')) {
      msg = `An error occurred while trying to send the confirmation message to the number provided, make sure it is a valid number.`;
    }

    return msg;
  }

  async goAccountPage(user: UserAuth) {
    const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));
    let route = 'account/options'
    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');
    
    this.authService.saveTokenAuth(user.api_token);
    this.authService.eventAuthUser.next(user);
    this.userService.setCurrentUser(user);
    this.dialogRef.close();
    this.router.navigateByUrl(translatedString);
  }
}