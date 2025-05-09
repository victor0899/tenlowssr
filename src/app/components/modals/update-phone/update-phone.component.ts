import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { Country } from 'src/app/interfaces/countries';
import { GraphResponse } from 'src/app/interfaces/graph';
import { UserAuth } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-phone',
  templateUrl: './update-phone.component.html',
  styleUrls: ['./update-phone.component.scss']
})
export class UpdatePhoneComponent {

  userCurrent?: UserAuth;
  cssFloatLabel:string = "";
  cssInputTxt:string = "";
  cssSpanValidation:string = "";
  isLoad:boolean = true;
  isEnterCode: boolean = false;
  isSend: boolean = false;

  formUpdatePhone!: FormGroup;
  formValidatePhone!: FormGroup;

  countries: Country[] = [];
  filteredCountry!: Observable<Country[]>;

  phoneNumber: string = '';

  constructor(
    private form: FormBuilder,
    private userService: UserService,
    private globalService: GlobalService,
    private authService: AuthService,
    private lang: LangService,
    public publicService: PublicService,
    private storeService: StoreService,
    public dialogRef: MatDialogRef<UpdatePhoneComponent>,
  ){
    this.userCurrent = this.userService.currentUser;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-input-label";
    this.cssInputTxt = this.publicService.cssInputBase + " focus:border-input-border";
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + " text-tl-dark-medium text-sm";
    this.countries = this.publicService.countries;
    /************************* */
    const { personal_info } = this.userCurrent!;
    console.log("🚀 ~ personal_info:", personal_info);
    //651714114
    this.formUpdatePhone = this.form.group({
      phone_country_code: [personal_info?.phone_country_code ?? '', [Validators.required, Validators.minLength(2)]],
      phone: [ personal_info?.phone ?? '' , [Validators.required, Validators.pattern(this.publicService.regExpPhone), Validators.maxLength(20), Validators.minLength(8)]]
    });

    this.formValidatePhone = this.form.group({
      code: ['', [Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.minLength(5)]]
    });

    if(this.phone_country_code){
      this.filteredCountry = this.phone_country_code.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCountry(value || '')),
      );
    }
  }
  get phone_country_code() {
    return this.formUpdatePhone.get('phone_country_code');
  }

  private _filterCountry(value: string): Country[] {
    const filterValue = value.toLowerCase();

    return this.countries.filter(option =>{

      if(option.name){
        return option.name.toLowerCase().includes(filterValue);
      }

      return option.name.toLowerCase().includes(filterValue);
    }
    );
  }

  formatPhoneCountryCode(phone_country_code: string) {
    // Verificar si el string comienza con '+'
    if (!phone_country_code.startsWith('+')) {
      // Si no comienza con '+', agregarlo
      return `+${phone_country_code}`;
    }
    // Si ya tiene '+', retornarlo sin cambios
    return phone_country_code;
  }

  async onValidate(){

    if(this.formUpdatePhone.invalid) return;

    this.isSend = true;
    const  {  phone_country_code, phone } = this.formUpdatePhone.value;
    
    this.phoneNumber = `${this.formatPhoneCountryCode(phone_country_code)}${phone}`;
    const isSended = await this.sendSms();
    if(!isSended) return;
    this.requestCode();
  }

  getErrorLabel( formField:string ){
    const inputCtrl = this.formUpdatePhone.get(formField) ?? this.formValidatePhone.get(formField);

    if (inputCtrl?.untouched) return '';

    if(!inputCtrl?.value) return 'messages.field_required';

    if(inputCtrl?.value == '') return 'messages.field_required';

    if(inputCtrl?.invalid) return 'messages.enter_valid_field';

    if(inputCtrl.errors){
      if(inputCtrl.errors['maxlength']) return 'components.update_phone.limit_length_phone';
    }

    return '';
  }

  async sendSms(){
    try {
      const phone = this.phoneNumber.replace('+', '')!;
      const response:GraphResponse = await this.storeService.requestCodeRental( phone, 'Tenlow')
      if( response.errors ) throw(response.errors);

      const data = JSON.parse(response.data.f2ARequest);
      if (data.status !== 'ok') throw('err send sms')

      return true;
    } catch (error) {
      this.globalService.showInfo({
        msg: 'components.check_code.err_request_code'
      });
      this.isSend = false;
      return false;
    }
  }

  async requestCode(){
    try {

      // const response: GraphResponse = await this.userService.requestCodeChangePhone();
      // console.log("🚀 ~ requestCode ~ response:", response)
      // if(response.errors) throw(response.errors);
      // const { 0:value , 1:msg  } = response.data.getChangePhone;
      // if(value !== '1'){
      //   this.isSend = false;
      //   return this.globalService.showInfo({msg});
      // }

      this.isEnterCode = true;
    } catch (error) {
      console.log("🚀 ~ requestCode ~ error:", error);
      this.globalService.showToast( this.lang._('messages.global_err'), this.lang._('labels.close'), 'top' );
    } finally {
      this.isSend = false;
    }
  }

  async validateFormCode(){
    if(this.formValidatePhone.invalid) return;
    this.isSend = true;
    const isValidCode = await this.verifyCodeUpdate();
    if(!isValidCode) return;
    this.updatePhone();
  }


  async verifyCodeUpdate(){
    try {
      const  { code } = this.formValidatePhone.value;

      const newPhone = this.phoneNumber.replace('+', '')!
      const response: GraphResponse = await this.storeService.validateCodeRental( newPhone, code );
      console.log("🚀 ~ verifyCodeUpdate ~ response:", response)

      if( response.errors ) throw(response.errors);

      const data = JSON.parse(response.data.f2AVerify);

      if (data.status !== 'ok') throw('err validate sms')

      if (data.result && !data.result?.verified) {
        throw('invalid code')
      }

      return true;
    } catch (error) {
      this.globalService.showInfo({
        msg: 'components.check_code.err_invalid_code'
      });
      this.isSend = false;
      return false;
    }
  }

  async updatePhone(){
    try {

      const  { code } = this.formValidatePhone.value;
      const  {  phone_country_code, phone } = this.formUpdatePhone.value;

      const response: GraphResponse = await this.userService.changePhone(code, phone, phone_country_code);

      console.log("🚀 ~ updatePhone ~ response:", response);

      if(response.errors) throw(response.errors);
      if(!this.userCurrent) throw('No hay usuario autenticado');

      const { 0:value , 1:msg  } = response.data.changePhone;

      if(value !== '1'){
        this.isSend = false;
        return this.globalService.showInfo({msg});
      }

      this.userCurrent!.personal_info!.phone = phone;
      this.userCurrent!.personal_info!.phone_country_code = phone_country_code;

      this.userService.setCurrentUser(this.userCurrent);
      this.authService.eventAuthUser.next( this.userCurrent );

      this.dialogRef.close();
      this.isSend = false;
      this.globalService.showInfo({
        msg: 'components.update_phone.phone_update_success'
      });
    } catch (error:any) {
      this.isSend = false;
      console.log("🚀 ~ updatePhone ~ error:", error);

      if(Array.isArray(error)){
        if( error.length &&  "extensions" in error[0]){
          const errPhone = error[0].extensions?.validation?.new_phone;
          if (errPhone) {
            this.globalService.showInfo({
              msg: this.lang._('components.update_phone.phone_used'),
              title: this.lang._('messages.title_err'),
            });
            return;
          }
        }
      }
      this.globalService.showToast( this.lang._('messages.global_err'), this.lang._('labels.close'), 'top' );
    }
  }

}
