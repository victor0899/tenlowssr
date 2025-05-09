import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GraphResponse } from 'src/app/interfaces/graph';
import { UserAuth } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-email',
  templateUrl: './update-email.component.html',
  styleUrls: ['./update-email.component.scss']
})
export class UpdateEmailComponent implements OnInit {
  userCurrent?: UserAuth;
  cssFloatLabel:string = "";
  cssInputTxt:string = "";
  cssSpanValidation:string = "";
  isLoad:boolean = false;
  isChangeEmail: boolean = false;
  isVerifyEmail: boolean = false;
  isVerifyNewEmail: boolean = false;
  isSend: boolean = false;

  formVerifyEmail = this.form.group({
    code: ['', [Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.maxLength(5)]],
  });

  formUpdateEmail = this.form.group({
    newEmail: ['', [Validators.required, Validators.email]]
  });

  formVerifyChangeEmail = this.form.group({
    code: ['', [Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.maxLength(5)]],
    newEmail: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private form: FormBuilder,
    private userService: UserService,
    private globalService: GlobalService,
    private authService: AuthService,
    private lang: LangService,
    public publicService: PublicService,
    public dialogRef: MatDialogRef<UpdateEmailComponent>,
  ){
    this.userCurrent = this.userService.currentUser;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-input-label";
    this.cssInputTxt = this.publicService.cssInputBase + " focus:border-input-border";
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + " text-tl-dark-medium";
  }

  ngOnInit(){
    // this.sendCodeEmailVerification();
  }

  openUpdate(){
    this.isChangeEmail = true;
  }

  openVerify(){
    this.isVerifyEmail = true;
  }

  getErrorLabel( formField:string ){

    let inputCtrl = this.formVerifyEmail.get(formField);

    if( this.isChangeEmail ){
      inputCtrl = this.formUpdateEmail.get(formField);
    }

    if( this.isVerifyNewEmail ){
      inputCtrl = this.formVerifyChangeEmail.get(formField);
    }

    if(!inputCtrl?.touched) return '';

    if(!inputCtrl?.value) return 'messages.field_required';

    if(inputCtrl?.value == '') return 'messages.field_required';

    if(inputCtrl?.invalid) return 'messages.enter_valid_field';

    if(inputCtrl.errors){
      if(inputCtrl.errors['maxlength']) return 'components.update_email.limit_length_code';
    }

    return '';
  }

  async sendCodeEmailVerification(){
    try {
      this.isSend = true;
      const response: GraphResponse = await this.userService.sendCodeEmailChange( this.userCurrent?.email! );
      console.log("🚀 ~ sendCodeEmailVerification ~ response:", response)
      if(response.errors) throw(response.errors);
      this.openVerify();
    } catch (error) {
      console.log("🚀 ~ sendCodeEmailVerification ~ error:", error)
      // this.dialogRef.close();
      this.globalService.showToast( this.lang._('messages.global_err'), this.lang._('labels.close'), 'top' );
    } finally {
      this.isSend = false;
    }
  }
  async verifyEmail(){
    try {
      this.formVerifyEmail.markAllAsTouched()
      this.isSend = true;
      const response: GraphResponse = await this.userService.verifyEmail( this.formVerifyEmail.value.code! );
      console.log("🚀 ~ sendCodeEmailVerification ~ response:", response)
      if(response.errors) throw(response.errors);

      this.userCurrent!.email_verified_at = new Date();
      this.userService.setCurrentUser(this.userCurrent!);
      this.authService.eventAuthUser.next( this.userCurrent );

      this.dialogRef.close();

      this.globalService.showInfo({
        msg: 'components.update_email.email_verify_success'
      });

    } catch (error) {
      console.log("🚀 ~ sendCodeEmailVerification ~ error:", error)
      // this.dialogRef.close();
      this.globalService.showToast( this.lang._('messages.global_err'), this.lang._('labels.close'), 'top' );
    } finally {
      this.isSend = false;
    }
  }

  async sendCodeEmailChange(){
    try {
      this.formUpdateEmail.markAllAsTouched()
      this.isSend = true;
      const response: GraphResponse = await this.userService.sendCodeEmailChange( this.formUpdateEmail.value.newEmail! );
      console.log("🚀 ~ sendCodeEmailChange ~ response:", response)
      if(response.errors) throw(response.errors);
      this.openVeirfyCodeNewEmail();
    } catch (error) {
      console.log("🚀 ~ sendCodeEmailChange ~ error:", error)
      this.globalService.showToast( this.lang._('messages.global_err'), this.lang._('labels.close'), 'top' );
    } finally {
      this.isSend = false;
    }
  }

  async openVeirfyCodeNewEmail(){
    const {  newEmail } = this.formVerifyChangeEmail.controls;
    newEmail.setValue( this.formUpdateEmail.value.newEmail! );
    this.isVerifyNewEmail = true;
  }

  async updateEmail(){
    this.formVerifyChangeEmail.markAllAsTouched()
    this.isSend = true;
    try {
      const { code, newEmail } = this.formVerifyChangeEmail.value;
      const response: GraphResponse = await this.userService.changeEmail(code!, newEmail!);

      console.log("🚀 ~ updateEmail ~ response:", response);

      if(response.errors) throw(response.errors);
      if(!this.userCurrent) throw('NO AUTH USER');

      const { 0:value , 1:msg  } = response.data.changeEmail;

      if(value !== '1'){
        this.isSend = false;
        return this.globalService.showInfo({msg});
      }

      this.userCurrent!.email = newEmail!;
      this.userService.setCurrentUser(this.userCurrent);
      this.authService.eventAuthUser.next( this.userCurrent );

      this.dialogRef.close();
      this.isSend = false;
      this.globalService.showInfo({
        msg: 'components.update_email.email_update_success'
      });

    } catch (error) {
      this.isSend = false;
      console.log("🚀 ~ updateEmail ~ error:", error)
      this.globalService.showToast( this.lang._('messages.global_err'), this.lang._('labels.close'), 'top' );
    }
  }
}
