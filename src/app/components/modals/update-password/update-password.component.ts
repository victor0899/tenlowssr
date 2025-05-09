import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GraphResponse } from 'src/app/interfaces/graph';
import { GlobalService } from 'src/app/services/global.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent {

  cssInputBase:string;
  cssFloatLabel:string;
  cssSpanValidation:string;
  sended:boolean = false;

  formUpdatePassword: FormGroup;

  constructor(
    private fb:FormBuilder,
    public publicService: PublicService,
    private userService: UserService,
    private globalService: GlobalService,
    public dialogRef: MatDialogRef<UpdatePasswordComponent>
  ){
    this.cssInputBase = this.publicService.cssInputBase;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase;
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + ' text-tl-dark-gray';
    this.formUpdatePassword = this.fb.group({
      old_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40), Validators.pattern(this.publicService.regExpPassword)]],
      new_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(40), Validators.pattern(this.publicService.regExpPassword)]],
    });
  }

  get new_password(){
    return this.formUpdatePassword.get('new_password')
  }

  get old_password(){
    return this.formUpdatePassword.get('old_password')
  }

  getValidationPasswordMsg(formField: string){
    const inputCtrl = this.formUpdatePassword.get(formField);

    if(inputCtrl?.errors){

      const { errors } = inputCtrl;

      if(errors['required']) return 'messages.field_required';

      if(errors['minlength']) return 'pages.login.min_password_char';

      if(errors['maxlength']) return 'pages.login.max_password_char';

      if(errors['pattern']) return 'pages.sign_up.err_pattern_password';
    }

    return 'messages.field_required';
  }

  async updatePassword(){
    this.formUpdatePassword.markAllAsTouched()
    this.sended = true;
    try {
      const { new_password, old_password } = this.formUpdatePassword.value;
      const response: GraphResponse = await this.userService.updatePassword(old_password, new_password);
      if(response.errors) throw(response.errors);
      const { 0: code , 1: msg} = response.data.changePassword;
      console.log("🚀 ~ updatePassword ~ response: value ", code, msg);

      if(code !== '1'){
        this.sended = false;
        return this.globalService.showInfo({msg});
      }

      this.sended = false;
      this.dialogRef.close();
      this.globalService.showInfo({
        msg: 'pages.recovery_passoword.password_update_success'
      });
    } catch (error) {
      this.sended = false;
      console.log("🚀 ~ updatePassword ~ error:", error);
      this.globalService.showInfo({
        title: 'messages.title_err',
        msg: 'messages.global_err'
      });
    }
  }
}
