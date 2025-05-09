import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ParamModalConfirm } from 'src/app/interfaces/public';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss']
})
export class ModalConfirmComponent {

  title: string = '';
  title2: string = '';
  msg: string = '';
  txtOk: string = "";
  txtCancel: string = "";

  constructor(
    private dialogRef: MatDialogRef<ModalConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public params: ParamModalConfirm
  ){
    this.title = params.title;
    this.title2 = params.title2 ?? '';
    this.msg = params.msg;
    this.txtOk = params.txtOk ?? 'labels.continue';
    this.txtCancel = params.txtCancel ?? 'labels.cancel';
  }

  close(){
    this.dialogRef.close();
  }

  confirm(){
    this.dialogRef.close(true);
  }
}
