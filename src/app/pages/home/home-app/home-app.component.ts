import { MediaMatcher } from '@angular/cdk/layout';
import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchbarComponent } from 'src/app/components/searchbar/searchbar.component';
import { DetailsItems, TabItem } from 'src/app/interfaces/public';
import { Categorie } from 'src/app/interfaces/store';
import { UserAuth } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { SeoService } from 'src/app/services/seo.service';
import { UrlFormatterService } from 'src/app/services/url-formatter.service';

@Component({
  selector: 'app-home-app',
  templateUrl: './home-app.component.html',
  styleUrls: ['./home-app.component.scss']
})
export class HomeAppComponent implements OnInit, AfterContentChecked{

  tenlowDetails: Array<DetailsItems> = [];
  dev = Array.from({length: 22}, (_, i) => i + 1)
  assetsCategory: string = "assets/images/categories/";
  defaultImg:string = "assets/images/default-img.webp";
  listCategories: Array<Categorie> = [];
  isLoadCatergories: boolean = true;
  textSearch:string = "";

  mobileQuery!: MediaQueryList;
  private _mobileQueryListener!: () => void;
  isMobile: boolean = false;

  _tabMenuAuth: TabItem[] = [
    {
      label: 'labels.search',
      route: 'shopping/store',
      icon: 'search'
    },
    {
      label: 'labels.favorites',
      route: 'account/favorites-panel',
      icon: 'favorite_border'
    },
    {
      label: 'components.navbar.upload_prod',
      route: 'products/add-product',
      icon: 'add_circle_outline'
    },
    {
      label: 'labels.my_profile',
      route: 'profile-user/dashboard',
      icon: 'account_circle'
    },
  ];

  _tabMenu: TabItem[] = [
    {
      label: 'labels.search',
      route: 'shopping/store',
      icon: 'search'
    },
    {
      label: 'components.navbar.tablon',
      route: 'tablon/table-requests',
      icon: 'assignment_turned_in'
    },
    {
      label: 'components.navbar.login',
      route: 'auth',
      icon: 'account_circle'
    },
  ];

  tabMenu:TabItem[] = [];

  eventAuthUser!: Subscription;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private sanitize: DomSanitizer,
    private media: MediaMatcher,
    private cdr: ChangeDetectorRef,
    public publicService: PublicService,
    private storeService: StoreService,
    private userService: UserService,
    private authService: AuthService,
    private lang: LangService,
    private seoService: SeoService,
    private urlFormatter: UrlFormatterService

  ){
    this.tenlowDetails = this.publicService.tenlowDetails;
    if(this.userService.currentUser){
      this.tabMenu = this._tabMenuAuth;
    } else {
      this.tabMenu = this._tabMenu;
    }
    //********************************************************
    this.mobileQuery = this.media.matchMedia('(max-width: 630px)');
    this._mobileQueryListener = () => {

      if(this.mobileQuery.matches){
        this.isMobile = true;
      } else{
        this.isMobile = false;
      }

      this.cdr.detectChanges();
    }

    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    if( window.screen.availWidth <= 630 || window.innerWidth <= 630){
      this.isMobile = true;
    }
    //********************************************************
    this.eventAuthUser = this.authService.eventAuthUser.subscribe( userAuth => {

      if(!userAuth) return this.tabMenu = this._tabMenu;

      this.tabMenu = this._tabMenuAuth;

    });
  }

  ngOnInit(): void {
    this.seoService.setHomePageTitle();
    this.listCategories = this.storeService.categories;

  }

  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  safeUrl(url:string){
    return this.sanitize.bypassSecurityTrustResourceUrl(url);
  }

  isItemBottom(item:number){
    const resp = item % 2;
    console.log("🚀 ~ isItemBottom ~ resp", resp)
    if(resp == 0) return true;

    return false;
  }

  openStore(categoryId:string, categoryName:string){
    this.router.navigateByUrl(`shopping/store/category/${categoryName.replace(/\s+/g, '-')}/${categoryId}`);
  }

  navAuth(){
    this.router.navigateByUrl('auth/register')
  }

  openTreeNation(){
    window.open("https://tree-nation.com/es/perfil/tenlow", "_blank");
  }

  openExternalUrl(url:string){
    window.open(url, "_blank");
  }

  navigate(route:string){

    if(route.includes('https')){
      return this.openExternalUrl(route);
    }
    
    if(route == 'shopping/store'){
      this.openDialogSearch();
      return;
    }

    this.router.navigateByUrl(route);
  }

  getCategoryUrl(category: any): string {
    return this.urlFormatter.formatCategoryUrl(category.name, category.id);
  }

  searchProduct(){

    if(this.router.url.includes(this.lang._locale == 'es' ? 'compras/buscar' : 'shopping/search')){
      this.storeService.eventSearch.next(this.textSearch);
    }

    this.router.navigate([this.lang._locale == 'es' ? 'compras/buscar/' : 'shopping/search/', this.textSearch]);

    this.textSearch = "";
  }

  openDialogSearch(){
    const ref = this.matDialog.open( SearchbarComponent,{
      panelClass: 'search-dialog'
    });
  }
}
