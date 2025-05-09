import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogData } from 'src/app/interfaces/public';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-alert-cookies',
  templateUrl: './alert-cookies.component.html',
  styleUrls: ['./alert-cookies.component.scss']
})
export class AlertCookiesComponent {
  constructor(
    private router: Router,
    private globalService: GlobalService,
    public dialogRef: MatDialogRef<AlertCookiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ){}

  goCookiesInfo(){
    window.location.href = 'https://tenlow.es/cookies/'
    // this.router.navigate(['about/cookies']);
  }

  close(){
    localStorage.setItem( this.globalService.STORAGE_MODAL_COOKIES, 'close' );
    this.dialogRef.close();
  }
}
