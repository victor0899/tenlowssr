import { AfterContentChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { PaginatorInfo } from 'src/app/interfaces/public';
import { PublicService } from 'src/app/services/public.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterCategoryComponent } from 'src/app/components/modals/filter-category/filter-category.component';
import { FilterPriceComponent } from 'src/app/components/modals/filter-price/filter-price.component';
import { FilterAvailabilityComponent } from 'src/app/components/modals/filter-availability/filter-availability.component';
import { ChosenDate } from 'ngx-daterangepicker-material/daterangepicker.component';
import { StoreService } from 'src/app/services/store.service';
import { GraphResponse } from 'src/app/interfaces/graph';
import { Categorie, FilterByPrice, ParamFilterMap, ParamsFilterProducts, ProductInfo, Subcategorie } from 'src/app/interfaces/store';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Subscription, filter } from 'rxjs';
import dayjs from 'dayjs';
import { LangService } from 'src/app/services/lang.service';
import { SeoService } from 'src/app/services/seo.service';
import { UrlFormatterService } from 'src/app/services/url-formatter.service';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit, AfterContentChecked, OnDestroy{
  @ViewChild('paginator') matPaginator!: MatPaginator;

  listCategories: Array<Categorie> = [];
  listSubcategories: Array<Subcategorie> = [];

  cssSelect:string = "form-select form-select-lg block appearance-none  px-8 text-sm semibold pt-1.5 pb-1 rounded-3xl text-tl-dark border-1-dark-transparent transition ease-in-out m-0 focus:text-tl-dark focus:bg-white focus:border-input-border focus:outline-none flex-shrink-0";
  cssFilterBtn: string = "flex flex-row items-center justify-between border-1-dark-transparent px-3 rounded-3xl text-sm semibold pt-2 pb-2 cursor-pointer";
  dev = [...Array(12).keys()];
  iconAssets:string = "";
  imgArrowUp: string = "";
  imgArrowDown: string = "";
  // *************************
  isOpenMap: boolean = false;
  isLoadProducts:boolean= true;
  isParamCategory: boolean = false;
  isLoadSubcategorie: boolean = true;
  dateSelected!:ChosenDate | null;
  listProducts: Array<ProductInfo> = [];
  paginatorProd!: PaginatorInfo;
  currentPage: number = 1;
  pageEvent!: PageEvent;
  pagesIndex: Array<number> = [];
  categorySelected!:Categorie;
  subcategorieSelected?: Subcategorie;
  isSearch:boolean = false;
  // *************************
  eventSearch: Subscription;
  querySearch:string = "";
  // *************************
  filterParam: ParamsFilterProducts = {
    category_id: undefined,
    latitude: undefined,
    longitude: undefined,
    min_price: undefined,
    max_price: undefined,
    order_price: undefined,
    init_date: undefined,
    end_date: undefined,
    first: undefined,
    page: undefined
  };
  distanceFilter:number = 0;
  paramOrderPrice:FilterByPrice = {
    minPrice: undefined,
    maxPrice: undefined,
    optionBuy: false,
    orderPrice: '',
    periodFilter: '',
    limitPrice: null
  };

  isFilterByMap: boolean = false;
  isFilterByPrice: boolean = false;
  isFilterByDate: boolean = false;

  eventRoute:Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public publicService: PublicService,
    private storeService: StoreService,
    public lang: LangService,
    private seoService: SeoService,
    private urlFormatter: UrlFormatterService,
    private viewportScroller: ViewportScroller
  ){
    this.iconAssets = this.publicService.iconAssets;
    this.imgArrowUp = this.iconAssets + 'tl-arrow-up.svg';
    this.imgArrowDown = this.iconAssets + 'tl-arrow-down.svg';
    this.listCategories = this.storeService.categories;
    this.isSearch = this.router.url.includes('search') || this.router.url.includes('buscar');;
    this.eventSearch = this.storeService.eventSearch.subscribe( query => {
      if(query){
        this.querySearch = query;
        this.isLoadProducts = true;
        this.searchProducts(query);
      }
    });

    //****************************
    this.eventRoute = this.router.events.pipe(
      filter((e: Event): e is NavigationStart => e instanceof NavigationStart)
    ).subscribe((e: NavigationStart) => {
      if (e.navigationTrigger === 'popstate') {
        // Perform actions
        const url = e.url.slice(1);
        const fragments = url.split('/');
        if (fragments.at(-1)) {
          const prevQuery = fragments.at(-1)!;
          this.querySearch = prevQuery;
          this.isLoadProducts = true;
          this.searchProducts(prevQuery);
        }
      }
    });
  }

  ngOnInit(): void {
    console.log('on init()');

    this.loadAllCategories();
    
    this.initGetSubcategories();
    if(this.isSearch){
      this.querySearch = this.route.snapshot.params['query'];
      this.searchProducts(this.querySearch);
      return;
    }

    if(this.storeService.products.length && !this.isSearch){
      this.listProducts = this.storeService.products;
      this.paginatorProd = this.storeService.paginatorProd;
      this.pagesIndex = [...Array(this.paginatorProd.lastPage).keys()];
      this.isLoadProducts = false;
      return;
    }

    if(!this.categorySelected){
      this.getPaginatedProducts();
    }
  }

  /**
   * Carga todas las categorías para los enlaces SEO
   */
  private loadAllCategories(): void {
    // Si ya tenemos categorías, no hacemos nada
    if (this.listCategories && this.listCategories.length > 0) {
      return;
    }
    
    // Si no tenemos categorías, las cargamos desde el servicio
    this.storeService.getAllCategories().then(response => {
      if (response && response.data && response.data.categories) {
        this.listCategories = response.data.categories;
      }
    }).catch(error => {
      console.error('Error loading categories for SEO:', error);
    });
  }

  ngOnDestroy(): void {
    if(this.eventSearch){
      this.eventSearch.unsubscribe();
    }
    if(this.eventRoute){
      this.eventRoute.unsubscribe();
    }
  }

  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.isParamCategory && this.categorySelected) {
      setTimeout(() => {
        this.setupCategorySEO();
      }, 0);
    }
  }

  navigate(route:string){
    this.router.navigateByUrl(route);
  }

  resetStore(){
    this.router.navigate([this.lang._locale == 'es' ? 'compras/tienda' : 'shopping/store'], { queryParamsHandling: 'merge'});
    this.storeService.products = [];
  }

  initStore(){

    this.resetStore();
    this.paramOrderPrice = {
      minPrice: 0,
      maxPrice: 0,
      optionBuy: false,
      orderPrice: '',
      periodFilter: '',
      limitPrice: null
    };
    this.dateSelected = null;
    this.filterParam = {
      category_id: 0,
      latitude: 0,
      longitude: 0,
      min_price: 0,
      max_price: 0,
      order_price: '',
      init_date: dayjs().format('YYYY-MM-DD'),
      end_date: dayjs().format('YYYY-MM-DD'),
      first: 0,
      page: 0
    };
    this.isLoadProducts = true;
    this.getPaginatedProducts();
  }

  private setupCategorySEO() {
    if (!this.categorySelected) return;
    
    const categoryName = this.categorySelected.name;
    const locale = this.lang._locale;
    
    const seoTitle = locale === 'es' 
      ? `Alquiler de Productos de ${categoryName} - Tenlow`
      : `${categoryName} Products Rental - Tenlow`;
      
    const seoDescription = locale === 'es'
      ? `Encuentra y alquila ${categoryName} de calidad a precios asequibles. Alquiler seguro entre particulares con Tenlow.`
      : `Find and rent quality ${categoryName} at affordable prices. Safe peer-to-peer rental with Tenlow.`;
    
    this.seoService.addSeoHeader({
      title: seoTitle,
      name: 'Tenlow', 
      description: seoDescription
    });
    
    const baseUrl = window.location.origin;
    const formattedUrl = this.urlFormatter.formatCategoryUrl(this.categorySelected.name, this.categorySelected.id);
    this.seoService.setCanonicalLink(`${baseUrl}${formattedUrl}`);
    

    this.seoService.addBrowsersBots(`${baseUrl}${formattedUrl}`);
    
    this.seoService.addFacebookSeoTags(
      `${baseUrl}${formattedUrl}`,
      seoTitle,
      seoDescription,
      'https://tenlow.es/assets/images/default-img.webp' 
    );
    
    this.seoService.addTwitterSeoTags(
      `${baseUrl}${formattedUrl}`,
      seoTitle,
      seoDescription,
      'https://tenlow.es/assets/images/default-img.webp' 
    );
  }
  
  async initGetSubcategories(){
    this.isParamCategory = this.router.url.includes(this.lang._locale == 'es' ? 'categoria' : 'category');
    let paramID = this.route.snapshot.params['id'];
    
    if(this.isParamCategory){
      this.filterParam.category_id = paramID;
      
      // Intentar obtener la categoría del listado
      this.categorySelected = this.listCategories.filter(cat => cat.id == paramID)[0];
      
      // Si no encontramos la categoría en el listado, podríamos necesitar obtenerla
      if (!this.categorySelected) {
        // Aquí podríamos agregar una llamada adicional para obtener los detalles de la categoría si es necesario
        console.log("No se encontró la categoría en la lista, se requiere implementación adicional");
        return;
      }
      
      console.log("Categoría seleccionada:", this.categorySelected);
      
      this.setupCategorySEO();
      
      await this.getProductsByCategory();
      await this.getSubcategorires(paramID);
      return;
    }
  
    this.isLoadSubcategorie = false;
  }
  
  hiddenErrNoCategory(){
    this.isParamCategory = false;
  }

  async searchProducts(query:string){
    try {
      const response: GraphResponse = await this.storeService.searchProducts(query);
      this.listProducts = response.data.searchProduct;
      console.log("🚀 ~ searchProducts ~ response:", response.data.searchProduct);
      this.isLoadProducts = false;
    } catch (error) {
      console.log("🚀 ~ searchProducts ~ error:", error)
    }
  }

  async getProductsByCategory(){
    try {
      const response: GraphResponse = await this.storeService.getProductsByCategory(this.categorySelected.id);
      if(response.errors) throw(response.errors);
      console.log("🚀 ~ getProductsByCategory ~ response:", response);
      this.listProducts = response.data.productsByCategory;
      this.isLoadProducts = false;
    } catch (error) {
      this.isLoadProducts = false;
      console.log("🚀 ~ getProductsByCategory ~ error:", error)
    }
  }

  async getPaginatedProducts() {
    try {
      this.isLoadProducts = true;
      const scrollPosition = this.viewportScroller.getScrollPosition();
      
      const response: GraphResponse = await this.storeService.getProducts(this.currentPage);
      if(response.errors) throw(response.errors);
  
      this.listProducts = response.data.products.data;
      this.paginatorProd = response.data.products.paginatorInfo;
      this.pagesIndex = [...Array(this.paginatorProd.lastPage).keys()];
      this.storeService.products = this.listProducts;
      this.storeService.paginatorProd = this.paginatorProd;

      setTimeout(() => {
        this.viewportScroller.scrollToPosition(scrollPosition);
        this.isLoadProducts = false;
      }, 0);
    } catch (error) {
      this.isLoadProducts = false;
      console.log("Error fetching products:", error);
    }
  }

  selectSubcategorie(subcategorie: Subcategorie){

    if(this.subcategorieSelected){
      if(subcategorie.id == this.subcategorieSelected.id){
        this.subcategorieSelected = undefined;
        this.isLoadProducts = true;
        this.getProductsByCategory();
        return;
      }
    }

    this.subcategorieSelected = subcategorie;

    this.filterSubcategories();
  }

  async filterSubcategories(){
    this.isLoadProducts = true;
    try {
      const response: GraphResponse = await this.storeService.getProductsBySubategory(this.subcategorieSelected!.id);
      if(response.errors) throw(response.errors);
      console.log("🚀 ~ getProductsBySubategory ~ response:", response);
      this.listProducts = response.data.getProductBySubCategory;
    } catch (error) {
      console.log("🚀 ~ getProductsBySubategory ~ error:", error)
    } finally {
      this.isLoadProducts = false;
    }
  }

  handlePageEvent(e: PageEvent) {

    if(e.previousPageIndex == undefined) return;

    this.isLoadProducts = true;
    this.pageEvent = e;

    const isGoingBack = e.previousPageIndex > this.matPaginator.pageIndex;
    this.currentPage += isGoingBack ? -1 : 1;


    if(this.currentPage > this.paginatorProd.lastPage) return;

    this.getPaginatedProducts();
  }

  selectPage(indexPage:number){
    this.isLoadProducts = true;
    this.currentPage = indexPage;
    this.getPaginatedProducts();
  }

  viewProduct(idProd:number, title:string){

    this.router.navigateByUrl(`products/${title.replace(/\s+/g, '-')}/${idProd}`);
  }

  openFilterCategory() {
    const dialogRef = this.dialog.open(FilterCategoryComponent, {
      data:{
        route: this.route
      }
    });

    dialogRef.afterClosed().subscribe(async (categorie:Categorie) => {

      if(!categorie) return;

      this.router.navigate( [this.lang._locale == 'es' ? 'compras/tienda/categoria' : 'shopping/store/category', categorie.name.replace(/\s+/g, '-'), categorie.id], { queryParamsHandling: 'merge'});
      this.isLoadProducts = true;
      this.isLoadSubcategorie = true;
      this.categorySelected = categorie;
      this.isParamCategory = true;
      await this.getProductsByCategory();
      await this.getSubcategorires(categorie.id);
    });
  }

  openFilterPrice() {
    const dialogRef = this.dialog.open(FilterPriceComponent, {
      data: this.paramOrderPrice
    });

    dialogRef.afterClosed().subscribe((payload:FilterByPrice) => {
      if(payload){
        this.isLoadProducts = true;
        this.isFilterByPrice = true;
        this.paramOrderPrice = payload;
        this.filterParam.max_price = payload.maxPrice;
        this.filterParam.min_price = payload.minPrice;
        this.filterParam.order_price = payload.orderPrice;
        this.getFilteredProducts();
      }
    });
  }

  openFilterAvailability() {
    const dialogRef = this.dialog.open(FilterAvailabilityComponent,{
      data: {dateParams: this.dateSelected}
    });

    dialogRef.afterClosed().subscribe((result:ChosenDate )=> {
      if(result){
        this.isLoadProducts = true;
        this.isFilterByDate = true;
        console.log(`openFilterAvailability result:`, result);
        this.dateSelected = result;
        this.filterParam.init_date = result.startDate.format('YYYY-MM-DD');
        this.filterParam.end_date = result.endDate.format('YYYY-MM-DD');
        this.getFilteredProducts();
      }
    });
  }

  openMap(){
    this.isOpenMap = !this.isOpenMap;
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }

  async getSubcategorires(categoryId: string){
    try {
      const response: GraphResponse = await this.storeService.getListSubcategories(categoryId);
      console.log("🚀 ~ getSubcategorires ~ response", response.data.subCategories);
      this.listSubcategories = response.data.subCategories;
      this.cdr.detectChanges();
      this.isLoadSubcategorie = false;
    } catch (error) {
      console.log("🚀 ~ getSubcategorires ~ error", error)
    }
  }
  getProductUrl(item: ProductInfo): string {
    return '/' + (this.lang._locale == 'es' ? 'producto' : 'products') + '/' + 
           item.title.replace(/\s+/g, '-') + '/' + item.id;
  }
  

/**
 * Maneja los clics en enlaces para mantener el comportamiento de SPA
 * @param event Evento del clic
 * @param action Acción o ruta a manejar
 */
handleClick(event: MouseEvent, action: string): void {
  // Si se presiona ctrl o cmd (metaKey), permitir que el navegador maneje la navegación
  if (event.ctrlKey || event.metaKey || event.button !== 0) {
    return;
  }
  
  // Prevenir la navegación por defecto
  event.preventDefault();
  
  // Ejecutar la acción correspondiente según el string recibido
  if (action === 'openFilterCategory') {
    this.openFilterCategory();
  } else if (action === 'resetStore') {
    this.resetStore();
  } else if (typeof action === 'string') {
    this.navigate(action);
  }
}

/**
 * Obtiene la URL base de la tienda según el idioma actual
 */
getBaseStoreUrl(): string {
  return '/' + (this.lang._locale == 'es' ? 'compras/tienda' : 'shopping/store');
}

/**
 * Obtiene la URL para el filtro de categorías
 */
getCategoriesFilterUrl(): string {
  return this.getBaseStoreUrl() + '/categories';
}

/**
 * Genera la URL para una categoría específica
 * @param category Categoría para la que se generará la URL
 */
getCategoryUrl(category: Categorie): string {
  if (!category) return this.getBaseStoreUrl();
  
  const baseUrl = this.lang._locale == 'es' ? '/compras/tienda/categoria' : '/shopping/store/category';
  return `${baseUrl}/${category.name.replace(/\s+/g, '-')}/${category.id}`;
}

/**
 * Genera la URL para una subcategoría específica
 * @param subcategory Subcategoría para la que se generará la URL
 */
getSubcategoryUrl(subcategory: Subcategorie): string {
  if (!subcategory) return this.getBaseStoreUrl();
  
  if (this.categorySelected) {
    const baseUrl = this.lang._locale == 'es' ? '/compras/tienda/categoria' : '/shopping/store/category';
    return `${baseUrl}/${this.categorySelected.name.replace(/\s+/g, '-')}/${this.categorySelected.id}?subcategory=${subcategory.id}`;
  }
  
  return this.getBaseStoreUrl();
}

  removeFilter(type: 'map' | 'price' | 'availability'){
    this.isLoadProducts = true;

    if(type == 'map'){
      this.isFilterByMap = false;
      this.distanceFilter = 0;
      this.filterParam.latitude = undefined;
      this.filterParam.longitude = undefined;
    }

    if(type == 'price'){
      this.isFilterByPrice = false;
      this.filterParam.max_price = undefined;
      this.filterParam.min_price = undefined;
      this.filterParam.order_price = undefined;
    }

    if(type == 'availability'){
      this.isFilterByDate = false;
      this.dateSelected = null;
      this.filterParam.init_date = undefined;
      this.filterParam.end_date = undefined;
    }


    if( !this.isFilterByMap &&  !this.isFilterByDate && !this.isFilterByPrice){
      return this.getPaginatedProducts();
    }

    this.getFilteredProducts();
  }

  filterByMap( event: ParamFilterMap ){
    this.isFilterByMap = true;
    const { latitude,longitude, distance_range } = event;
    this.distanceFilter = distance_range;
    this.filterParam.latitude = latitude;
    this.filterParam.longitude = longitude;
    this.openMap();
    this.getFilteredProducts();
  }

  async getFilteredProducts(){
    this.isLoadProducts = true;
    try {
      console.log("🚀 ~ getFilteredProducts ~ this.filterParam:", this.filterParam);
      const response: GraphResponse = await this.storeService.filterProducts(this.filterParam);
      console.log("🚀 ~ getFilteredProducts ~ response:", response.data.filterByProduct);
      if(response.errors) throw(response.errors);
      const { filterByProduct } = response.data;
      this.paginatorProd = {...filterByProduct.paginatorInfo};
      this.listProducts = [...filterByProduct.data];
      this.currentPage = 1;
      this.pagesIndex = [...Array(this.paginatorProd.lastPage).keys()];
      this.isLoadProducts = false;
    } catch (error) {
      this.isLoadProducts = false;
      console.log("🚀 ~ getFilteredProducts ~ error:", error);
    }
  }
}