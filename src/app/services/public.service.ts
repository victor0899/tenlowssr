import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { GET_CITIES_BY_STATE, GET_COUNTRIES, GET_STATES_BY_COUNTRY } from '../GraphQL/global';
import { Country, CountryData } from '../interfaces/countries';
import { AccountOptionItem, CategorieItem, DetailsItems, NavbarItems, SocialItem } from '../interfaces/public';
import { ViewsPaymentsInfo } from '../interfaces/payments';
import { FaqQuestions } from '../interfaces/user';
import { LangService } from './lang.service';
import devTools from 'devtools-detect';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  logo: string = "assets/images/logo.svg";
  iconAssets: string = "assets/icons/"
  defaultAvatar: string = "assets/images/user.jpeg"
  eventOpenDrawer = new Subject<boolean>();
  private _countries: Array<Country> = [];
  countryLocale: Array<CountryData> = [];

  private _navbarProfileItems: Array<NavbarItems> = [
    {
      label: 'labels.my_profile',
      route: 'profile-user',
    },
    {
      label: 'labels.mailbox',
      route: 'account/notifications-panel',
    },
    {
      label: 'pages.favorites.title',
      route: 'account/favorites-panel',
    },
    {
      label: 'labels.account',
      route: 'account',
    },
    {
      label: 'labels.help',
      route: 'profile-user/help',
    }
  ];

  private _navbarItems: Array<NavbarItems> = [
    {
      label: 'Alquilar',
      route: 'https://tenlow.es/alquilar/'
    }
];

private _navbarItemsAuth: Array<NavbarItems> = [
    {
      label: 'Alquilar',
      route: 'https://tenlow.es/alquilar/'
    }
];

  private _navbarItemsInfo: Array<NavbarItems> = [
    {
      label: 'components.navbar.tablon',
      route: 'tablon',
      isOpen: false,
    },
    {
      label: 'Más información',
      route: 'infoMenu',
      isOpen: false,
    },
    {
      label: 'Contacto',
      route: 'https://tenlow.es/contacto/',
      isOpen: false,
    },
  ];

  private _tenlowDetails: Array<DetailsItems> = [
    {
      title: 'pages.home.earn_money',
      description: 'pages.home.detail_earn_money',
      image: 'assets/images/home/insights.svg'
    },
    {
      title: 'pages.home.save_money',
      description: 'pages.home.detail_save_money',
      image: 'assets/images/home/savings.svg'
    },
    {
      title: 'pages.home.save_planet',
      description: 'pages.home.detail_save_planet',
      image: 'assets/images/home/compost.svg'
    }
  ];

  private _footerItems: Array<NavbarItems> = [
    {
      label: 'components.footer.c_tenlow',
      route: 'https://tenlow.es/'
    },
    {
      label: 'components.footer.privacy',
      route: 'https://tenlow.es/privacidad'
    },
    {
      label: 'components.footer.legal',
      route: 'https://tenlow.es/aviso-legal'
    },
    {
      label: 'components.footer.cookies',
      route: 'https://tenlow.es/cookies/'
    },
    {
      label: 'components.footer.terms',
      route: 'https://tenlow.es/terminos-condiciones'
    },
    {
      label: 'components.footer.faqs',
      route: 'https://tenlow.es/preguntas-frecuentes/'
    },
    {
      label: 'components.footer.participate',
      route: 'https://tree-nation.com/es/perfil/tenlow'
    }
  ];

  private _navSubMenuItems: Array<NavbarItems> = [
    {
      label: 'components.navbar.how_works',
      route: 'https://tenlow.es/como-funciona/'
    },
     {
      label: 'components.footer.faqs',
      route: 'https://tenlow.es/preguntas-frecuentes/'
    },
    {
      label: 'Sobre tenlow',
      route: 'https://tenlow.es/nosotros/'
    },
    {
      label: '2030 fiendly',
      route: 'https://tenlow.es/eco-fiendly/'
    }
  ];

  private _socialLinks: Array<SocialItem> = [
    {
      icon: 'assets/images/facebook.svg',
      url: 'https://facebook.com'
    },
    {
      icon: 'assets/images/tiktok.svg',
      url: 'https://tiktok.com'
    },
    {
      icon: 'assets/images/instagram.svg',
      url: 'https://instagram.com'
    }
  ];

  private _listCategories: Array<CategorieItem> = [
    {
      image: 'garage_home.svg',
      name: 'categories.garage_space'
    },
    {
      image: 'tools_power_drill.svg',
      name: 'categories.bricolaje'
    },
    {
      image: 'album.svg',
      name: 'categories.culture_vintage'
    },
    {
      image: 'garage_home.svg',
      name: 'categories.drones'
    },
    {
      image: 'nest_mini.svg',
      name: 'categories.smart_home'
    },
    {
      image: 'photo_camera.svg',
      name: 'categories.photograph'
    },
    {
      image: 'child_care.svg',
      name: 'categories.kids_babies'
    },
    {
      image: 'sports_esports.svg',
      name: 'categories.gaming_rv'
    },
    {
      image: 'fitness_center.svg',
      name: 'categories.sport_fitness'
    },
    {
      image: 'blender.svg',
      name: 'categories.appliances'
    },
    {
      image: 'celebration.svg',
      name: 'categories.party_events'
    },
    {
      image: 'laptop_mac.svg',
      name: 'categories.computing'
    },
    {
      image: 'deck.svg',
      name: 'categories.garden'
    },
    {
      image: 'pets.svg',
      name: 'categories.pets'
    },
    {
      image: 'electric_scooter.svg',
      name: 'categories.movility'
    },
    {
      image: 'checkroom.svg',
      name: 'categories.clothes'
    },
    {
      image: 'sports_motorsports.svg',
      name: 'categories.motor'
    },
    {
      image: 'spa.svg',
      name: 'categories.healthy'
    },
    {
      image: 'graphic_eq.svg',
      name: 'categories.sound_music'
    },
    {
      image: 'phone_iphone.svg',
      name: 'categories.phones'
    },
    {
      image: 'camping.svg',
      name: 'categories.trips'
    },
    {
      image: 'chair.svg',
      name: 'categories.home_office'
    },
  ];

  optionsAccount: Array<AccountOptionItem> = [
    {
      title: 'pages.options_account.personal_data',
      description: 'pages.options_account.info_personal_data',
      route: 'account/panel-user'
    },
    {
      title: 'pages.options_account.payments_charges',
      description: 'pages.options_account.info_payments_charges',
      route: 'account/payments-panel'
    },
    {
      title: 'pages.options_account.products',
      description: 'pages.options_account.info_products',
      route: 'products/manage-products'
    },
    {
      title: 'pages.options_account.history_rental',
      description: 'pages.options_account.info_history_rental',
      route: 'account/history-panel'
    },
    {
      title: 'pages.options_account.favorites',
      description: 'pages.options_account.info_favorites',
      route: 'account/favorites-panel'
    },
    {
      title: 'pages.options_account.config',
      description: 'pages.options_account.info_config',
      route: 'account/configuration-panel'
    },
  ];

  viewsPaymentsPanel: Array<ViewsPaymentsInfo> = [
    // {
    //   title: 'pages.payments_panel.payments_methos',
    //   view: 'PAYMENT_METHOD',
    //   subtitle: 'Supporting line text lorem ipsum dolor sit amet, consectetur. Supporting line text lorem ipsum dolor sit amet, consectetur'
    // },
    {
      title: 'pages.payments_panel.my_payments',
      view: 'MY_PAYMENTS',
      subtitle: 'pages.payments_panel.info_my_payments'
    },
    {
      title: 'pages.payments_panel.my_charges',
      view: 'MY_CHARGES',
      subtitle: 'pages.payments_panel.info_my_charges'
    },
    {
      title: 'pages.payments_panel.bank_data',
      view: 'BANK_DATA',
      subtitle: 'pages.payments_panel.info_bank_data'
    }
  ];

  regExpPhone = /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/;
  regExpString = /^[a-zA-Z\u00C0-\u017F ]+$/;
  regExpPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?.&])[A-Za-z\d@$!%*?.#&]{6,}$/;
  regExpPrice = /^\d+(,\d{1,2})?$/;
  regExpNumber = /^[0-9]+$/;
  regExpPostalCode = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
  regExpDNI = /^[a-z]{3}[0-9]{6}[a-z]?$/i;
  regExpIBAN = /^ES\d{2}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{4}|ES\d{22}/;

  private _cssSelect: string = "form-select form-select-lg block appearance-none pl-4 pr-10 py-2 text-xl font-normal rounded-3xl text-tl-dark border-2 border-solid border-tl-dark transition ease-in-out m-0 focus:text-tl-primary-medium focus:bg-white focus:border-tl-primary-medium focus:outline-none";
  private _cssFloatLabelBase: string = "label-input absolute left-0 -top-3.5 ml-2 p-1 bg-white text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:!text-sm";
  private _cssInputBase: string = "w-full  p-4 rounded-md text-gray-900 placeholder-transparent border border-solid border-gray-300 peer focus:outline-none";
  private _cssSpanValidationBase: string = "flex items-center font-medium tracking-wide text-sm ml-3";
  private _cssRadioInput: string = "w-4 h-4 appearance-none checked:ring-tl-primary checked:bg-tl-primary border-tl-primary border-2 rounded-full focus:outline-none transition duration-200";
  private _cssInputToggle: string = "w-11 h-6 bg-gray-200 peer-focus:outline-none checked:bg-tl-primary peer-checked:bg-tl-primary-medium rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all";

  defaultImg: string = "assets/images/default-img.webp";

  constructor(
    private http: HttpClient,
    private apollo: Apollo,
    private lang: LangService
  ) { }

  //#region  GET / SET VAR
  public get navbarProfileItems(): Array<NavbarItems> {
    return this._navbarProfileItems;
  }

  public get cssInputToggle(): string {
    return this._cssInputToggle;
  }

  public get cssRadioInput(): string {
    return this._cssRadioInput;
  }

  public get cssSpanValidationBase(): string {
    return this._cssSpanValidationBase;
  }

  public get cssInputBase(): string {
    return this._cssInputBase;
  }

  public get cssFloatLabelBase(): string {
    return this._cssFloatLabelBase;
  }

  public get cssSelect(): string {
    return this._cssSelect;
  }

  public get navbarItems(): Array<NavbarItems> {
    return this._navbarItems;
  }
  public get navbarItemsAuth(): Array<NavbarItems> {
    return this._navbarItemsAuth;
  }

  public get navbarItemsInfo(): Array<NavbarItems> {
    return this._navbarItemsInfo;
  }
  //#endregion

  // ****************************************

  public get tenlowDetails(): Array<DetailsItems> {
    return this._tenlowDetails;
  }

  // ****************************************

  public get footerItems(): Array<NavbarItems> {
    return this._footerItems;
  }


  public get navSubMenuItems(): Array<NavbarItems> {
    return this._navSubMenuItems;
  }
  

  // ****************************************

  public get socialLinks(): Array<SocialItem> {
    return this._socialLinks;
  }

  // ****************************************

  public get listCategories(): Array<CategorieItem> {
    return this._listCategories;
  }

  public set listCategories(value: Array<CategorieItem>) {
    this._listCategories = value;
  }

  public get countries(): Array<Country> {
    return this._countries;
  }
  public set countries(value: Array<Country>) {
    this._countries = value;
  }

  // ****************************************
  async getListCountries(){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_COUNTRIES
      })
    );
    return response;
  }

  async getStatesByCountry(idCountry:string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_STATES_BY_COUNTRY,
        variables: {
          country_id: idCountry
        }
      })
    );
    return response;
  }

  async getCititeByStates(idState:string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_CITIES_BY_STATE,
        variables: {
          state_id: idState
        }
      })
    );
    return response;
  }

  async getListCountriesLocale(){
    const response:any = await lastValueFrom(
      this.http.get('assets/countries/countries.json')
    );
    return response;
  }

  async getFaqs(){
    const response:any = await lastValueFrom(
      this.http.get('assets/faqs/index.json')
    );

    return response[this.lang.getLocale] as FaqQuestions;
  }

  isIosMobile(){
    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const webkit = !!ua.match(/WebKit/i);
    const iOSSafari = iOS && webkit && !ua.match(/CriOS/i)
    return iOSSafari;
  }


  async getCountryList() {
    const response:any = await lastValueFrom(this.http.get('assets/countries/countries.json'));
    return response;
  }

  observerDevtoolOpen(){
    return new Observable<boolean>(subscriber => {
      const interval = setInterval(async ()=>{
          // Emit each 1 sec.
          subscriber.next( devTools.isOpen );
      }, 1000);

      return ()=>{
        clearInterval(interval);
      }
    });
  }
}


export class CustomValidator{
  // Number only validation
  static numeric(control: AbstractControl) {
    let val = control.value;

    if (val === null || val === '') return null;

    if (!val?.toString().match(/^[0-9]+(\.?[0-9]+)?$/)) return { 'invalidNumber': true };

    return null;
  }
}