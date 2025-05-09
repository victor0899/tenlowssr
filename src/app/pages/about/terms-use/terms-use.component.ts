import { Component } from '@angular/core';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-terms-use',
  templateUrl: './terms-use.component.html',
  styleUrls: ['./terms-use.component.scss']
})
export class TermsUseComponent {

  locale: string = this.lang.getLocale;
  doc: string =  "/assets/docs/terms.pdf";

  constructor(
    private lang: LangService
  ){
    if (this.locale === "en"){
      this.doc = "/assets/docs/terms.pdf";
    }
  }
}
