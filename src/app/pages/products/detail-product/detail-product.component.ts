import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicService } from 'src/app/services/public.service';
import { FilterAvailabilityComponent } from 'src/app/components/modals/filter-availability/filter-availability.component';
import { MatDialog } from '@angular/material/dialog';
import { ChosenDate } from 'ngx-daterangepicker-material/daterangepicker.component';
import { ProductService } from 'src/app/services/product.service';
import { GraphResponse } from 'src/app/interfaces/graph';
import { Categorie, CheckoutData, ImageProduct, PERIOD_RENTAL, PeriodRental, ProductConditions, ProductInfo, RangeDateSelected, RentalInfo } from 'src/app/interfaces/store';
import { StoreService } from 'src/app/services/store.service';
import dayjs from 'dayjs';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { UserService } from 'src/app/services/user.service';
import { CalificationData, User } from 'src/app/interfaces/user';
import { MatSelectChange } from '@angular/material/select';
import { DOCUMENT } from '@angular/common';
import { SeoService } from 'src/app/services/seo.service';
import { FilterCategoryComponent } from 'src/app/components/modals/filter-category/filter-category.component';
import { ModalConfirmComponent } from 'src/app/components/modals/modal-confirm/modal-confirm.component';
import { RedirectService } from 'src/app/services/redirect.service';
import { UrlFormatterService } from 'src/app/services/url-formatter.service';

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.scss']
})
export class DetailProductComponent implements OnInit {

  // Referencia a window para acceder a la URL actual
  window: any = window;
  
  cssSelect:string;
  isShowCart: boolean = false;

  timeProd: Array<string> = [];

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  minDate = new Date();
  maxDate = new Date();
  product: ProductInfo;
  defaultImg:string = "assets/images/default-img.webp";
  textSearch: string = ''; 


  isLoadProduct: boolean = true;
  imgSelected!: ImageProduct;
  center: google.maps.LatLngLiteral = {lat: 40, lng: -3};
  markerPosition: google.maps.LatLngLiteral = {lat: 40, lng: -3};
  zoom = 6;
  mapOptions: google.maps.MapOptions = {
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: false,
    mapTypeControl: false,
    controlSize: 25
  };

  categories: Categorie[] = [];

  periodRental:PeriodRental = {
    days:0,
    weeks:0,
    months:0
  };

  rentalData:RentalInfo = {
    period: '',
    date: '',
    duration: 0,
    cost: 0,
    labelPeriod: '',
    startDate: new Date(),
    endDate: new Date()
  };

  rangeDateSelected: RangeDateSelected;
  userCurrent?:User;
  isPressFavButton: boolean = false;

  suggestedProducts: ProductInfo[] = [];

  isLoader: boolean = false;
  califications: CalificationData[] = [];

  noExist: boolean = false;

  constructor(
    private matDialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    public publicService: PublicService,
    private productService: ProductService,
    private storeService: StoreService,
    private globalService: GlobalService,
    private lang:LangService,
    private userService: UserService,
    private seo: SeoService,
    private redirectService: RedirectService,
    public urlFormatter: UrlFormatterService,
    @Inject(DOCUMENT) private document: Document
  ) {
    const dateSelect =  {
      chosenLabel: '',
      startDate: dayjs(),
      endDate: dayjs()
    };
    this.cssSelect = this.publicService.cssSelect;
    const currentYear = new Date().getFullYear();
    this.maxDate = new Date(currentYear, 11, 31);
    this.product = this.productService.productSelected;
    console.log("🚀 ~ this.product:", this.product)
    if(this.product) this.setCalifications();
    this.categories = this.storeService.categories;
    this.rangeDateSelected = {
      days:dateSelect,
      weeks:dateSelect,
      months:dateSelect
    };
    this.userCurrent = this.userService.currentUser;
  }


  isValidProductForSchema(): boolean {
    return !!(this.product && 
             this.product.title && 
             this.product.description &&
             this.product.images && 
             this.product.images.length > 0);
  }


  getProductPrice(): number {
    if (!this.product) return 0;
    
    if (this.product.daily_price) return this.product.daily_price;
    if (this.product.weekly_price) return this.product.weekly_price;
    if (this.product.monthly_price) return this.product.monthly_price;
    return 0;
  }

  getNextYear(): string {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }

  getSchemaAvailability(): string {
    if (!this.product) return 'https://schema.org/OutOfStock';
    
    switch (this.product.availability) {
      case 'available':
        return 'https://schema.org/InStock';
      case 'rented':
        return 'https://schema.org/SoldOut';
      case 'sold':
        return 'https://schema.org/SoldOut';
      default:
        return 'https://schema.org/OutOfStock';
    }
  }


  getSchemaCondition(): string {
    if (!this.product) return 'https://schema.org/UsedCondition';
    

    switch (this.product.condition) {
      case 'excellent':
        return 'https://schema.org/NewCondition';
      case 'very_good':
        return 'https://schema.org/UsedCondition';
      case 'right':
        return 'https://schema.org/UsedCondition';
      default:
        return 'https://schema.org/UsedCondition';
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const elmDetailProd = this.document.getElementById('fixed-detail-prod');

    if (document.body.scrollTop > 205 || document.documentElement.scrollTop > 205) {
      const topDistance = document.documentElement.scrollTop - 210;
      elmDetailProd?.classList.add('fixed-detail-prod');
      elmDetailProd!.style.top = `${topDistance}px`;
    } else{
      elmDetailProd?.classList.remove('fixed-detail-prod');
    }
  }

  async ngOnInit() {
    this.isLoadProduct = true;
    this.route.params.subscribe(async (params) => {
      const paramId = params['id']; 
  
      if (this.product && this.product.id == paramId) {
        this.imgSelected = this.product.images[0];
        this.isLoadProduct = false;
        this.setupSEO(); 
        this.getChekoutInStorage();
        this.getSuggestedProducts();
        return;
      }
  
      await this.getDetailProd(paramId);
      if (this.product) {
        this.setupSEO();
      }
      this.getChekoutInStorage();
      this.getSuggestedProducts();
      this.isLoadProduct = false;
    });
  }

  private setupSEO() {
    if (!this.product) return;
    
    const categoryName = this.product.categories && this.product.categories.length > 0 
      ? this.product.categories[0].name 
      : '';
    
    const seoTitle = `Alquiler de ${categoryName} - Alquila con Tenlow`;
    const seoDescription = `Alquila ya de forma segura cualquier tipo de ${categoryName} con Tenlow. Garantía total. ¡Entra ahora!`;
    
    const productImage = this.product.images[0]?.path || 'https://tenlow.es/assets/images/default-img.webp';
    const baseUrl = window.location.origin;
    const formattedUrl = this.urlFormatter.formatProductUrl(this.product.title, this.product.id);
    const canonicalUrl = `${baseUrl}${formattedUrl}`;
  
    this.seo.addSeoHeader({
      title: seoTitle,
      name: '',  
      description: seoDescription
    });
    
    this.seo.setCanonicalLink(canonicalUrl);
    this.seo.addBrowsersBots(canonicalUrl);
    this.seo.addFacebookSeoTags(
      canonicalUrl,
      seoTitle,
      seoDescription,
      productImage
    );
    this.seo.addTwitterSeoTags(
      canonicalUrl,
      seoTitle,
      seoDescription,
      productImage
    );
    
    // Añadir esta línea al final del método
    this.addStructuredData();
  }

  private truncateDescription(description: string): string {
    const maxLength = 155;
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3).trim() + '...';
  }

  private addStructuredData(): void {
    if (!this.isValidProductForSchema()) return;
  
    const images = this.product.images.map(img => img.path);
    
    interface RatingSection {
      aggregateRating?: {
        "@type": string;
        ratingValue: number;
        bestRating: string;
        worstRating: string;
        ratingCount: number;
      };
      review?: any[];
    }
    
    let ratingSection: RatingSection = {};
    
    if (this.product.rating > 0 && this.product.califications && this.product.califications.length > 0) {
      ratingSection.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": this.product.rating,
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": this.product.califications.length
      };
      
      if (this.product.califications.length > 0) {
        ratingSection.review = this.product.califications.map(item => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": `${item.user?.name || 'Usuario'} ${item.user?.last_name || ''}`
          },
          "datePublished": new Date(item.created_at).toISOString().split('T')[0],
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": item.rating || 0,
            "bestRating": "5",
            "worstRating": "1"
          },
          "reviewBody": item.comment || ''
        }));
      }
    }
    
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": this.product.title,
      "image": images,
      "description": this.product.description,
      "sku": this.product.id,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "EUR",
        "price": this.getProductPrice(),
        "priceValidUntil": this.getNextYear(),
        "availability": this.getSchemaAvailability(),
        "itemCondition": this.getSchemaCondition()
      },
      ...ratingSection
    };
    
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }
  

  setCalifications(){
    const { califications } = this.product;
    if(califications.length > 2) {
      this.califications = [...califications.slice(0,2)];
    } else {
      this.califications = [...califications];
    }
  }

  addAllCalifications(){
    const { califications } = this.product;
    const temp = califications.slice(2, califications.length);
    this.califications = this.califications.concat(temp);
  }

  hiddenAllCalifications(){
    const { califications } = this.product;
    const temp = califications.slice(0, 2);
    this.califications = temp;
  }

  async getSuggestedProducts(){
    try {
      const response:GraphResponse = await this.productService.getSuggestedProducts(this.product.categories[0].id);
      if(response.errors) throw(response.errors);
      const products = [...response.data.productsByCategory];
      this.suggestedProducts = products.filter( prod => prod.id !== this.product.id ).slice(0,6);
      this.cdr.detectChanges();
      console.log("🚀 ~ getSuggestedProducts ~ this.suggestedProducts:", this.suggestedProducts)
    } catch (error) {
      console.log("🚀 ~ getSuggestedProducts ~ error:", error)
    }
  }

  goProduct(product: ProductInfo) {
    this.isLoadProduct = true;
    this.productService.productSelected = product;
    const formattedUrl = this.urlFormatter.formatProductUrl(product.title, product.id);
    this.router.navigate([formattedUrl], { queryParamsHandling: 'merge' });
    this.product = this.productService.productSelected;
    this.imgSelected = this.product.images[0];
    this.setLocationProduct();
    this.getSuggestedProducts();
    this.isLoadProduct = false;
  }

  getTextStateProduct(condition: ProductConditions){
    const txt = {
      excellent: "pages.upload_prod.excellent",
      very_good: "pages.upload_prod.very_good",
      right: "pages.upload_prod.correct",
    }
    return txt[condition];
  }
  setLocationProduct(){
    if(!this.product.location) return;

    const { latitude, longitude } = this.product.location;
    if(!latitude && !longitude) return;

    this.center = { lat:latitude, lng: longitude};
    this.markerPosition = { lat:latitude, lng: longitude};
  }

  openCart(){
    if(this.rentalData.cost == 0) {
      this.globalService.showToast( this.lang._('pages.upload_prod.firts_select_period'),'Ok', 'top' );
      return;
    }

    console.log(this.rentalData);
    this.isShowCart = !this.isShowCart;
  }

  async checkProductAvailable(){
    if(!this.userCurrent) return this.globalService.showInfo({ msg: 'pages.detail_prod.must_be_auth' });
    if(!this.userCurrent?.personal_info?.phone) return this.globalService.showInfo({ msg: 'pages.configuration_account.security_verifications_info' });

    const { startDate, endDate } =  this.rentalData;
    console.log("🚀 ~ checkProductAvailable ~ rentalData:", this.rentalData.startDate)
    if(!startDate || !endDate) return;

    try {
      this.isLoader = true;

      const response:GraphResponse = await this.storeService.checkProductAvailability({
        init_date: dayjs(startDate).add(1 , 'day').format('YYYY-MM-DD'),
        end_date: dayjs(endDate).format('YYYY-MM-DD'),
        product_id: this.product.id
      });

      if(response.errors) throw(response.errors);

      const {  availabilityProduct } = response.data;

      console.log("🚀 ~ checkProductAvailable ~ availabilityProduct:", availabilityProduct)

      if(!availabilityProduct){
        return this.globalService.showInfo({
          msg: 'pages.detail_prod.no_product_available'
        });
      }

      this.openCart();
    } catch (error) {
      console.log("🚀 ~ checkAvailableProduct ~ error:", error);
      this.globalService.showInfo({
        msg: 'pages.detail_prod.err_check_product_available'
      });
    } finally {
      this.isLoader = false;
    }
  }

  checkout() {
    if (!this.userCurrent) return this.globalService.showInfo({ msg: 'pages.detail_prod.must_be_auth' });

    // Preparar los datos del checkout
    const checkout: CheckoutData = {
      user_id: this.userService.currentUser?.id ?? '',
      amount: this.rentalData.cost * this.rentalData.duration,
      product: this.product,
      type: 'rental',
      rentalData: this.rentalData,
      init_date: this.rentalData.startDate,
      end_date: this.rentalData.endDate,
      shipping_method: ''
    };
    this.storeService.checkoutInfo = checkout;
    this.globalService.saveData(this.globalService.STORAGE_CHECKOUT_DATA, checkout);
    this.isLoader = true;
    const checkoutPath = this.lang._locale === 'es' ? '/compras/verificar' : '/shopping/checkout';
    setTimeout(() => {
      this.router.navigate([checkoutPath], {
        replaceUrl: true,
        skipLocationChange: false
      }).then(() => {
        this.isLoader = false;
      });
    }, 100);
  }

  openFilterCategory() {
    const dialogRef = this.dialog.open(FilterCategoryComponent, {
      data: { route: this.route }
    });

    dialogRef.afterClosed().subscribe(async (categorie: Categorie) => {
      if (!categorie) return;
      const categoryUrl = this.urlFormatter.formatCategoryUrl(categorie.name, categorie.id);
      this.router.navigate([categoryUrl], { queryParamsHandling: 'merge' });
    });
  }

  searchProduct() {
    if (this.textSearch.trim() == '') return;

    if (this.router.url.includes(this.lang._locale == 'es' ? 'compras/buscar' : 'shopping/search')) {
      this.storeService.eventSearch.next(this.textSearch);
    }

    const searchUrl = this.urlFormatter.formatSearchUrl(this.textSearch);
    this.router.navigate([searchUrl]);
    this.textSearch = ''; 
  }

  onSelectCategorie( event:MatSelectChange, categories:any ){
    console.log("🚀 ~ onSelectCategorie ~ event:", event.value);
    if(!event.value) return;
    this.router.navigate( [this.lang._locale == 'es' ? 'compras/tienda/categoria' : 'shopping/store/category',categories.some((el:any) => el.id == event.value).name.replace(/\s+/g, '-'), event.value], { queryParamsHandling: 'merge'});
  }

  openFilterAvailability(period: PERIOD_RENTAL) {
    const dialogRef = this.dialog.open(FilterAvailabilityComponent, {
      data: { 
        dateSelected: this.rangeDateSelected, 
        period,
        productId: this.product.id
      }
    });
  
    this.rentalData.period = period;
  
    dialogRef.afterClosed().subscribe((result: ChosenDate) => {
      if (!result) {
        this.rangeDateSelected[period] = {
          chosenLabel: '',
          startDate: dayjs(),
          endDate: dayjs()
        };
        this.periodRental[period] = 0;
        return;
      }
  
      this.rangeDateSelected[period] = result;
      const periodValue = this.validationPeriod(period, result);
  
      this.rentalData = {
        ...this.rentalData,
        duration: periodValue,
        date: result.chosenLabel,
        cost: this.getRentalCost(period),
        labelPeriod: `labels.${period}`,
        startDate: result.startDate.toDate(),
        endDate: result.endDate.toDate()
      };
  
      this.periodRental[period] = periodValue;
  
      if (periodValue > 0) {
        this.checkProductAvailable();
      } else {
        this.globalService.showToast(
          this.getMsgValidationPeriod(period),
          'Ok',
          'top'
        );
      }
    });
  }

  validationPeriod(period: PERIOD_RENTAL, resultFilter: ChosenDate) {
    const { endDate, startDate } = resultFilter;
  
    const diffDays = endDate.diff(startDate, 'days') + 1;
    
    switch (period) {
      case 'days':
        return diffDays;
        
      case 'weeks':
        if (diffDays >= 7) {
          return Math.floor(diffDays / 7);
        }
        return 0;
        
      case 'months':
        if (diffDays >= 30) {
          return Math.floor(diffDays / 30);
        }
        return 0;
    }
  }

  getMsgValidationPeriod(period: PERIOD_RENTAL) {
    const _translate = (key:string) => {
      const keyTranslate = 'pages.detail_prod';
      let msg = this.lang._(`${keyTranslate}.must_select_valid_period`);
      return `${msg} ${this.lang._(`${keyTranslate}.${key}`)}`
    };

    const validations = {
      days: _translate('in_days'),
      weeks: _translate('in_weeks'),
      months: _translate('in_months')
    };

    return validations[period];
  }

  getRentalCost(period: 'days' | 'weeks' | 'months'){
    if(period == 'days') return this.product.daily_price;
    if(period == 'weeks') return this.product.weekly_price;
    if(period == 'months') return this.product.monthly_price;
    return 0;
  }

  selectImage(img:ImageProduct){
    this.imgSelected = img;
  }

  async getDetailProd(idProd: string){
    try {
      const response:GraphResponse = await this.productService.getDetailProd(parseInt(idProd));
      console.log("🚀 ~ getDetailProd ~ response:", response.data.getProduct);

      if(response.errors) throw(response.errors);

      if (!response.data.getProduct) {
        this.noExist = true
        this.seo.metaService.updateTag({ 
          name: 'robots', 
          content: 'noindex, nofollow' 
        });
        this.seo.addSeoHeader({
          title: this.lang._locale === 'es' ? 'Producto no encontrado' : 'Product Not Found',
          name: 'TenLow',
          description: this.lang._locale === 'es' 
            ? 'El producto que buscas no existe o ha sido eliminado' 
            : 'The product you are looking for does not exist or has been removed'
        });
         if (this.product?.categories?.length > 0) {
        const category = this.product.categories[0];
        this.redirectService.redirectToCategory(category.id, category.name);
      } else {
        this.redirectService.redirectToStore('product-not-found');
      }
        return;
      }

      this.product = {...response.data.getProduct};
      this.imgSelected = this.product.images[0];
      this.setCalifications();
      this.setLocationProduct();
      this.setupSEO();

      this.seo.updateMetaTags(
        this.lang._('components.shared.look_this_interest_tenlow', {
          type: this.lang._('components.shared.product'),
        })
      );
    } catch (error) {
      this.noExist = true
      this.seo.metaService.updateTag({ 
        name: 'robots', 
        content: 'noindex, nofollow' 
      });
      this.redirectService.redirectToStore('product-error');
      console.log("🚀 ~ getDetailProd ~ error:", error)
    } finally {
      this.isLoadProduct = false;
    }
  }

  isHaveCompletePrices(){
    if( this.product.daily_price && this.product.weekly_price && this.product.monthly_price ){
      return true;
    }

    return false;
  }

  getChekoutInStorage(){
    const checkout:CheckoutData = this.globalService.getData(this.globalService.STORAGE_CHECKOUT_DATA);

    if( checkout ){
      const { product } = checkout;
      if(  product.id == this.product.id){
        const ref = this.matDialog.open(ModalConfirmComponent,{
          data:{
            title: this.lang._('labels.information'),
            msg: this.lang._('messages.have_pending_checkout'),
          }
        });

        ref.afterClosed().subscribe( ( resp ) => {
          if(resp){
            this.navigateToCheckout();
          }
        });
      }
    }
  }

  navigateToCheckout() {
    this.isLoader = true;
    const checkoutPath = this.lang._locale === 'es' ? '/compras/verificar' : '/shopping/checkout';
    
    setTimeout(() => {
      this.router.navigate([checkoutPath], {
        replaceUrl: true
      }).then(() => {
        this.isLoader = false;
      });
    }, 100);
  }

  get msgNoExist(){
    if (this.lang._('messages.msg_product_disabled') == 'msg_product_disabled') {
      if (this.lang._locale == 'es') {
        return 'El producto que está buscando no existe o está desactivado'
      }

      return "The product you are looking for does not exist or is deactivated"
    }

    return 'messages.msg_product_disabled';
  }
}