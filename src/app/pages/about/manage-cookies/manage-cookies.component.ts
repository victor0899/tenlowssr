import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieInfo } from 'src/app/interfaces/public';

@Component({
  selector: 'app-manage-cookies',
  templateUrl: './manage-cookies.component.html',
  styleUrls: ['./manage-cookies.component.scss']
})
export class ManageCookiesComponent {
  cookies: CookieInfo[] = [
    {
      name: 'app:user',
      description: 'components.cookies.cookie_user',
      provider: 'tenlow'
    },
    {
      name: 'app:token-auth',
      description: 'components.cookies.cookie_token',
      provider: 'tenlow'
    },
    {
      name: 'app:checkout-data',
      description: 'components.cookies.cookie_chekout',
      provider: 'tenlow'
    },
    {
      name: 'app:is-rating',
      description: 'components.cookies.cookie_rating',
      provider: 'tenlow'
    },
    {
      name: 'apple-data-user',
      description: 'components.cookies.cookie_apple',
      provider: 'tenlow'
    },
    {
      name: 'app:lang',
      description: 'components.cookies.cookie_lang',
      provider: 'tenlow'
    },
  ]
  constructor(
    private router: Router
  ){}

  save(){
    this.router.navigateByUrl('app/home');
  }
}
