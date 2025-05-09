import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AccountOptionItem } from 'src/app/interfaces/public';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-menu-options',
  templateUrl: './menu-options.component.html',
  styleUrls: ['./menu-options.component.scss']
})
export class MenuOptionsComponent {

  optionsAccount: Array<AccountOptionItem> = [];

  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';
  constructor(
    private router: Router,
    public publicService: PublicService,
    private http: HttpClient,
    private lang: LangService,
  ){
    this.optionsAccount = this.publicService.optionsAccount;
  }

  async navigate(route:string){
    const response: any = await lastValueFrom(this.http.get(this?.lang?._locale === 'es' ? this?.routesEs : this?.routesEn));

    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');

    this.router.navigateByUrl(translatedString);
  }
}
