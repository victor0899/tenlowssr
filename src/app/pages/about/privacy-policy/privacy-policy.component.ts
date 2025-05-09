import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TypePrivacy } from 'src/app/interfaces/public';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {

  locale: string = this.lang.getLocale;
  type!:TypePrivacy;
  constructor(
    private router: Router,
    private lang: LangService,
  ){
    this.getTypeScreen();
  }

  getTypeScreen(){
    const { url } = this.router;

    if( url.includes('legal')){
      return this.type = 'legal';
    }

    if( url.includes('cookies')){
      return this.type = 'cookies';
    }

    return this.type = 'privacy';
  }
}
