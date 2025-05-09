import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {MatSnackBar, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DialogData, Photo, TypeShared } from '../interfaces/public';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalInfoComponent } from '../components/modals/modal-info/modal-info.component';
import { SharedContentComponent } from '../components/modals/shared-content/shared-content.component';
import { LangService } from './lang.service';
import { AlertCookiesComponent } from '../components/alert-cookies/alert-cookies.component';
import { ModalConfirmStripeComponent } from '../components/modals/modal-stripe-confirm/modal-stripe-confirm.component';
import { ModalInfoBank } from '../components/modals/modal-info-bank/modal-info-bank.component';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  tokenAuth:string = "";
  urlBase: string = environment.apiURL;
  // Stores user data key
  STORAGE_USER: string = 'tenlow:user';
  // Store session token key.
  STORAGE_TOKEN_AUTH: string = 'tenlow:token-auth';
  // STORAGE_TERMINS_POLICIES: string = 'tenlow:termins-policies';
  // Store language key
  STORAGE_LOCALES: string = 'tenlow:locales';
  // Stores the keys for translations
  STORAGE_LANG: string = 'tenlow:lang';
  // Store the key version of the translations.
  STORAGE_LANG_TIME_VERSION: string = 'tenlow:lang-time-version';
  // Store information of Apple Login
  STORAGE_APPLE_USER: string = 'apple-data-user';
  // Store Shipping DATA
  STORAGE_SHIPPING: string = 'tenlow:checkout';
  // Store checkout product
  STORAGE_CHECKOUT_DATA: string = 'tenlow:checkout-data';
  // Store if user rating tenlow
  STORAGE_RATING_TENLOW: string = 'tenlow:is-rating';
  // Store if user rating tenlow
  STORAGE_MODAL_COOKIES: string = 'tenlow:modal-cookies';
  // ///////
  refDevtoolDialog!: MatDialogRef<ModalInfoComponent, any>

  constructor(
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private lang: LangService
  ) { }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }

  public saveData(key: string, value: any) {
    const valueStr = JSON.stringify(value);
    localStorage.setItem(key, valueStr);
  }

  public getData(key: string) {
    const valueStr = localStorage.getItem(key) ?? '';

    if(valueStr.length > 0){
      return JSON.parse(valueStr);
    }

    return null;
  }

  public removeData(key: string) {
    localStorage.removeItem(key);
  }

  public clearData() {
    localStorage.clear();
  }

  showToast(message: string, action: string, position: MatSnackBarVerticalPosition = 'bottom') {
    return this._snackBar.open(message, action , {
      horizontalPosition: 'center',
      verticalPosition: position,
      duration: 6000
    });
  }

  showInfo(params: DialogData){
    console.log('parametros que se envian', params)
    const dialogRef = this.dialog.open(ModalInfoComponent, { data: params });
    return dialogRef;
  }

  showStripe(params: DialogData){
    const dialogRef = this.dialog.open(ModalConfirmStripeComponent, { data: params });
    return dialogRef;
  }

  showInfoBank(){
    const dialogRef = this.dialog.open(ModalInfoBank);
    return dialogRef;
  }



  showCookieAlert(params: DialogData){
    const dialogRef = this.dialog.open(
      AlertCookiesComponent,
      {
        data: params,
        maxWidth: '1400px',
        width: '90%',
        position: { bottom: '12px' },
        hasBackdrop: false
      }
    );
    return dialogRef;
  }

  showDevtoolsAlert(params: DialogData){
    if( !this.refDevtoolDialog ){
      this.refDevtoolDialog = this.dialog.open(
        ModalInfoComponent,
        {
          data: params,
          disableClose: true,
        }
      );
    }
  }

  processImage(imgFile:FileList): Promise<Photo>{
    return new Promise((resolve, reject) => {
      const imgUrl = URL.createObjectURL(imgFile[0]);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgBase64 = reader.result as string;
        const formatArr = imgFile[0].type.split('/');
        const img:Photo = {
          format: formatArr[1],
          saved: false,
          webPath: imgUrl,
          dataUrl: imgBase64
        };
        resolve(img)
      };
      reader.readAsDataURL(imgFile[0]);

      reader.onerror = e => {
        reject(e);
      }
    });
  }

  dataURIToBlob(dataURI: string): Blob {
    const splitDataURI = dataURI.split(',');
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  validateDNI(dni:string) {

    const letterList = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const regExp = /^\d{8}[a-zA-Z]$/;

    if (!regExp.test(dni)) {
      return false;
    }

    const number = parseInt(dni.substr(0, dni.length - 1), 10);
    const expectedLetter = letterList[number % 23];
    const letter = dni.substr(dni.length - 1, 1);

    return letter.toUpperCase() === expectedLetter;
    // let letter, letterDNI;
    // let numberDNI:any;
    // let regExpDni = /^[XYZ]?\d{5,8}[A-Z]$/;

    // dni = dni.toUpperCase();

    // // DNI FORMATO INCORRECTO
    // if(!regExpDni.test(dni)) {
    //   // console.log('DNI FORMATO INCORRECTO');
    //   return false;
    // }

    // numberDNI = dni.substring(0,dni.length-1);
    // numberDNI = numberDNI.replace('X', 0);
    // numberDNI = numberDNI.replace('Y', 1);
    // numberDNI = numberDNI.replace('Z', 2);
    // letter = dni.substring(dni.length - 1, 1);
    // numberDNI = numberDNI % 23;
    // letterDNI = 'TRWAGMYFPDXBNJZSQVHLCKET';
    // letterDNI = letterDNI.substring(numberDNI, numberDNI+1);

    // if (letterDNI != letter) {
    //   // console.log('Dni erroneo, la letra del NIF no se corresponde');
    //   return false;
    // }

    // // console.log('Dni correcto');
    // return true;

    // if (/^\d{8}[a-zA-Z]$/.test(dni)) {
    //   let n = dni.substring(0,8);
    //   let c = dni.substring(8,1);
    //   return (c.toUpperCase() == 'TRWAGMYFPDXBNJZSQVHLCKET'.charAt(parseInt(n) % 23)); // DNI correcto
    // }
    // return false; // DNI incorrecto
  }

  shareContent( type:TypeShared ){
    if (navigator.share) {
      const title = type == TypeShared.profile ? 'components.shared.shared_product' : 'components.shared.shared_profile';
      const typeLbl = type == TypeShared.product ? 'producto' : 'perfil'

      navigator.share({
        title: this.lang._(title),
        text: this.lang._('components.shared.look_this_interest_tenlow',{type:typeLbl}),
        url: location.href
      }).then(() => {
        console.log('Thanks for sharing!');
      })
      .catch(console.error);

    } else {
      this.dialog.open( SharedContentComponent , { data: type })
    }
  }
}
