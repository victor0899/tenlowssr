import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { DeleteAccountComponent } from 'src/app/components/modals/delete-account/delete-account.component';
import { ModalConfirmComponent } from 'src/app/components/modals/modal-confirm/modal-confirm.component';
import { UpdateEmailComponent } from 'src/app/components/modals/update-email/update-email.component';
import { UpdatePasswordComponent } from 'src/app/components/modals/update-password/update-password.component';
import { UpdatePhoneComponent } from 'src/app/components/modals/update-phone/update-phone.component';
import { TYPE_LOGIN } from 'src/app/interfaces/auth';
import { GraphResponse } from 'src/app/interfaces/graph';
import { NotificationToggle, ParamModalConfirm } from 'src/app/interfaces/public';
import { ItemViewProfile, NotificationSettings, OperationsAccount, User, UserAuth, VIEWS_SETTING_USER } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-configuration-account',
  templateUrl: './configuration-account.component.html',
  styleUrls: ['./configuration-account.component.scss']
})
export class ConfigurationAccountComponent {

  VIEWS = VIEWS_SETTING_USER;
  currentView: VIEWS_SETTING_USER | null = null;
  cssInputToggle:string = "";
  cssFloatLabel:string = "";
  cssInputTxt:string = "";
  cssSpanValidation:string = "";

  optionsFieldsEdit: Array<ItemViewProfile> = [
    {
      title: "pages.configuration_account.security_verifications",
      subtitle: "pages.configuration_account.security_verifications_info",
      view: VIEWS_SETTING_USER.SECURITY
    },
    {
      title: "pages.configuration_account.connect_social",
      subtitle: "pages.configuration_account.connect_social_info",
      view: VIEWS_SETTING_USER.SOCIAL
    },
    {
      title: "pages.configuration_account.disables_account",
      subtitle: "pages.configuration_account.disables_account_info",
      view: VIEWS_SETTING_USER.ACCOUNT
    }
  ];

  favoritesNotifications: Array<NotificationToggle> = [
    {label:"pages.configuration_account.discount_prod_favorites", value: false},
    {label:"pages.configuration_account.favorites_rentals", value: false},
    {label:"pages.configuration_account.booking_fav_products", value: false},
    {label:"pages.configuration_account.new_products_of_fav", value: false},
  ];

  newsNotifications: Array<NotificationToggle> = [
    {label:"pages.configuration_account.receive_promotions", value: false},
    {label:"pages.configuration_account.receive_tips", value: false},
  ];

  showEditEmail: boolean = false;
  user?: UserAuth;
  notificationSettings:NotificationSettings = {
    user_id: '',
    expired_products: false,
    price_change_favorite_products: false,
    rented_sold_favorites: false,
    added_your_products_favorites: false,
    products_published_favorite_profiles: false,
    promotions_and_news: false,
    tips_and_suggestions: false,
    unsubscribe: false
  };
  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';
  mobileQuery!: MediaQueryList;
  private _mobileQueryListener!: () => void;
  isShowExpanded: boolean = false;
  isPressToggle:  boolean = false;

  constructor(
    private media: MediaMatcher,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private matDialog: MatDialog,
    public publicService: PublicService,
    private userService: UserService,
    private globalService: GlobalService,
    private authService: AuthService,
    private http: HttpClient,
    private lang: LangService
  ){
    this.cssInputToggle = this.publicService.cssInputToggle;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-input-label";
    this.cssInputTxt = this.publicService.cssInputBase + " focus:border-input-border";
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + " text-tl-dark-medium";
    this.user = this.userService.currentUser;
    this.setCurrentNotificationSettings();
    /// ***********************************
    if(window.innerWidth <= 767) this.isShowExpanded = true;
    this.mobileQuery = this.media.matchMedia('(max-width: 767px)');
    //**************
    this._mobileQueryListener = () => {

      if(this.mobileQuery.matches){
        this.isShowExpanded = true;
      } else {
        this.isShowExpanded = false;
      }

      this.changeDetectorRef.detectChanges();
    }
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  txtVerifiedPhone(){
    if(this.user?.personal_info?.phone) return 'labels.verified';

    return'labels.no_verified'
  }

  txtVerifiedEmail(){
    if(this.user?.email_verified_at) return 'labels.verified';

    return'labels.no_verified'
  }

  setCurrentNotificationSettings(){
    if(!this.user) return;
    if(!this.user.notificationSettings) return;

    this.notificationSettings = this.user.notificationSettings;

    if(!this.notificationSettings) return;

    const { added_your_products_favorites, products_published_favorite_profiles,price_change_favorite_products,
            promotions_and_news, rented_sold_favorites, tips_and_suggestions } = this.notificationSettings;
    //discount_prod_favorites
    this.favoritesNotifications[0].value = price_change_favorite_products;
    // favorites_rentals
    this.favoritesNotifications[1].value = rented_sold_favorites;
    // booking_fav_products
    this.favoritesNotifications[2].value = added_your_products_favorites;
    // new_products_of_fav profiles
    this.favoritesNotifications[3].value = products_published_favorite_profiles;
    // receive_promotions
    this.newsNotifications[0].value = promotions_and_news;
    // receive_tips
    this.newsNotifications[1].value = tips_and_suggestions;
  }

  selectView(view:VIEWS_SETTING_USER){
    this.currentView = view;
  }

  async back(){
    const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));
    let route = 'account/options'
    let segments = route.split('/');

    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });

    let translatedString = translatedSegments.join('/');
    this.router.navigate([translatedString]);
  }

  onChangeAccountSettings(event:MatRadioChange){
    console.log("🚀 ~ onChangeAccountSettings ~ event:", event)

    const { value } = event;
    let ref!: MatDialogRef<DeleteAccountComponent, any>;

    if(value == 'disabled'){
      ref = this.matDialog.open(DeleteAccountComponent, {
        data: OperationsAccount.disable
      });
    }


    if(value == 'delete'){
      ref = this.matDialog.open(DeleteAccountComponent, {
        data: OperationsAccount.delete
      });
    }

    ref.afterClosed().subscribe( (resp:boolean) => {

      if(!resp) return;

      this.authService.logout();

    });
  }

  cancelEdit(){
    this.showEditEmail = false;
  }

  openModalUpdatePhone(){
    const ref = this.matDialog.open(UpdatePhoneComponent,{
      disableClose: true
    });
  }

  openModalUpdatePassword(){
    const ref = this.matDialog.open(UpdatePasswordComponent, {
      disableClose: true
    });
  }

  openModalUpdateEmail(){
    const ref = this.matDialog.open(UpdateEmailComponent, {
      disableClose: true
    });
  }

  async onChangeNotiticationSettings(){
    this.isPressToggle =  true;
    console.log('HERE', this.notificationSettings);
    await this.updateNotificationSettings();
    setTimeout(() => this.isPressToggle = false , 800);
  }


  modalConfirmDisabledAllNotification(){
    const confirmModal:ParamModalConfirm = {
      title: 'pages.notifications.are_sure',
      msg: 'pages.notifications.info_remove_notification',
      txtOk: "pages.notifications.remove_all_notification"
    }
    const ref = this.matDialog.open(ModalConfirmComponent, {
      data: confirmModal
    });

    ref.afterClosed().subscribe( async resp =>  {
      if(resp){
        await this.onChangeNotiticationSettings();
        this.notificationSettings.unsubscribe = !this.notificationSettings.unsubscribe;
      }
    });
  }

  setPayloadUpdateNotificationSettings(){

    const payload:NotificationSettings = {
      user_id: this.user!.id,
      expired_products: this.notificationSettings!.expired_products,
      price_change_favorite_products: this.favoritesNotifications[0].value,
      rented_sold_favorites: this.favoritesNotifications[1].value,
      added_your_products_favorites: this.favoritesNotifications[2].value,
      products_published_favorite_profiles: this.favoritesNotifications[3].value,
      promotions_and_news: this.newsNotifications[0].value,
      tips_and_suggestions: this.newsNotifications[1].value,
      unsubscribe: this.notificationSettings!.unsubscribe,
    };

    console.log("🚀 ~ setPayloadUpdateNotificationSettings ~ payload:", payload)

    return payload;
  }
  async updateNotificationSettings(){
    try {
      if(!this.user) return;
      const param = this.setPayloadUpdateNotificationSettings();
      const response:GraphResponse = await this.userService.setNotificationSettings(param);
      console.log("🚀 ~ updateNotificationSettings ~ response:", response)
      this.user.notificationSettings = param;
      this.userService.setCurrentUser( this.user );
    } catch (error) {
      console.log("🚀 ~ updateNotificationSettings ~ error:", error)
    }
  }

  ////****************************************************************************
  isLinkedGoogle(){
    if(!this.user) return false;
    const { login_google_id, type_login } = this.user;
    return login_google_id ||  type_login == 'google';
  }

  isLinkedFaceboook(){
    if(!this.user) return false;
    const { login_facebook_id, type_login } = this.user;
    return  login_facebook_id ||  type_login == 'facebook';
  }

  linkedGoogle(){
    if(!this.user) return;

    if(this.isLinkedGoogle()) return;

    this.getPayloadGoogle();
  }

  linkedFacebook(){
    if(!this.user) return;

    if(this.isLinkedFaceboook()) return;

    this.getPayloadFacebook();
  }

  async getPayloadGoogle(){
    try {
      const payload = await this.authService.googleAuth();

      if(!payload || !payload.login_google_id) throw('empty payload');

      const isLinked = await this.linkedSocial( payload.login_google_id, 'google' );

      if( isLinked ){
        this.user!.login_google_id = payload.login_google_id;
        this.userService.setCurrentUser(this.user!);
      }

    } catch (error) {
      console.log("🚀 ~ getPayloadGoogle ~ error:", error)
      this.globalService.showInfo({
        msg: 'pages.configuration_account.err_open_google'
      });
    }
  }

  async getPayloadFacebook(){
    try {
      const payload = await this.authService.facebookAuth();

      if(!payload || !payload.login_facebook_id ) throw('empty payload');

      const isLinked = await this.linkedSocial( payload.login_facebook_id , 'facebook' );

      if( isLinked ){
        this.user!.login_facebook_id = payload.login_facebook_id;
        this.userService.setCurrentUser(this.user!);
      }

    } catch (error) {
      console.log("🚀 ~ getPayloadGoogle ~ error:", error)
      this.globalService.showInfo({
        msg: 'pages.configuration_account.err_open_facebook'
      });
    }
  }

  async linkedSocial( idSocial: string, type: TYPE_LOGIN ){
    try {
      const response:GraphResponse = await this.authService.linkedSocialAccount( idSocial, type );
      if(response.errors) throw(response.errors);

      return true;
    } catch (error) {
      console.log("🚀 ~ linkedSocial ~ error:", error)
      let msg = 'pages.configuration_account.err_linked_social';

      if( error instanceof Array){
        msg = error[0].message ?? 'messages.global_err';

        if(msg  ==  "Internal server error"){
          msg = 'messages.global_err';
        }

      }

      this.globalService.showInfo({ msg });

      return false;
    }
  }
}
