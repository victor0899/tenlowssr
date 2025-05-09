import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LangService } from '../services/lang.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';
  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private lang: LangService,
  ) {}

  async canActivate(): Promise<boolean> {

    const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));
    let route = 'account/options'
    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');

    const tokenAuth: string = this.authService.getTokenAuth();
    console.log("🚀 ~ canActivate ~ tokenAuth:", tokenAuth)

    if(tokenAuth){
      this.router.navigateByUrl(translatedString);
      return false;
    }

    return true;
  }
}
