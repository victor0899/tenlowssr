import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: 'no-results',
  templateUrl: './no-results.component.html',
  styleUrls: ['./no-results.component.scss']
})
export class NoResultsComponent {
  /**
   * Translation key with a custom message @default 'pages.store.no_results'
   */
  
  @Input() message: string = 'pages.store.no_results';
  @Input() status: boolean = true;

  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';
  constructor(
    private router: Router,
    private http: HttpClient,
    private lang: LangService,
  ){

  }
  async navigate(route:string){
    const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));

    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');
    this.router.navigateByUrl(translatedString);
  }
}
