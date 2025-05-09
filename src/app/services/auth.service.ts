import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { lastValueFrom, Subject } from 'rxjs';
import { AUTH_USER, LINK_SOCIAL_ACCOUNT, SIGNUP_USER, SOCIAL_LOGIN } from '../GraphQL/auth';
import { SignupParams, SocialLoginParams, TYPE_LOGIN, UserFacebook } from '../interfaces/auth';
import { UserAuth } from '../interfaces/user';
import { GlobalService } from './global.service';
import { UserService } from './user.service';
import { GoogleAuthProvider , UserCredential, getAuth, signInWithPopup, signOut, FacebookAuthProvider} from "firebase/auth";
import { ProductService } from './product.service';
import { HttpClient } from '@angular/common/http';
import { LangService } from './lang.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  FACEBOOK_PERMISSIONS: string[] = [
    'email',
    'user_birthday',
    'user_photos',
    'user_gender',
  ];
  URL_GRAPH_FACEBOOK = 'https://graph.facebook.com';
  FIELDS_GRAPH_FACEBOOK = "fields=first_name,last_name,email,picture.type(large)";

  // APPLEID_OPTS:SignInWithAppleOptions = {
  //   clientId: 'com.fidbaq.app',
  //   redirectURI: '',
  //   scopes: 'email name',
  //   state: '12345',
  //   nonce: 'nonce',
  // };

  eventAuthUser = new Subject<UserAuth | undefined>();
  private _emailToVerify: string = '';
  tokenAuth: string = "";

  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';

  constructor(
    private http: HttpClient,
    private router: Router,
    private apollo: Apollo,
    private globalService: GlobalService,
    private userService: UserService,
    private productService: ProductService,
    private lang: LangService,
  ) { }

  saveTokenAuth(token:string){
    this.tokenAuth = token;
    this.globalService.saveData(this.globalService.STORAGE_TOKEN_AUTH, token);
  }

  getTokenAuth(){
    this.tokenAuth = this.globalService.getData(this.globalService.STORAGE_TOKEN_AUTH);
    return this.tokenAuth;
  }

  async logout(){
    const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));
    let route = 'auth/login'
    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');
    const user = this.userService.currentUser;
    const auth = getAuth();

    if(user?.type_login !== 'email') await signOut(auth);

    this.router.navigateByUrl(translatedString);
    this.globalService.clearData();
    this.productService.clearProducts();
    this.userService.unreadNotifications = 0;
    this.userService.currentUser = undefined;
    this.eventAuthUser.next(undefined);
    return;
  }

  async authUser(email: string, password:string) {
    const response:any = await lastValueFrom(
      this.apollo.mutate<any>({
       mutation: AUTH_USER,
       variables: {
         email,
         password
       },
       errorPolicy: 'all'
     })
    );
    return response;
  }

  async signupUser(payload:SignupParams){
    const { email, last_name, name, password, phone, phone_country_code } = payload;
    const response:any = await lastValueFrom(
      this.apollo.mutate<any>({
        mutation: SIGNUP_USER,
        variables:{
          email,
          password,
          last_name,
          name,
          phone,
          phone_country_code
        },
        errorPolicy: 'all'
      })
    );
    return response;
}

  async linkedSocialAccount( idSocial: string, type: TYPE_LOGIN ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: LINK_SOCIAL_ACCOUNT,
        variables:{
          id: idSocial,
          type
        }
      })
    );

    return response;
  }
  ///************************************* */

  async socialAuth(payload:SocialLoginParams ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SOCIAL_LOGIN,
        variables: payload
      })
    );

    return response;
  }

  async googleAuth(): Promise<SocialLoginParams | null>{
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth();
      auth.languageCode = 'es';
      const response:UserCredential =  await signInWithPopup(auth, provider)
      if(!response) throw('No select user');
      const credential  = GoogleAuthProvider.credentialFromResult(response);
      if(!credential) throw('No credential user');
      const googleUser = response.user;

      console.log("🚀 ~ googleAuth ~ user:", googleUser);

      let payload:SocialLoginParams = {
        name: googleUser.displayName ?? '',
        last_name: '',
        login_google_id: googleUser.uid,
        email: googleUser.email ?? '',
        type_login: 'google',
        role: 'client',
        photo: googleUser.photoURL ?? ''
      };

      return payload;
    } catch ( error: any ) {
      console.log("🚀 ~ googleAuth ~ error:", error);

      if('code' in error){
        if(error.code == "auth/popup-closed-by-user") return error.code;
      }

      return null;
    }
  }

  async facebookAuth(): Promise<SocialLoginParams | null>{
    try {
      const provider = new FacebookAuthProvider();

      provider.addScope('public_profile');
      provider.addScope('email');

      const auth = getAuth();
      auth.languageCode = 'es';

      const response:UserCredential =  await signInWithPopup(auth, provider)
      if(!response) throw('No select user');

      const fbUser = response.user;
      const credential = FacebookAuthProvider.credentialFromResult(response);
      const accessToken = credential?.accessToken ?? '';
      const completeData = await this.getCompleteFacebookUser( accessToken, fbUser.providerData[0].uid );

      let payload:SocialLoginParams = {
        name:  completeData?.first_name ?? fbUser.displayName ?? '',
        last_name: completeData?.last_name ?? '',
        login_facebook_id: fbUser.uid,
        email: fbUser.email ?? '',
        type_login: 'facebook',
        role: 'client',
        photo: completeData?.picture.data.url ?? fbUser.photoURL ?? ''
      };

      return payload;

    } catch (error:any) {

      console.log("🚀 ~ facebookAuth ~ error:", error)

      if('code' in error){
        return error.code;
      }

      return null;
    }
  }

  async getCompleteFacebookUser(token:string, uid: string){
    try {
      const response:UserFacebook = await lastValueFrom<any>(
        this.http.get(`${this.URL_GRAPH_FACEBOOK}/${uid}?${this.FIELDS_GRAPH_FACEBOOK}&access_token=${token}`)
      );
      console.log("🚀 ~ getCompleteFacebookUser ~ response:", response);
      return response;
    } catch (error) {
      console.log("🚀 ~ getCompleteFacebookUser ~ error:", error)
      return null;
    }
  }
}
