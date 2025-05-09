import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { GraphResponse } from 'src/app/interfaces/graph';
import { UserAuth } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { CustomValidator, PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-modal-recovery-password',
  templateUrl: './modal-recovery-password.component.html',
  styleUrls: ['./modal-recovery-password.component.scss']
})
export class ModalRecoveryPasswordComponent {

  cssInputBase:string;
  cssFloatLabel:string;
  cssSpanValidation:string;
  sended:boolean= false;
  typePasswordInput: 'text' | 'password' = 'password';
  iconBtnEye: 'eye-outline' | 'eye-off-outline' = 'eye-outline';
  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';

  isShowFormEmail: boolean = true;
  isShowCodes: boolean = false;
  isInvalidCode: boolean = false;
  isLoading:boolean = false;

  sendEmailForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]]
  });

  codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), CustomValidator.numeric]]
  });

  formUpdatePassword = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(this.publicService.regExpPassword)]],
    confirm_password: ['', [Validators.required, Validators.minLength(6),Validators.pattern(this.publicService.regExpPassword)]],
  });

  isSuccessSendEmail: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private lang: LangService,
    private dialog: MatDialog,
    private http: HttpClient,
    private userService: UserService,
    private authService: AuthService,
    public publicService: PublicService,
    private globalService: GlobalService,
    public dialogRef: MatDialogRef<ModalRecoveryPasswordComponent>
  ){
    this.cssInputBase = this.publicService.cssInputBase  + ' border-tl-dark-medium';
    this.cssFloatLabel = this.publicService.cssFloatLabelBase + ' !text-xs text-tl-dark-gray';
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + ' text-tl-dark-gray !text-xs';
  }

  ngOnInit(): void {}

  get email(){
    return this.sendEmailForm.get('email');
  }

  get code(){
    return this.codeForm.get('code');
  }

  get new_password(){
    return this.formUpdatePassword.get('new_password')
  }

  get confirm_password(){
    return this.formUpdatePassword.get('confirm_password')
  }


  getValidationEmailMsg(){

    if(this.email?.errors){
      const { errors } = this.email;
      if(errors['required']) return 'messages.field_required';

      if(errors['email']) return 'pages.login.enter_valid_email';
    }

    return 'messages.field_required';
  }

  hiddenSuccess(){
    this.isSuccessSendEmail = !this.isSuccessSendEmail;
  }

  inputErrors(formInput: string){
    const input = this.formUpdatePassword.get(formInput);
    if(input?.errors){
      const { errors } = input;
      if('required' in errors) return 'Please enter a password.'
      if('minlength' in errors) return 'Password must be 6 characters long.'
    }

    return '';
  }

  async validateForm(){
    this.sendEmailForm.markAllAsTouched()
    this.sended = true;
    if(this.sendEmailForm.invalid) return;
    this.isLoading = true;
    await this.sendEmailToRecoverPassword();
    this.sended = false;
    this.isLoading = false;
  }

  getValidationPasswordMsg( inputName:string ){

    const inputCtrl = this.formUpdatePassword.get(inputName);

    if(!inputCtrl) return '';

    if(inputCtrl.errors){
      const { errors } = inputCtrl;
      if(errors['required']) return 'messages.field_required';

      if(errors['minlength']) return 'pages.login.min_password_char';

      if(errors['maxlength']) return 'pages.login.max_password_char';

      if(errors['pattern']) return 'pages.sign_up.err_pattern_password';
    }

    return 'messages.field_required';
  }

  async sendEmailToRecoverPassword(){
    try {
      const response: GraphResponse = await this.userService.sendEmailRecoveryPassword( this.email?.value ?? '');
      console.log("🚀 ~ sendEmailToRecoverPassword ~ response", response);
      if (response.errors) throw (response.errors);
      if(response.data.forgotPassword == "An error occurred. Please try again later.") throw new Error("Error");
      // this.showInfo('Email sent successfully', 'If your email address exists in our database, you will receive a password recovery link to your email address within minutes.');
      this.sendEmailForm.reset();
      this.isShowFormEmail = false;
      this.isSuccessSendEmail = true;
      this.isShowCodes = true;
    } catch (error) {
      // this.globalService.showToast("An error occurred. Please try again later.");
      console.log("🚀 ~ sendEmailToRecoverPassword ~ error", error)
    }
  }

  resetErrCode(){
    this.isInvalidCode = false;
  }

  async sendCode(){
    this.codeForm.markAllAsTouched()
    this.sended = true;
    if(this.codeForm.invalid) return;
    const isValid:boolean = await this.verifyCode();
    this.sended = false;
    if(!isValid) return this.isInvalidCode = true;
    this.isShowCodes = !this.isShowCodes;
  }

  async verifyCode(){
    this.isLoading = true;
    const { code } = this.codeForm.value;
    try {
      const response: GraphResponse = await this.userService.verifyCodeRecovery( code ?? '' );
      console.log("🚀 ~ verifyCode ~ response", response);
      if (response.errors) throw (response.errors);
      this.isInvalidCode = false;
      this.isLoading = false;
      return true;
    } catch (error) {
      this.isLoading = false;
      console.log("🚀 ~ verifyCode ~ error", error)
      return false;
    }
  }

  async updatePassword(){
    this.formUpdatePassword.markAllAsTouched()
    if(this.formUpdatePassword.invalid) return;

    if(this.confirm_password?.value !== this.new_password?.value) return;

    try {
      const { new_password } = this.formUpdatePassword.value;
      console.log("🚀 ~ updatePassword ~ new_password", new_password, this.code?.value )
      const response: GraphResponse = await this.userService.resetPassword( new_password ?? '', this.code?.value ?? '' )
      if (response.errors) throw (response.errors);
      console.log("🚀 ~ updatePassword ~ response", response)
      this.globalService.showInfo({ msg: 'pages.recovery_passoword.password_update_success' })
      this.dialogRef.close();
    } catch (error) {
      this.globalService.showInfo({ title:"messages.title_err" ,msg: 'messages.global_err' });
      console.log("🚀 ~ updatePassword ~ error", error)
    }
  }

  async goAccountPage(user:UserAuth){
    const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));
    let route = 'account/options'
    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');
    // this.publicService.roleApp = resAuth.role;
    // this.firestoreService.observableChat( resAuth.id );
    this.authService.saveTokenAuth(user.api_token);
    this.authService.eventAuthUser.next( user );
    this.userService.setCurrentUser( user );
    this.dialogRef.close();
    this.router.navigateByUrl(translatedString);
  }
}