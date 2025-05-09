import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/interfaces/public';
@Component({
  selector: 'app-modal-info',
  template: `
    <h2 mat-dialog-title>Información</h2>
    <mat-dialog-content>
      <p>{{ data.msg | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="true">Aceptar</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./modal-info.component.scss']
})
export class ModalInfoComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    console.log('Mensaje recibido:', this.data.msg);
  }
}