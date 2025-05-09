import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { SocialLoginParams, TYPE_LOGIN } from 'src/app/interfaces/auth';
import { GraphResponse } from 'src/app/interfaces/graph';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'social-auth-buttons',
  templateUrl: './social-auth-buttons.component.html',
  styleUrls: ['./social-auth-buttons.component.scss']
})
export class SocialAuthButtonsComponent {

  isLoader: boolean = false;
  isLogin: boolean = false;
  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';

  constructor(
    private router: Router,
    private authService: AuthService,
    private globalService: GlobalService,
    private lang: LangService,
    private http: HttpClient,
    private userService: UserService
  ){
    this.isLogin = this.router.url.includes(this.lang._locale === 'es' ? 'acceso' : 'login');
    console.log("🚀 ~ this.isLogin:", this.isLogin)
  }

  async auth(){
    const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));
    let route = 'account/options'
    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');
    this.router.navigateByUrl(translatedString)
  }

  async authGoogle(){
    try {
      const response = await this.authService.googleAuth();
      console.log("🚀 ~ authGoogle ~ response:", response)
      if(!response) throw(response);
      if(!response.email && !response.login_google_id) return;
      this.socialLogin(response);
    } catch (error) {
      console.log("🚀 ~ authGoogle ~ error:", error);
      this.getErrMessage('google');
    }
  }

  async authFacebook(){
    try {
      const response = await this.authService.facebookAuth();
      console.log("🚀 ~ authGoogle ~ response:", response)
      if(!response) throw(response);
      if(!response.email && !response.login_facebook_id) return;
      this.socialLogin(response);
    } catch (error) {
      console.log("🚀 ~ authGoogle ~ error:", error);
      this.getErrMessage('google');
    }
  }

  getErrMessage(type: TYPE_LOGIN){
    const message = `components.social_auth.err_auth_${type}`;
    this.globalService.showInfo({
      msg: message
    });
  }


  async socialLogin( payload: SocialLoginParams){
    this.isLoader = true;
    try {
      const response: GraphResponse = await this.authService.socialAuth(payload);
      const resAuth = response.data.socialLogin;
      this.authService.saveTokenAuth(resAuth.api_token);

      this.isLoader = false;
      this.isLoader = true;

      this.authService.eventAuthUser.next( resAuth );
      this.userService.setCurrentUser( resAuth );
      this.router.navigateByUrl('account/options');

    } catch (error:any) {
      this.isLoader = false;
      this.globalService.showInfo({
        msg: 'messages.global_err'
      });
    }
  }
}
