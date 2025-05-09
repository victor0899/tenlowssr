import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { Event, NavigationEnd, Router, RouterEvent, Routes } from '@angular/router';
import { filter, lastValueFrom, Observable, Observer, Subscription } from 'rxjs';
import { GraphResponse } from './interfaces/graph';
import { LanguageApi, NavbarItems } from './interfaces/public';
import { LangService } from './services/lang.service';
import { PublicService } from './services/public.service';
import { StoreService } from './services/store.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService } from './services/auth.service';
import { UserAuth } from './interfaces/user';
import { UserService } from './services/user.service';
import { Country } from './interfaces/countries';
import { FirebaseService } from './services/firebase.service';
import { environment } from 'src/environments/environment';
import { RatingService } from './services/rating.service';
import { AnimationOptions } from 'ngx-lottie';
import { GlobalService } from './services/global.service';
import DisableDevtool from 'disable-devtool';
import { ProductService } from './services/product.service';
import { Platform } from '@angular/cdk/platform';
import { HttpClient } from '@angular/common/http';
import { RedirectService } from './services/redirect.service';


interface ShoppingRoutes {
  store: string;
  storeCategoryID: string;
  search: string;
  checkout: string;
}

interface AppRoutes {
  auth: Record<string, unknown>; // Si tienes otras propiedades, defínelas aquí
  shopping: ShoppingRoutes; // Aquí defines que shopping es de tipo ShoppingRoutes
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild(MatSidenavContainer) sidenavContainer!: MatSidenavContainer;

  isLoadLang: boolean = false;
  eventDrawer: Subscription = new Subscription;
  options = this._formBuilder.group({
    bottom: 0,
    fixed: false,
    top: 0,
  });
  menuOptions: Array<NavbarItems> = [];
  mobileQuery!: MediaQueryList;
  private _mobileQueryListener!: () => void;

  eventAuthUser: Subscription;
  user?: UserAuth;
  textSearch: string = "";

  isNavFaqs: boolean = false;
  currentUrl: string = '';
  optionsLoad: AnimationOptions = {
    path: '/assets/images/load.json',
  };
  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';

  eventDevtoolOpen!: Subscription;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent) {
    if (environment.production) {
      if (e.key === 'F12') {
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        return false;
      }
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        return false;
      }
      if (e.ctrlKey && e.key == "U") {
        return false;
      }
      return true;
    }
  }


  constructor(
    private plt: Platform,
    private router: Router,
    private lang: LangService,
    private _formBuilder: FormBuilder,
    private media: MediaMatcher,
    private changeDetectorRef: ChangeDetectorRef,
    private storeService: StoreService,
    public publicService: PublicService,
    private authService: AuthService,
    private userService: UserService,
    private firebase: FirebaseService,
    private ratingService: RatingService,
    private globalService: GlobalService,
    private productService: ProductService,
    private http: HttpClient,
    private redirectService: RedirectService 

  ) {
    if (environment.production) {
      document.addEventListener('contextmenu', (e) => e.preventDefault());

      if (!this.plt.SAFARI && !this.plt.IOS) {
        this.detectDevtool();
      }

      DisableDevtool();
    }
    // //****************************
    this.disableConsoleInProduction();
    this.ratingService.getIsRatingInStorage();
    //****************************
    this.authService.getTokenAuth();
    // this.menuOptions = this.publicService.navbarItems;
    //****************************
    this.interactionDrawerMenu();
    //****************************
    this.eventAuthUser = this.authService.eventAuthUser.subscribe(async userAuth => {

      if (!userAuth) {
        this.menuOptions = this.publicService.navbarItems;
      }

      if (userAuth) {
        await this.userService.getUnreadNotifications();
      }

      this.user = userAuth;
      this.addOptionUserMenu();
    });
    //****************************
    this.router.events.pipe(
      filter((e: Event): e is RouterEvent => e instanceof NavigationEnd)
    ).subscribe(async (e: RouterEvent) => {
      const response: any = await lastValueFrom(this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn));

      const url = e.url.slice(1);

      let segments = url.split('/');


      let translatedSegments = segments.map(segment => {
        return response[segment] || segment;
      });

      let translatedString = translatedSegments.join('/');

      if (url == 'about/how-works' || url == 'app/inicio' ||  url == 'app/home' || url == 'about' || url == 'about/privacy-policy' || url == 'about/legal' || url == 'about/cookies' || url == 'about/terms-and-conditions' || url == 'faqs' || url == 'sustainable-development-goals') {
        url == 'about/how-works' ?
          window.location.href = 'https://tenlow.es/como-funciona/'
          : url == 'app/home' || url == 'app/inicio'  ?
            window.location.href = 'https://tenlow.es/'
            : url == 'about' ?
              window.location.href = 'https://tenlow.es/nosotros'
              : url == 'about/privacy-policy' ?
                window.location.href = 'https://tenlow.es/privacidad'
                : url == 'about/legal' ?
                  window.location.href = 'https://tenlow.es/aviso-legal'
                  : url == 'about/cookies' ?
                    window.location.href = 'https://tenlow.es/cookies/'
                    : url == 'about/terms-and-conditions' ?
                      window.location.href = 'https://tenlow.es/terminos-condiciones/'
                      : url == 'faqs' ?
                        window.location.href = 'https://tenlow.es/preguntas_frecuentes/'
                        : url == 'sustainable-development-goals' ?
                        window.location.href = 'https://tenlow.es/eco_fiendly/' 
                        : ''
      } else {
        this.currentUrl = translatedString;
        this.isNavFaqs = translatedString == `${this.lang._locale === 'es' ? 'objetivos-de-desarrollo-sostenible' : 'sustainable-development-goals'}`;

        url != translatedString && this.router.navigate([translatedString]);
      }
    });
  }

  async ngOnInit() {
    this.user = this.userService.getCurrentUser();
  
    this.addOptionUserMenu();
  
    await this.initAppLanguage();
    await this.initApplicationServices();
  
    if (this.user) {
      await this.getDetailUser();
      setTimeout(() => {
        if (this.user && this.user.id) { 
          this.firebase.observableChat(this.user.id);
        }
      }, 2000);
      this.authService.getTokenAuth();
    }
    setTimeout(() => {
      this.isLoadLang = true;
      setTimeout(() => {
        this.openCookiesDialog();
      }, 1000);
    }, 400);
  
    setTimeout(() => {
      this.initNonCriticalServices();
    }, 2000);
  }
  
  initNonCriticalServices() {
    if (environment.production && !this.plt.SAFARI && !this.plt.IOS) {
      this.detectDevtool();
    }
    
  }
  ngOnDestroy() {
    this.eventDrawer.unsubscribe();
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
    this.eventDevtoolOpen.unsubscribe();
  }

  interactionDrawerMenu() {
    this.eventDrawer = this.publicService.eventOpenDrawer.subscribe(isOpen => {
      if (isOpen) {
        this.sidenavContainer.open();
        return;
      }
      this.sidenavContainer.close();
    });
    //****************************
    this.mobileQuery = this.media.matchMedia('(min-width: 1024px)');
    //****************************
    this._mobileQueryListener = () => {

      if (this.mobileQuery.matches) {
        this.sidenavContainer.close();
      }

      this.changeDetectorRef.detectChanges();
    };
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  isHiddenOption(item: NavbarItems) {

    const isHomeRoute = this.currentUrl == 'app/home' || this.currentUrl == '';

    const hiddenItems = [
      'pages.favorites.title',
      'pages.account.favorites',
      'components.navbar.upload_prod',
      'labels.my_profile',
      'components.navbar.login'
    ]

    if (isHomeRoute && hiddenItems.includes(item.label)) return true;

    return false;
  }

  addOptionUserMenu() {
    if (!this.user) {
      this.menuOptions = this.publicService.navbarItems;
      return
    };

    const moreOptions = this.userService.menuOptions;

    if (this.menuOptions.length < 6) {
      this.menuOptions = moreOptions
    }
  }

  async initAppLanguage() {
    try {
      const locale = localStorage.getItem(this.lang.STORAGE_LANG);

      if (locale) {
        console.log("🚀 ~ initAppLanguage ~ locale:", locale)
        this.lang.setLocale = locale;
      }

      let language: LanguageApi;

      let responseApi = await this.getTranslations();

      language = JSON.parse(responseApi!);

      console.log("🚀 ~ initAppLanguage ~ responseApi:", JSON.parse(responseApi!))

      if (!responseApi || !language.lang || !language.languages.length) {
        language = await this.lang.getLocaleLang();
        this.lang.setLocale = 'es';
        this.lang.setLang = language;
        return;
      }

      this.lang.setLang = language.lang;
      const langs = language.languages.filter(item => !['es', 'en'].includes(item.code));
      this.lang.listLangs = langs;

      const localesArr = Object.keys(this.lang.getLang)

      const existLocaleSAaved = localesArr.find(item => item == locale)
      if (!existLocaleSAaved) {
        if (localesArr.length) {
          this.lang.setLocale = localesArr.at(0)
        }
      }

    } catch (error) {
      console.log("🚀 ~ initAppLanguage ~ error", error)
    }
  }

  async getTranslations() {
    try {
      const response: GraphResponse = await this.lang.getTranslations();
      if (response.errors) throw (response.errors);

      return response.data.language;
    } catch (error) {
      console.log("🚀 ~ getTranslations ~ error:", error);
      return null;
    }
  }

  async navigate(route: string) {
    await this.redirectService.navigateTo(route, {
      currentUrl: this.currentUrl,
      closeDrawer: () => this.sidenavContainer.close()
    });
  }


  async initApplicationServices() {
    this.firebase.initFirebaseService();
    if (this.user) await this.userService.getUnreadNotifications();
    await this.getCategories();
    await this.getListCountries();
    return;
  }


  async getDetailUser() {
    try {
      const response: GraphResponse = await this.userService.getAuthUser();
      console.log("🚀 ~ getDetailUser ~ response:", response.data.me);
      this.user = response.data.me;
      this.userService.setCurrentUser(this.user);
    } catch (error) {
      console.log("🚀 ~ getDetailUser ~ error:", error)
    }
  }

  async getCategories() {
    try {
      const response: GraphResponse = await this.storeService.getListCategories();
      console.log("🚀 ~ getCategories ~ response", response);
      this.storeService.categories = response.data.categories;
    } catch (error) {
      console.log("🚀 ~ getCategories ~ error", error)
    }
  }

  logout() {
    this.sidenavContainer.close();
    this.authService.logout();
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.code == 'Enter' || event.key == 'Enter') {
      this.searchProduct();
      const inputSearch = document.querySelector('#searchInput') as HTMLInputElement;
      inputSearch.blur();
    }
  }

  searchProduct() {
    if (this.textSearch.trim() == '') return;
  
    if (this.router.url.includes(this.lang._locale == 'es' ? 'compras/buscar' : 'shopping/search')) {
      this.storeService.eventSearch.next(this.textSearch);
    }
  
    const searchPath = this.lang._locale == 'es' ? 'compras/buscar/' : 'shopping/search/';
    this.redirectService.navigateTo(searchPath + this.textSearch, {
      closeDrawer: () => this.sidenavContainer.close()
    });
    this.textSearch = "";
  }

  async getListCountries() {
    try {
      const response: GraphResponse = await this.publicService.getListCountries();

      const temp = response.data.countries.map((item: Country) => {

        if (!item.phonecode.includes('+')) {
          item.phonecode = `+${item.phonecode}`;
        }

        const translation = JSON.parse(item.translations);

        if (translation[this.lang.getLocale]) {
          item.name = translation[this.lang.getLocale];
        }

        return item;
      });

      this.publicService.countries = [...temp];
      return;
    } catch (error) {
      // error
      return;
    }
  }

  disableConsoleInProduction(): void {
    if (environment.production) {
      console.warn(`🚨 Console output is disabled on production!`);
      console.log = function (): void { };
      console.debug = function (): void { };
      console.warn = function (): void { };
      console.info = function (): void { };
      console.error = function (): void { };
      console.table = function (): void { };
    }
  }


  openCookiesDialog() {

    const canShow = localStorage.getItem(this.globalService.STORAGE_MODAL_COOKIES);

    if (!canShow) {
      this.globalService.showCookieAlert({
        msg: 'messages.alert_cookies'
      });
    }
  }

  detectDevtool() {

    const observer: Observer<any> = {
      next: isOpen => {
        if (isOpen) {
          alert(this.lang._('messages.close_devtool'));
        }
      },
      error: error => console.log('[Error]: ', error),
      complete: () => console.log('[Complete]')
    };

    this.eventDevtoolOpen = this.publicService.observerDevtoolOpen().subscribe(observer);
  }
}

