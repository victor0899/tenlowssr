import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphResponse } from 'src/app/interfaces/graph';
import { OperationsAccount, OptionDeleted, ReasonDeleted } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent implements OnInit{

  txtOperation:string = '';
  isConfirm: boolean = false;
  isSuccessDelete: boolean = false;
  isShowLoader: boolean = false;
  isEnterPassword: boolean = false;
  isErrPassword: boolean = false;
  reasonSelected!: OptionDeleted;
  reasonEnum = ReasonDeleted;
  options: OptionDeleted[] = [
    {
      label: "components.delete_account.no_need_tenlow",
      value: ReasonDeleted.no_need,
    },
    {
      label: "components.delete_account.bad_experience",
      value: ReasonDeleted.bad_experience,
    },
    {
      label: "components.delete_account.found_other_app",
      value: ReasonDeleted.found_other_app,
    },
    {
      label: "components.delete_account.other",
      value: ReasonDeleted.other,
    }
  ];

  password:string = '';

  constructor(
    private dialogRef: MatDialogRef<DeleteAccountComponent>,
    private lang: LangService,
    public publicService: PublicService,
    private userService: UserService,
    private globalService: GlobalService,
    @Inject(MAT_DIALOG_DATA) public operation: OperationsAccount
  ){}

  ngOnInit(): void {
    let txt = '';
    if(this.operation == OperationsAccount.delete){
      txt = this.lang._('labels.deleted');
    } else {
      txt = this.lang._('labels.disabled');
    }
    this.txtOperation = txt.toLowerCase();
  }

  nextStep(){
    this.isConfirm = true;
  }
  confirm(){
    this.isEnterPassword = true;
  }

  close(){
    this.dialogRef.close(true);
  }

  getSuccessMsg(){
    if(this.operation == OperationsAccount.delete) return 'components.delete_account.account_deleted';

    return 'components.delete_account.account_disabled';
  }

  getTextInfo(){
    if(this.operation == OperationsAccount.delete) return 'components.delete_account.info_deleted_account';

    return 'components.delete_account.info_disabled_account';
  }

  confirmAction(){
    if(this.password.length < 6 ) {
      this.isErrPassword = true;
      return;
    }

    this.isShowLoader =  true;

    if(this.operation == OperationsAccount.delete){
      return this.deleteAccount();
    }

    this.disabledAccount();
  }

  async disabledAccount(){
    try {
      const response:GraphResponse = await this.userService.disabledAccount( this.password );
      console.log("🚀 ~ disabledAccount ~ response:", response)
      if(response.errors) throw(response.errors);

      const { disableAccount } = response.data;
      if( disableAccount[0] !== '1' ) {
        this.isShowLoader =  false;
        this.globalService.showToast(  disableAccount[1] , 'Ok', 'top');
        return;
      }

      this.isShowLoader =  false;
      this.isSuccessDelete = true;

    } catch (error) {
      this.isShowLoader =  false;
      console.log("🚀 ~ disabledAccount ~ error:", error);
      this.globalService.showToast(this.lang._('components.delete_account.err_disabled_account'), 'Ok', 'top');
    }
  }

  async deleteAccount(){
    try {
      const response:GraphResponse = await this.userService.deleteAccount( this.password );
      console.log("🚀 ~ deleteAccount ~ response:", response)
      if(response.errors) throw(response.errors);
      const { deleteAccount } = response.data;

      if( deleteAccount[0] !== '1' ) {
        this.isShowLoader =  false;
        this.globalService.showToast(  deleteAccount[1] , 'Ok', 'top');
        return;
      }

      this.isShowLoader =  false;
      this.isSuccessDelete = true;

    } catch (error) {
      this.isShowLoader =  false;
      console.log("🚀 ~ disabledAccount ~ error:", error);
      this.globalService.showToast(this.lang._('components.delete_account.err_delete_account'), 'Ok', 'top');
    }
  }
}
