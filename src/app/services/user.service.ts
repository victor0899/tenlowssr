import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subject, lastValueFrom } from 'rxjs';
import { PASSWORD_CODE_CHECK, RESET_RECOVERY_PASSWORD, SEND_EMAIL_RECOVERY } from '../GraphQL/auth';
import { NavbarItems, NotificationEvent, Photo } from '../interfaces/public';
import { NotificationSettings, ParamsUpdateProfile, UserAuth } from '../interfaces/user';
import { GlobalService, } from './global.service';
import { CHANGE_EMAIL, CHANGE_PHONE, DELETE_ACCOUNT, DISABLED_ACCOUNT, GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS, GET_USER_AUTH, GET_USER_BY_ID, MARK_READ_NOTIFICATION, NOTIFICATIONS_SETTINGS_UPDATE, REMOVE_PROFILE_FAVORITE, REQUEST_CODE_PHONE_CHANGE, SEND_CODE_CHANGE_EMAIL, SET_PROFILE_FAVORITE, TREE_NATION_STATS, UPDATE_PASSWORD, UPDATE_PROFILE, UPDATE_PROFILE_IMG, VERIFY_EMAIL_USER } from '../GraphQL/user';
import { CityData, StateData } from '../interfaces/countries';
import { GraphResponse } from '../interfaces/graph';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser?: UserAuth;
  unreadNotifications: number = 0;
  menuOptions: Array<NavbarItems> = [
    {
      label: 'labels.my_profile',
      route: 'profile-user'
    },
    {
      label: 'pages.manage_products.my_products',
      route: 'products/manage-products'
    },
    {
      label: 'components.navbar.upload_prod',
      route: 'products/add-product'
    },
    {
      label: 'pages.account.notifications',
      route: 'account/notifications-panel'
    },
    {
      label: 'pages.account.favorites',
      route: 'account/favorites-panel'
    },
    {
      label: 'components.navbar.tablon',
      route: 'tablon'
    },
    {
      label: 'components.navbar.about_us',
      route: 'about'
    }
  ];

  evntReduceNotification = new Subject<NotificationEvent>();

  private _listStates: StateData[] = [];
  public get listStates(): StateData[] {
    return this._listStates;
  }
  public set listStates(value: StateData[]) {
    this._listStates = value;
  }
  // *****************************************
  private _listCities: CityData[] = [];
  public get listCities(): CityData[] {
    return this._listCities;
  }
  public set listCities(value: CityData[]) {
    this._listCities = value;
  }

  constructor(
    private apollo: Apollo,
    private globalService: GlobalService
  ) { }

  setCurrentUser(user: UserAuth){
    this.currentUser = user;
    this.globalService.saveData(this.globalService.STORAGE_USER, user);
  }

  getCurrentUser(){
    if(this.currentUser) return this.currentUser;
    ;this.currentUser = this.globalService.getData(this.globalService.STORAGE_USER)
    return this.currentUser;
  }

  async sendEmailRecoveryPassword(email:string){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SEND_EMAIL_RECOVERY,
        variables: {
          email
        }
      })
    );
    return response;
  }

  async verifyCodeRecovery(code:string){
    const response: any  = await lastValueFrom(
      this.apollo.mutate({
        mutation: PASSWORD_CODE_CHECK,
        variables: { code }
      })
    );

    return response;
  }

  async resetPassword(password:string, code:string){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: RESET_RECOVERY_PASSWORD,
        variables: {
          password,
          code
        }
      })
    );

    return response;
  }

  async getAllNotifications(page:number){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_NOTIFICATIONS,
        variables: {
          page
        }
      })
    );

    return response;
  }

  async updateProfile(payload: ParamsUpdateProfile){

    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: UPDATE_PROFILE,
        variables: payload
      })
    );

    return response;
  }

  async getAuthUser(){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_USER_AUTH,
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async getUserById(idUser: string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_USER_BY_ID,
        variables: {
          id: idUser
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async setFavoriteProfile( idUser: string ){
    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SET_PROFILE_FAVORITE,
        variables:{
          id: idUser
        }
      })
    );
    return response;
  }

  async removeFavoriteProfile( idUser: string ){
    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: REMOVE_PROFILE_FAVORITE,
        variables:{
          id: idUser
        }
      })
    );
    return response;
  }

  async updateImageProfile( image: Photo ){

    const blobImg = this.globalService.dataURIToBlob( image?.dataUrl ?? '' );
    const fileImg: File = new File( [blobImg], `profile-img-${Date.now()}.${image.format}`);

    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: UPDATE_PROFILE_IMG,
        variables:{
          image: fileImg
        }
      })
    );

    return response;
  }

  async sendCodeEmailChange(  email:string ){

    const response: any = await lastValueFrom(
      this.apollo.query({
        query: SEND_CODE_CHANGE_EMAIL,
        variables: { email },
        errorPolicy: 'all'
      })
    );

    return response;
  }
  async verifyEmail(  code:string ){

    const response: any = await lastValueFrom(
      this.apollo.query({
        query: VERIFY_EMAIL_USER,
        variables: { code },
        errorPolicy: 'all'
      })
    );

    return response;
  }

  async changeEmail(code: string, email:string){
    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: CHANGE_EMAIL,
        variables:{
          code,
          email
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async updatePassword( oldPassword: string, newPassword:string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: UPDATE_PASSWORD,
        variables:{
          oldPassword,
          newPassword
        }
      })
    );

    return response;
  }

  async setNotificationSettings(payload:NotificationSettings){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation:NOTIFICATIONS_SETTINGS_UPDATE,
        variables: payload
      })
    );
    return response;
  }

  async setReadNotification( idNotification: string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation:MARK_READ_NOTIFICATION,
        variables: {
          id: idNotification
        }
      })
    );
    return response;
  }

  async _getAllUnreadNotifications(){
    const response:any = await lastValueFrom(
      this.apollo.query({
          query:GET_UNREAD_NOTIFICATIONS
      })
    );

    return response;
  }


  async getUnreadNotifications(){
    try {
      const response:GraphResponse = await this._getAllUnreadNotifications();
      const {  unreadNotifications } = response.data;
      this.unreadNotifications = unreadNotifications.length;
      this.evntReduceNotification.next({ isReduce: false, total: this.unreadNotifications });
    } catch (error) {
      console.log("🚀 ~ getUnreadNotifications ~ error:", error)
    }
  }

  async disabledAccount(password: string){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: DISABLED_ACCOUNT,
        variables: {
          password
        }
      })
    );

    return response;
  }

  async deleteAccount(password: string){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: DELETE_ACCOUNT,
        variables: {
          password
        }
      })
    );

    return response;
  }

  async requestCodeChangePhone(){

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: REQUEST_CODE_PHONE_CHANGE,
        errorPolicy: 'all'
      })
    );

    return response;
  }

  async changePhone(code: string, phone:string, codeCountry: string){
    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: CHANGE_PHONE,
        variables:{
          phone,
          phone_country_code: codeCountry
        }
      })
    );
    return response;
  }

  async getTreeNationStats(){

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: TREE_NATION_STATS
      })
    );

    return response;
  }
}
