import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { SeoService } from '../services/seo.service';

@Injectable({
  providedIn: 'root'
})
export class AdminDomainGuard implements CanActivate {
  constructor(private seoService: SeoService) {}

  canActivate(): boolean {
    if (window.location.hostname === 'admin.tenlow.es') {
      this.seoService.setNoIndex();
    }
    return true;
  }
}