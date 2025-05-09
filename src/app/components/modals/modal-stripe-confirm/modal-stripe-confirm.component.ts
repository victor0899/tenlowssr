import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogData } from 'src/app/interfaces/public';
import { LangService } from 'src/app/services/lang.service';


@Component({
  selector: 'modal-stripe-confirm',
  templateUrl: './modal-stripe-confirm.component.html',
  styleUrls: ['./modal-stripe-confirm.component.scss']
})
export class ModalConfirmStripeComponent {

  constructor(
    public dialogRef: MatDialogRef<ModalConfirmStripeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private router: Router,
    private lang: LangService,
  ){}

}
