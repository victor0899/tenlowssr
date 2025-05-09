import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { GraphResponse } from 'src/app/interfaces/graph';
import { UserAuth } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';
import { ModalRecoveryPasswordComponent } from '../modal-recovery-password/modal-recovery-password.component';

@Component({
  selector: 'app-modal-login',
  templateUrl: './modal-login.component.html',
  styleUrls: ['./modal-login.component.scss']
})
export class ModalLoginComponent {

  cssInputBase:string;
  cssFloatLabel:string;
  cssSpanValidation:string;
  sended:boolean= false;
  loginForm!: FormGroup;
  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';

  typePasswordInput: 'text' | 'password' = 'password';
  iconBtnEye: 'eye-outline' | 'eye-off-outline' = 'eye-outline';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    public publicService: PublicService,
    private globalService: GlobalService,
    private userService: UserService,
    private http: HttpClient,
    private lang: LangService,
    public dialogRef: MatDialogRef<ModalLoginComponent>
  ){
    this.cssInputBase = this.publicService.cssInputBase + ' border-tl-dark-medium';
    this.cssFloatLabel = this.publicService.cssFloatLabelBase + ' !text-xs text-tl-dark-gray';
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + ' text-tl-dark-gray !text-xs';
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.minLength(6), Validators.required]]
    });
  }

  changeTypeInput(){
    (this.typePasswordInput == 'password') ? this.typePasswordInput = 'text' : this.typePasswordInput = 'password';
    (this.iconBtnEye == 'eye-outline') ? this.iconBtnEye = 'eye-off-outline' : this.iconBtnEye = 'eye-outline';
  }

  openModalRecoeryPassword(){
    this.dialogRef.close();
    this.dialog.open(ModalRecoveryPasswordComponent, {
      disableClose: true
    });
  }

  get email(){
    return this.loginForm.get('email');
  }

  get password(){
    return this.loginForm.get('password');
  }

  getValidationEmailMsg(){

    if(this.email?.errors){
      const { errors } = this.email;
      if(errors['required']) return 'messages.field_required';

      if(errors['email']) return 'pages.login.enter_valid_email';
    }

    return 'messages.field_required';
  }

  getValidationPasswordMsg(){

    if(this.password?.errors){
      const { errors } = this.password;
      if(errors['required']) return 'messages.field_required';

      if(errors['minlength']) return 'pages.login.min_password_char';
    }

    return 'messages.field_required';
  }

  async validateForm(){
    this.loginForm.markAllAsTouched();
    this.sended = true;
    if(this.loginForm.invalid) return this.sended = false;
    await this.authUser();
  }

  async authUser(){
    try {

      const response: GraphResponse = await this.authService.authUser(this.email?.value, this.password?.value);
      console.log("🚀 ~ authUser ~ response", response);

      if(response.errors) throw (response.errors);

      const { login } = response.data;

      if( !login.email_verified_at ) {
        this.sended = false;
        this.globalService.showInfo({
          msg: this.lang._('messages.should_verify_email')
        });

        return;
      }

      this.goAccountPage(response.data.login);
    } catch (error:any) {

      this.sended = false;

      console.log("🚀 ~ authUser ~ error", error[0]);
      let msg:string = this.lang._('messages.global_err');

      if("message" in error[0]){
        msg = error[0].message;
      }

      console.log("🚀 ~ authUser ~ msg", msg)
      this.globalService.showToast(msg, this.lang._('labels.close'));
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
    await this.userService.getUnreadNotifications();
    this.authService.eventAuthUser.next( user );
    this.userService.setCurrentUser( user );
    this.sended = false;
    this.dialogRef.close();
    this.router.navigateByUrl(translatedString);
  }
}
