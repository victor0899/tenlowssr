import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { filter, lastValueFrom, Subscription } from 'rxjs';
import { NavbarItems } from 'src/app/interfaces/public';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { LangService } from 'src/app/services/lang.service';
import { ProductService } from 'src/app/services/product.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Categorie } from 'src/app/interfaces/store';
import { UrlFormatterService } from 'src/app/services/url-formatter.service';
import { RedirectService } from 'src/app/services/redirect.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './app-navbar.component.html',
  styleUrls: ['./app-navbar.component.scss']
})
export class AppNavbarComponent implements OnInit, OnDestroy {

  logo: string = "";
  menuOptions: Array<NavbarItems> = [];
  showMenu:boolean = false;
  currentRoute:string = "";
  profileOptions: Array<NavbarItems> = [];
  eventAuthUser!: Subscription;
  user?: User;
  textSearch: string = "";

  menuAuth:NavbarItems[] = [];
  menuNoAuth:NavbarItems[] = [];
  menuItemsInfo: NavbarItems[] = [];
  
  routesEn: any = '/assets/lang/routesEn.json';
  routesEs: any = '/assets/lang/routesEs.json';

  construction:boolean = environment.construction;
  emails:string[] = environment.emails;
  isSubMenuOpen = false;
  isSubMenuHovered: boolean = false;
  navSubMenuItems: NavbarItems[] = [];

  isButtonHovered: boolean = false;
  isSubMenuVisible: boolean = false; 
  categories: Categorie[] = [];
  currentUrl: string | undefined;
  sidenavContainer: any;


  constructor(
    private router: Router,
    public publicService: PublicService,
    private authService: AuthService,
    private userService: UserService,
    private storeService: StoreService,
    private productService: ProductService,
    public lang: LangService,
    private http: HttpClient,
    private urlFormatter: UrlFormatterService,
    private redirectService: RedirectService 

  ) {
    this.logo = publicService.logo;
    this.menuNoAuth = [...this.publicService.navbarItems];
    this.menuOptions = [...this.menuNoAuth];
    this.menuAuth = [...this.publicService.navbarItemsAuth];
    this.menuItemsInfo = [...this.publicService.navbarItemsInfo]
    this.navSubMenuItems = [...this.publicService.navSubMenuItems]
    this.profileOptions = this.publicService.navbarProfileItems;
    /// **********************************************
    this.currentRoute = this.router.url.slice(1);
    this.router.events.pipe(
      filter((e: Event): e is RouterEvent => e instanceof NavigationEnd)
    ).subscribe((e: RouterEvent) => this.currentRoute = e.url.slice(1));
    /// **********************************************
    this.eventAuthUser = this.authService.eventAuthUser.subscribe( userAuth => {
      this.user = userAuth;
      if(userAuth){
        this.menuOptions = this.menuAuth;
      } else {
        this.menuOptions = this.menuNoAuth;
      }
    });
  }

  /**
   * @param event Evento del clic
   * @param route Ruta a la que navegar
   */
  handleClick(event: MouseEvent, route: string): void {
    if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.navigate(route);
    }
  }

  /**
   * @param route 
   * @returns 
   */

  getFormattedUrl(route: string): string {
    if (route.startsWith('http')) {
      return route;
    }
    
    if (!route.startsWith('/')) {
      route = '/' + route;
    }
    
    const baseUrl = window.location.origin;
    return `${baseUrl}${route}`;
  }

  async ngOnInit(): Promise<void> {
    this.user = this.userService.getCurrentUser();
    if(this.user){
      this.menuOptions = this.menuAuth;
    } else {
      this.menuOptions = [ this.menuOptions[0] ];
    }

    try {
      const response = await this.storeService.getListCategories();
      if (response?.data?.categories) {
        this.categories = response.data.categories;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  ngOnDestroy(): void {
    this.eventAuthUser.unsubscribe();
  }

  toggleNavbar() {
    this.showMenu = !this.showMenu;
    this.publicService.eventOpenDrawer.next(true);
  }
  

  openExternalUrl(url:string){
    window.open(url, "_blank");
  }

  toggleSubMenu() {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }

  async navigate(route: string) {
    await this.redirectService.navigateTo(route, {
      currentUrl: this.currentUrl,
      closeDrawer: () => {
        if (this.sidenavContainer) this.sidenavContainer.close();
      }
    });
  }

  canShowAvatar(){
    if(!this.user){
      return false
    }

    return true;
  }

  logout(){
    this.authService.logout();
  }

 searchProduct() {
  if (this.textSearch.trim() == '') return;

  if (this.router.url.includes(this.lang._locale == 'es' ? 'compras/buscar' : 'shopping/search')) {
    this.storeService.eventSearch.next(this.textSearch);
  }

  const searchUrl = this.urlFormatter.formatSearchUrl(this.textSearch);
  this.redirectService.navigateTo(searchUrl);
  this.textSearch = '';
}
}