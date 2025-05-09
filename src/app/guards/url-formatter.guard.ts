import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UrlFormatterService } from '../services/url-formatter.service';

@Injectable({
  providedIn: 'root'
})
export class UrlFormatterGuard implements CanActivate {
  constructor(
    private router: Router,
    private urlFormatter: UrlFormatterService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentUrl = decodeURIComponent(state.url);
    const segments = currentUrl.split('/').filter(Boolean);

    if (currentUrl.includes('?')) {
      console.log('URL con parámetros de consulta, no se formateará');
      return true;
    }
    const needsFormatting = segments.some(segment => {
      const formatted = this.urlFormatter.formatUrlString(segment);
      return segment !== formatted;
    });
    if (needsFormatting) {
      const formattedUrl = this.urlFormatter.formatPath(currentUrl);
      const localizedUrl = this.urlFormatter.getLocalizedPath(formattedUrl);

      console.log('URL Original:', currentUrl);
      console.log('URL Formateada:', formattedUrl);
      console.log('URL Localizada:', localizedUrl);

      const queryParams = route.queryParams;
      this.router.navigate([localizedUrl], {
        queryParams,
        replaceUrl: true
      });

      return false;
    }

    return true;
  }
}