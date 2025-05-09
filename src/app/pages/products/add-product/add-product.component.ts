import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import moment from 'moment';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Options } from 'ngx-google-places-autocomplete/objects/options/options';
import { Observable, Subscription, lastValueFrom, of, startWith } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddBankAccountModal } from 'src/app/components/modals/modal-bank-account/modal-bank-account.component';
import { Country, CountryData, StateData } from 'src/app/interfaces/countries';
import { GraphResponse } from 'src/app/interfaces/graph';
import { AddProductPayload, FieldInputPrice, ImageFileProduct } from 'src/app/interfaces/products';
import { Photo } from 'src/app/interfaces/public';
import { Categorie, ProductInfo, ProductStatus, Subcategorie } from 'src/app/interfaces/store';
import { UserAuth } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { ProductService } from 'src/app/services/product.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { StripeService } from 'src/app/services/stripe.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('stepPrice') stepPrice!: MatStep;

  //#region STEPS FORMS
  stepUploadImage = this.fb.group({
    imageFiles: ['', [Validators.required]],
  });

  stepInformationProduct = this.fb.group({
    titleProd: ['', [Validators.required, Validators.min(2)]],
    categoryProd: ['', [Validators.required]],
    subcategoryProd: [{ value: '', disabled: true }],
    descriptionProd: ['', [Validators.required]],
    stateProd: ['', [Validators.required]],
  });

  stepPriceProduct = this.fb.group({
    rentalPriceDay: ['', [Validators.pattern(this.publicService.regExpPrice)]],
    rentalPriceWeek: ['', [Validators.pattern(this.publicService.regExpPrice)]],
    rentalPriceMonth: ['', [Validators.pattern(this.publicService.regExpPrice)]],
    minTimeRentalDay: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    minTimeRentalWeek: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    minTimeRentalMonth: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    maxTimeRentalDay: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    maxTimeRentalWeek: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    maxTimeRentalMonth: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    rentalWithBuyOp: [false],
    salePrice: ['', [Validators.pattern(this.publicService.regExpPrice)]],
    minTimeRentalBuyDay: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    minTimeRentalBuyWeek: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
    minTimeRentalBuyMonth: ['', [Validators.pattern(this.publicService.regExpNumber), Validators.min(1)]],
  });

  stepAddressInfo = this.fb.group({
    country: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.pattern(this.publicService.regExpPostalCode)]],
    province: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(this.publicService.regExpString)]],
    addressMeet: ['', [Validators.required]],
    range: [1, [Validators.required]]
  });

  //#endregion

  //#region INPUTS RENTAL STEP
  inputRentalPrice: Array<FieldInputPrice> = [
    {
      label: "labels.day",
      var: 'rentalPriceDay',
      period: 'day'
    },
    {
      label: "labels.week",
      var: 'rentalPriceWeek',
      period: 'week'
    },
    {
      label: "labels.month",
      var: 'rentalPriceMonth',
      period: 'month'
    }
  ];

  inputMinTimeRental: Array<FieldInputPrice> = [
    {
      label: "labels.day",
      var: 'minTimeRentalDay',
      period: 'day'
    },
    {
      label: "labels.week",
      var: 'minTimeRentalWeek',
      period: 'week'
    },
    {
      label: "labels.month",
      var: 'minTimeRentalMonth',
      period: 'month'
    }
  ];

  inputMaxTimeRental: Array<FieldInputPrice> = [
    {
      label: "labels.day",
      var: 'maxTimeRentalDay',
      period: 'day'
    },
    {
      label: "labels.week",
      var: 'maxTimeRentalWeek',
      period: 'week'
    },
    {
      label: "labels.month",
      var: 'maxTimeRentalMonth',
      period: 'month'
    }
  ];

  inputMinTimeRentalBuy: Array<FieldInputPrice> = [
    {
      label: "labels.day",
      var: 'minTimeRentalBuyDay',
      period: 'day'
    },
    {
      label: "labels.week",
      var: 'minTimeRentalBuyWeek',
      period: 'week'
    },
    {
      label: "labels.month",
      var: 'minTimeRentalBuyMonth',
      period: 'month'
    }
  ];
  //#endregion

  //#region  STYLED CLASS TAILWIND
  cssFloatLabel: string = "";
  cssInputTxt: string = "";
  cssInputDate: string = "";
  cssDateFloatLabel: string = "";
  cssSpanValidation: string = "";
  cssSpanValidationDate: string = "";
  cssSelect: string = "";
  cssRadioInput: string = "";
  cssMoneyIconInput: string = "absolute inset-y-0 right-1 top-1 bottom-0.5 bg-white flex items-center pr-3 text-2xl";
  cssInputToggle: string = "";
  //#endregion

  //#region OTHER VARS TO FORM
  stepsResolve: number = 0;
  isPressNext: boolean = false;
  currentStep: number = 0;

  selectedImages: ImageFileProduct[] = [
    {
      index: 1,
      image: undefined
    },
    {
      index: 2,
      image: undefined
    },
    {
      index: 3,
      image: undefined
    },
    {
      index: 4,
      image: undefined
    },
    {
      index: 5,
      image: undefined
    },
    {
      index: 6,
      image: undefined
    }
  ];

  categories: Array<Categorie> = [];
  subcategories: Array<Subcategorie> = [];
  statesProd = ProductStatus;
  isLoadSubcategories: boolean = false;
  showErrorsInfoProduct: boolean = false;
  showErrorsPriceProduct: boolean = false;
  showLoader: boolean = false;
  //#endregion

  //#region VAR TO ADDRESS DATA STEP
  countries: Array<Country> = [];
  filteredCountry!: Observable<Country[]>;
  states: Array<StateData> = [];
  filteredState!: Observable<StateData[]>;
  isLoadProvince: boolean = false;
  apiMapLoaded: Observable<boolean>;
  center: google.maps.LatLngLiteral = { lat: 40, lng: -3 };
  zoom = 6;
  mapOptions: google.maps.MapOptions = {
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: false,
    mapTypeControl: false,
    controlSize: 25
  };
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  markerPosition!: google.maps.LatLngLiteral;
  radiusMarker: number = 1000;
  optionsCircle: google.maps.CircleLiteral = {
    draggable: false,
    fillColor: '#8BE8E5',
    strokeColor: '#31B7BC',
    center: this.center,
    radius: 0
  };
  defaultBounds: any = {
    north: this.center.lat + 0.1,
    south: this.center.lat - 0.1,
    east: this.center.lng + 0.1,
    west: this.center.lng - 0.1,
  };
  countrySelected = '';
  isEnterAddress: boolean = true;

  latitude: number = 0;
  longitude: number = 0;
  //#endregion
  user?: UserAuth;

  isEditMode: boolean = false;
  isLoadProduct: boolean = true;
  editableProduct!: ProductInfo;
  isNoAccess: boolean = false;
  showLoaderUpdateImg: boolean = false;
  showLastStep: boolean = false;

  stripe_id: any = null;

  idProductCreated!: string;
  titleProductCreated!: string;

  countryLocale: CountryData[] = [];
  eventAddOtherProduct: Subscription;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private lang: LangService,
    private storeService: StoreService,
    public publicService: PublicService,
    private productService: ProductService,
    private authService: AuthService,
    private globalService: GlobalService,
    private userService: UserService,
    public dialog: MatDialog
  ) {
    // ********************************************
    this.eventAddOtherProduct = this.productService.eventAddOtherProduct.subscribe(isReload => {
      this.stepper.reset();
      this.stepUploadImage.reset();
      this.stepInformationProduct.reset();
      this.stepPriceProduct.reset();
      this.stepPrice.editable = false;
      this.stepPrice.completed = false;
      this.stepAddressInfo.reset();
      this.selectedImages.forEach((item, index) => { if (item.image) this.removeImage(index); });
      this.latitude = 0;
      this.longitude = 0;
      this.currentStep = 0;
      this.addressMeet?.setValue(null);
    });
    // ********************************************
    this.getListCountries();
    this.cssSelect = this.publicService.cssSelect;
    this.cssRadioInput = this.publicService.cssRadioInput;
    this.cssInputToggle = this.publicService.cssInputToggle;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-tl-primary-medium";
    this.cssInputTxt = this.publicService.cssInputBase + " focus:border-tl-primary-medium";
    this.cssInputDate = this.publicService.cssInputBase + " focus:border-tl-dark-medium";
    this.cssDateFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-tl-dark-medium";
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + " text-tl-dark-medium";
    this.cssSpanValidationDate = this.publicService.cssSpanValidationBase + " text-tl-dark-medium";
    this.categories = this.storeService.categories;
    this.countries = this.publicService.countries;
    // ********************************************
    if (this.country) {
      this.filteredCountry = this.country.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCountry(value || '')),
      );
    }

    if (this.province) {
      this.filteredState = this.province.valueChanges.pipe(
        startWith(''),
        map(value => this._filterState(value || '')),
      );
    }
    // ********************************************
    this.apiMapLoaded = this.http.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyAk2j_1xbWQfDDR3OsCU2OZ3K1lSDGVslA', 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
    // ********************************************
    console.log(this.route.snapshot.params['id']);
    if (router.url.includes('edit')) {
      this.isEditMode = true;
    } else {
      this.showLastStep = true;
    }
    this.lang.getLocaleLang();
  }

  ngOnDestroy(): void {
    this.eventAddOtherProduct.unsubscribe();
  }

  async getListCountries() {
    try {
      const response: Array<CountryData> = await this.publicService.getCountryList();
      console.log("🚀 ~ getListCountries ~ response:", response);
      this.countryLocale = [...response];
      this.publicService.countryLocale = [...this.countryLocale];
    } catch (error) {
      console.log('err getListCountries()', error);
    }
  }

  async ngOnInit() {
    if (this.isEditMode) {
      const idProduct = this.route.snapshot.params['id'];
      const editableProd = this.productService.productEditable;

      if (editableProd) {
        this.showLoader = true;
        console.log("🚀 ~ ngOnInit ~ editableProd:", editableProd);
        this.editableProduct = { ...editableProd };
      } else {
        await this.getDetailProd(idProduct);
      }

      this.setEditableInForm();

    } else {
      let response = this.globalService.getData(this.globalService.STORAGE_USER)
      this.stripe_id = response.stripe_id
      if (response.stripe_id == null) {
        const ref = this.globalService.showInfoBank()
        ref.afterClosed().subscribe(resp => this.createStripe(response))
      }
    }
  }

  async createStripe(response: any) {
    if (response.stripe_id == null) {
      let dataValid = {
        email: response.email,
        first_name: response.name,
        last_name: response.last_name,
        phone: response.personal_info != null ? `+${response.personal_info.phone_country_code}${response.personal_info.phone}` : '',
        day: response.personal_info?.birthdate != null ? moment(response.personal_info.birthdate).format('DD') : '',
        month: response.personal_info?.birthdate != null ? moment(response.personal_info.birthdate).format('MM') : '',
        year: response.personal_info?.birthdate != null ? moment(response.personal_info.birthdate).format('YYYY') : '',
        line1: response.personal_info?.address,
        city: response.personal_info?.city_id,
        postal_code: response.personal_info?.zip_code,
        state: response.personal_info?.state_id,
        country: response.personal_info?.country_id,
      }

      const fieldLabels: Record<string, string> = {
        email: 'correo electrónico',
        first_name: 'nombre',
        last_name: 'apellido',
        phone: 'número de teléfono',
        day: 'día de nacimiento',
        month: 'mes de nacimiento',
        year: 'año de nacimiento',
        line1: 'dirección',
        city: 'ciudad',
        postal_code: 'código postal',
        state: 'provincia',
        country: 'país',
      };

      const missingFields = Object.entries(dataValid)
        .filter(([_, value]) => value === null || value === undefined || value === '')
        .map(([key]) => fieldLabels[key] || key);


      const birthdateFields = ['día de nacimiento', 'mes de nacimiento', 'año de nacimiento'];
      const missingBirthdate = birthdateFields.some(field => missingFields.includes(field));

      let message = missingFields
        .filter(field => !birthdateFields.includes(field))
        .join(', ');

      if (missingBirthdate) {
        message = message ? `${message}, fecha de nacimiento` : 'fecha de nacimiento';
      }

      // const allFieldsFilled = Object.values(dataValid).every(value => value !== null && value !== undefined && value !== '');
      if (missingFields.length === 0) {
        try {
          const dialogRef = this.dialog.open(AddBankAccountModal, {
            width: '500px',
            data: {
              dataValid: dataValid,
              onSuccess: (createStripe: any) => {
                this.stripe_id = createStripe?.id
                this.showLoader = false;
              }
            }
          });
        } catch (error) {
          this.globalService.showInfo({
            msg: 'No es posible proceder, comunicarse con soporte.'
          })
        }
      } else {
        console.log('informacion incompleta')
        this.globalService.showInfo({
          msg: `Información del usuario incompleta: ${message}`
        });
      }
    } else {
      this.isLoadProduct = false;
      this.showLoader = false;
    }
  }

  async getDetailProd(idProd: string) {
    this.showLoader = true;
    try {
      const response: GraphResponse = await this.productService.getDetailProd(parseInt(idProd));
      console.log("🚀 ~ getDetailProd ~ response:", response.data.getProduct);

      if (response.errors) throw (response.errors);

      this.editableProduct = { ...response.data.getProduct };
      this.isLoadProduct = false;
    } catch (error) {
      this.showLoader = false;
      this.isLoadProduct = false;
      console.log("🚀 ~ getDetailProd ~ error:", error)
    }
  }

  async setEditableInForm() {
    const userCurrent = this.userService.currentUser;
    if (!userCurrent) {
      this.globalService.showInfo({
        msg: 'messages.unauthenticated',
      });
      this.router.navigateByUrl('/auth/login');
      this.showLoader = false;
      return;
    }

    if (this.editableProduct.user.id !== userCurrent.id) {
      this.isNoAccess = true;
      this.showLoader = false;
      return;
    }
    const { title, categories, subcategories, description, condition, images, rent_with_option_to_buy,
      daily_price, weekly_price, monthly_price, daily_minimum_rental_time, weekly_minimum_rental_time,
      monthly_minimum_rental_time, daily_maximum_rental_time, weekly_maximum_rental_time, monthly_maximum_rental_time,
      sale_price, daily_minimum_rental_time_to_buy, weekly_minimum_rental_time_to_buy, monthly_minimum_rental_time_to_buy,
      location
    } = this.editableProduct;
    if (categories.length > 0) await this.getSubcategorie(categories[0].id);
    await this.getStatesByCountry(location?.country.id ?? '');

    this.selectedImages.splice(0, images.length);
    this.stepUploadImage.setValue({ imageFiles: 'added' });


    this.stepInformationProduct.patchValue({
      titleProd: title,
      categoryProd: categories[0]?.id,
      subcategoryProd: subcategories[0]?.id,
      descriptionProd: description,
      stateProd: condition.toString(),
    });

    this.stepPriceProduct.patchValue({
      rentalWithBuyOp: rent_with_option_to_buy,
      rentalPriceDay: daily_price?.toString(),
      rentalPriceWeek: weekly_price?.toString(),
      rentalPriceMonth: monthly_price?.toString(),
      minTimeRentalDay: daily_minimum_rental_time?.toString(),
      minTimeRentalWeek: weekly_minimum_rental_time?.toString(),
      minTimeRentalMonth: monthly_minimum_rental_time?.toString(),
      maxTimeRentalDay: daily_maximum_rental_time?.toString(),
      maxTimeRentalWeek: weekly_maximum_rental_time?.toString(),
      maxTimeRentalMonth: monthly_maximum_rental_time?.toString(),
      salePrice: sale_price?.toString(),
      minTimeRentalBuyDay: daily_minimum_rental_time_to_buy?.toString(),
      minTimeRentalBuyWeek: weekly_minimum_rental_time_to_buy?.toString(),
      minTimeRentalBuyMonth: monthly_minimum_rental_time_to_buy?.toString(),
    });

    const completeCountry = this.countries.filter(item => item.id == location?.country_id);

    const completeState = this.states.filter(item => item.id == location?.state_id);

    // this.isEnterAddress = false;

    const shortCountry = this.countryLocale.filter(country => country.translations['spa'].common.toLowerCase() == completeCountry[0].name.toLowerCase());
    this.countrySelected = shortCountry[0].altSpellings[0];
    // setTimeout(() => {
    //   this.isEnterAddress = true;
    // }, 500);

    this.stepAddressInfo.patchValue({
      country: completeCountry[0].name,
      range: location?.displacement_range,
      addressMeet: location?.delivery_address,
      province: completeState[0].name,
      postalCode: location?.zip_code
    });

    const address = document.querySelector('#meetAddress') as HTMLInputElement;
    address.value = location?.delivery_address ?? '';

    this.latitude = location?.latitude ?? 0;
    this.longitude = location?.longitude ?? 0;
    this.zoom = 8;
    this.center = { lat: this.latitude, lng: this.longitude };
    this.markerPosition = { lat: this.latitude, lng: this.longitude };

    if (location?.displacement_range) {
      this.radiusMarker = location?.displacement_range * 1000;
    }

    console.log("🚀 ~ setEditableInForm ~ this.radiusMarker:", this.radiusMarker)

    this.showLoader = false;
  }

  back() {
    this.router.navigateByUrl('/products/manage-products');
  }

  haveErrMaxTimeRental() {
    if (this.isInvalidRentalMaxTimeRental('day')) return true;
    if (this.isInvalidRentalMaxTimeRental('week')) return true;
    if (this.isInvalidRentalMaxTimeRental('month')) return true;
    return false;
  }

  haveErrMinTimeRental() {
    if (this.isInvalidRentalMinTimeRental('day')) return true;
    if (this.isInvalidRentalMinTimeRental('week')) return true;
    if (this.isInvalidRentalMinTimeRental('month')) return true;
    return false;
  }

  msgErrMinTimeRental() {

    const { minTimeRentalDay, minTimeRentalMonth, minTimeRentalWeek } = this.stepPriceProduct.value;

    if (!minTimeRentalDay && !minTimeRentalMonth && !minTimeRentalWeek) {
      return 'pages.upload_prod.min_time_rent_err';
    }

    if (this.isInvalidRentalMinTimeRental('day')) return 'pages.upload_prod.min_time_rent_err_msg';
    if (this.isInvalidRentalMinTimeRental('week')) return 'pages.upload_prod.min_time_rent_err_msg';
    if (this.isInvalidRentalMinTimeRental('month')) return 'pages.upload_prod.min_time_rent_err_msg';

    return '';
  }

  //#region  GET FORM VALUE

  get titleProd() {
    return this.stepInformationProduct.get('titleProd');
  }

  get categoryProd() {
    return this.stepInformationProduct.get('categoryProd');
  }

  get subcategoryProd() {
    return this.stepInformationProduct.get('subcategoryProd');
  }

  get descriptionProd() {
    return this.stepInformationProduct.get('descriptionProd');
  }

  get stateProd() {
    return this.stepInformationProduct.get('stateProd');
  }

  get rentalWithBuyOp() {
    return this.stepPriceProduct.get('rentalWithBuyOp');
  }

  get salePrice() {
    return this.stepPriceProduct.get('salePrice');
  }

  get country() {
    return this.stepAddressInfo.get('country');
  }

  get province() {
    return this.stepAddressInfo.get('province');
  }

  get postalCode() {
    return this.stepAddressInfo.get('postalCode');
  }

  get addressMeet() {
    return this.stepAddressInfo.get('addressMeet');
  }

  //#endregion

  addMarker(event: google.maps.MapMouseEvent) {
    console.log("🚀 ~ addMarker ~ event:", event)
    if (event.latLng) {
      const { lat, lng } = event.latLng;
      this.markerPosition = event.latLng.toJSON();
      this.latitude = lat();
      this.longitude = lng();
    }
  }

  dragMarker(event: google.maps.MapMouseEvent) {
    console.log("🚀 ~ dragMarker ~ event:", event);
    if (event.latLng) {
      const { lat, lng } = event.latLng;
      this.markerPosition = event.latLng.toJSON();
      this.latitude = lat();
      this.longitude = lng();
    }
  }

  private _filterCountry(value: string): Country[] {
    const filterValue = value.toLowerCase();

    return this.countries.filter(option => {

      if (option.name) {
        return option.name.toLowerCase().includes(filterValue);
      }

      return option.name.toLowerCase().includes(filterValue);
    }
    );
  }

  private _filterState(value: string): StateData[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(option => {

      if (option.name) {
        return option.name.toLowerCase().includes(filterValue);
      }

      return option.name.toLowerCase().includes(filterValue);
    }
    );
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }

  goHome() {
    this.router.navigateByUrl('/');
  }

  onChangeStep(event: StepperSelectionEvent) {
    this.stepsResolve = event.selectedIndex;
  }

  async onSelectImage(index: number, event: Event) {
    try {
      if (!event.target) return;
  
      const targetInput = event.target as HTMLInputElement;
      if (!targetInput.files?.length) return;
  
      const file = targetInput.files[0];
      
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error('Invalid file type');
      }
  
      const img = await this.globalService.processImage(targetInput.files);
      this.selectedImages[index].image = img;
  
      if (this.isAddedProdImages()) {
        this.stepUploadImage.setValue({ imageFiles: 'added' });
      }
    } catch (error) {
      console.log("🚀 ~ onSelectImage ~ error:", error);
      this.globalService.showInfo({
        msg: 'pages.upload_prod.err_select_img'
      });
    }
  }
  isAddedProdImages() {
    let imgAdded = [];

    this.selectedImages.map(item => {
      if (item.image) imgAdded.push(item);
    });

    return imgAdded.length > 1;
  }

  removeImage(index: number) {
    const inputFile = document.querySelector(`#upload${index}`) as HTMLInputElement;
    if (inputFile) {
      inputFile.files = null;
      inputFile.value = "";
    }

    this.selectedImages[index].image = undefined;

    const resEmpty = this.selectedImages.filter(img => !img.image)

    if (resEmpty.length) {
      const { imageFiles } = this.stepUploadImage.controls
      imageFiles.setValue('');
    }
  }

  async editRemoveImage(idImg: string) {
    const isDeleted = await this.deleteImageProduct(idImg);
    if (isDeleted) {
      const { images } = this.editableProduct;
      const imgFilterd = images.filter((img, i) => img.id !== idImg);
      this.editableProduct.images = [...imgFilterd];

      this.selectedImages.unshift({
        index: 7 - (this.selectedImages.length + this.editableProduct.images.length),
        image: undefined,
      });
    }

    const resEmpty = this.selectedImages.filter(img => !img.image)

    if (resEmpty.length) {
      const { imageFiles } = this.stepUploadImage.controls
      imageFiles.setValue('');
    }

  }

  validate() {
    let response = this.globalService.getData(this.globalService.STORAGE_USER)
    if (this.stripe_id != null) {
      this.isPressNext = true;

      // STEP INFORMATION PRODUCT
      if (this.currentStep == 1) {
        if (this.stepInformationProduct.status == 'INVALID') {
          this.showErrorsInfoProduct = true;
        }
        if (!this.isEditMode) {
          this.stepPriceProduct.setErrors({ empty: true });
        }
      }

      if (this.currentStep == 2) {
        this.validationInputPrice();
      }
    } else {
      if (response.stripe_id == null) {
        const ref = this.globalService.showInfoBank()
        ref.afterClosed().subscribe(resp => this.createStripe(response))
      }
    }
  }

  onSelectCategory(event: MatSelectChange) {
    this.getSubcategorie(event.value);
  }

  async getSubcategorie(idCategory: string) {
    this.isLoadSubcategories = true;
    try {
      const response: GraphResponse = await this.storeService.getListSubcategories(idCategory);
      console.log("🚀 ~ getSubcategorie ~ response:", response.data);
      this.subcategories = response.data.subCategories;
      this.subcategoryProd?.enable();
      this.isLoadSubcategories = false;
    } catch (error) {
      this.isLoadSubcategories = false;
      console.log("🚀 ~ getSubcategorie ~ error:", error);
    }
  }

  moveDone() {
    this.currentStep = this.stepsResolve;
  }

  //#region  METHODS USED IN STEP - PRICE PROD
  isInvalidRentalPrice(period: 'day' | 'week' | 'month') {

    const {
      rentalWithBuyOp,
      rentalPriceDay, rentalPriceMonth, rentalPriceWeek,
      minTimeRentalDay, minTimeRentalMonth, minTimeRentalWeek,
      maxTimeRentalDay, maxTimeRentalMonth, maxTimeRentalWeek,
      minTimeRentalBuyDay, minTimeRentalBuyWeek, minTimeRentalBuyMonth,
    } = this.stepPriceProduct.controls;

    const isAddedPrice = Boolean(rentalPriceDay.value) || Boolean(rentalPriceMonth.value) || Boolean(rentalPriceWeek.value);

    if (!this.showErrorsPriceProduct && !this.stepPriceProduct.touched) return;

    if (period == 'day') {
      if ((minTimeRentalDay.value || maxTimeRentalDay.value) && !rentalPriceDay.value) return true;
      if (Boolean(rentalPriceDay.value) && rentalPriceDay.status == 'INVALID') return true;
      if (rentalWithBuyOp.value && !minTimeRentalDay.value && minTimeRentalBuyDay.value) return true;
      if (!isAddedPrice) return true;
    }

    if (period == 'week') {
      if ((minTimeRentalWeek.value || maxTimeRentalWeek.value) && !rentalPriceWeek.value) return true;
      if (Boolean(rentalPriceWeek.value) && rentalPriceWeek.status == 'INVALID') return true;
      if (rentalWithBuyOp.value && !minTimeRentalWeek.value && minTimeRentalBuyWeek.value) return true;
      if (!isAddedPrice) return true;
    }

    if (period == 'month') {
      if ((minTimeRentalMonth.value || maxTimeRentalMonth.value) && !rentalPriceMonth.value) return true;
      if (Boolean(rentalPriceMonth.value) && rentalPriceMonth.status == 'INVALID') return true;
      if (rentalWithBuyOp.value && !minTimeRentalMonth.value && minTimeRentalBuyMonth.value) return true;
      if (!isAddedPrice) return true;
    }

    return false;
  }

  isInvalidRentalMinTimeRental(period: 'day' | 'week' | 'month') {

    const {
      rentalPriceDay, rentalPriceMonth, rentalPriceWeek, rentalWithBuyOp,
      minTimeRentalDay, minTimeRentalMonth, minTimeRentalWeek,
      maxTimeRentalDay, maxTimeRentalMonth, maxTimeRentalWeek,
      minTimeRentalBuyDay, minTimeRentalBuyWeek, minTimeRentalBuyMonth,
    } = this.stepPriceProduct.controls;

    if (!this.showErrorsPriceProduct && !this.stepPriceProduct.touched) return false;

    if (period == 'day') {
      if (rentalWithBuyOp.value && !rentalPriceDay.value && minTimeRentalBuyDay.value) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (rentalPriceDay.value && !minTimeRentalDay.value) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (Boolean(minTimeRentalDay.value) && minTimeRentalDay.status == 'INVALID') {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (typeof minTimeRentalDay.value == 'string') {
        if (parseInt(minTimeRentalDay.value!) < parseInt(maxTimeRentalDay.value!)) return false;
      }
      if (minTimeRentalDay.value! > maxTimeRentalDay.value!) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
    }

    if (period == 'week') {
      if (rentalWithBuyOp.value && !rentalPriceWeek.value && minTimeRentalBuyWeek.value) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (rentalPriceWeek.value && !minTimeRentalWeek.value) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (Boolean(minTimeRentalWeek.value) && minTimeRentalWeek.status == 'INVALID') {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }

      if (typeof minTimeRentalWeek.value == 'string') {
        if (parseInt(minTimeRentalWeek.value!) < parseInt(maxTimeRentalWeek.value!)) return false;
      }

      if (minTimeRentalWeek.value! > maxTimeRentalWeek.value!) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
    }

    if (period == 'month') {
      if (rentalWithBuyOp.value && !rentalPriceMonth.value && minTimeRentalBuyMonth.value) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (rentalPriceMonth.value && !minTimeRentalMonth.value) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (Boolean(minTimeRentalMonth.value) && minTimeRentalMonth.status == 'INVALID') {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
      if (typeof minTimeRentalMonth.value == 'string') {
        if (parseInt(minTimeRentalMonth.value!) < parseInt(minTimeRentalMonth.value!)) return false;
      }

      if (minTimeRentalMonth.value! > minTimeRentalMonth.value!) {
        this.stepPriceProduct.setErrors({ minTime: true });
        return true;
      }
    }

    return false;
  }

  isInvalidRentalMaxTimeRental(period: 'day' | 'week' | 'month') {

    const {
      rentalWithBuyOp,
      rentalPriceDay, rentalPriceMonth, rentalPriceWeek,
      maxTimeRentalDay, maxTimeRentalMonth, maxTimeRentalWeek,
      minTimeRentalDay, minTimeRentalMonth, minTimeRentalWeek,
      minTimeRentalBuyDay, minTimeRentalBuyWeek, minTimeRentalBuyMonth,

    } = this.stepPriceProduct.controls;

    if (!this.showErrorsPriceProduct && !this.stepPriceProduct.touched) return;

    if (period == 'day') {
      if (rentalWithBuyOp.value && !rentalPriceDay.value && minTimeRentalBuyDay.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (rentalPriceDay.value && !maxTimeRentalDay.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (maxTimeRentalDay.value && !minTimeRentalDay.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (rentalPriceDay.value && !Boolean(maxTimeRentalDay.value) && !Boolean(minTimeRentalDay.value)) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (Boolean(maxTimeRentalDay.value) && maxTimeRentalDay.status == 'INVALID') {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }

      if (typeof minTimeRentalDay.value == 'string') {
        if (parseInt(minTimeRentalDay.value!) >= parseInt(maxTimeRentalDay.value!)) {
          this.stepPriceProduct.setErrors({ maxTime: true });
          return true;
        }
        if (parseInt(minTimeRentalDay.value!) <= parseInt(maxTimeRentalDay.value!)) return false;
      }

      if (Boolean(maxTimeRentalDay.value) && minTimeRentalDay.value! >= maxTimeRentalDay.value!) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
    }

    if (period == 'week') {
      if (rentalWithBuyOp.value && !rentalPriceWeek.value && minTimeRentalBuyWeek.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (rentalPriceWeek.value && !maxTimeRentalWeek.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (maxTimeRentalWeek.value && !minTimeRentalWeek.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (rentalPriceWeek.value && !Boolean(maxTimeRentalWeek.value) && !Boolean(minTimeRentalWeek.value)) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (Boolean(maxTimeRentalWeek.value) && maxTimeRentalWeek.status == 'INVALID') {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }

      if (typeof minTimeRentalWeek.value == 'string') {
        if (parseInt(minTimeRentalWeek.value!) >= parseInt(maxTimeRentalWeek.value!)) {
          this.stepPriceProduct.setErrors({ maxTime: true });
          return true;
        }
        if (parseInt(minTimeRentalWeek.value!) <= parseInt(maxTimeRentalWeek.value!)) return false;
      }

      if (Boolean(maxTimeRentalWeek.value) && minTimeRentalWeek.value! >= maxTimeRentalWeek.value!) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
    }

    if (period == 'month') {
      if (rentalWithBuyOp.value && !rentalPriceMonth.value && minTimeRentalBuyMonth.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (rentalPriceMonth.value && !maxTimeRentalMonth.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (maxTimeRentalMonth.value && !minTimeRentalMonth.value) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (rentalPriceMonth.value && !Boolean(maxTimeRentalMonth.value) && !Boolean(minTimeRentalMonth.value)) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
      if (Boolean(maxTimeRentalMonth.value) && maxTimeRentalMonth.status == 'INVALID') {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }

      if (typeof minTimeRentalMonth.value == 'string') {
        if (parseInt(minTimeRentalMonth.value!) >= parseInt(minTimeRentalMonth.value!)) {
          this.stepPriceProduct.setErrors({ maxTime: true });
          return true;
        }
        if (parseInt(minTimeRentalMonth.value!) <= parseInt(maxTimeRentalMonth.value!)) return false;
      }

      if (Boolean(maxTimeRentalMonth.value) && minTimeRentalMonth.value! >= maxTimeRentalMonth.value!) {
        this.stepPriceProduct.setErrors({ maxTime: true });
        return true;
      }
    }

    return false;
  }

  isInvalidMaxTimeBuyRental(period: 'day' | 'week' | 'month') {

    const {
      rentalWithBuyOp, maxTimeRentalDay, maxTimeRentalWeek, maxTimeRentalMonth,
      minTimeRentalBuyDay, minTimeRentalBuyWeek, minTimeRentalBuyMonth,
      minTimeRentalDay, minTimeRentalMonth, minTimeRentalWeek
    } = this.stepPriceProduct.controls;

    if (!this.showErrorsPriceProduct && !this.stepPriceProduct.touched && !rentalWithBuyOp.value) return false;

    const isAddedTime = Boolean(minTimeRentalBuyDay.value) || Boolean(minTimeRentalBuyWeek.value) || Boolean(minTimeRentalBuyMonth.value);

    if (!isAddedTime) return true;

    if (period == 'day') {
      console.log('maxTimeRentalDay.value', maxTimeRentalDay.value, 'minTimeRentalBuyDay.value', minTimeRentalBuyDay.value)
      if (minTimeRentalDay.value == "" || !minTimeRentalDay.value) return false;
      if (rentalWithBuyOp.value && Boolean(minTimeRentalBuyDay.value) && minTimeRentalBuyDay.status == 'INVALID') return true;
      if (typeof minTimeRentalDay.value == 'string') {
        if (parseInt(minTimeRentalDay.value!) <= parseInt(minTimeRentalBuyDay.value!)) return false;
      }
      if (minTimeRentalBuyDay.value! >= maxTimeRentalDay.value!) return 'max'
      if (minTimeRentalDay.value! >= minTimeRentalBuyDay.value!) return true;
    }

    if (period == 'week') {
      if (minTimeRentalWeek.value == "" || !minTimeRentalWeek.value) return false;
      if (rentalWithBuyOp.value && Boolean(minTimeRentalBuyWeek.value) && minTimeRentalBuyWeek.status == 'INVALID') return true;

      if (typeof minTimeRentalWeek.value == 'string') {
        if (parseInt(minTimeRentalWeek.value!) <= parseInt(minTimeRentalBuyWeek.value!)) return false;
      }
      if (minTimeRentalWeek.value! >= maxTimeRentalWeek.value!) return 'max'
      if (minTimeRentalWeek.value! >= minTimeRentalBuyWeek.value!) return true;
    }

    if (period == 'month') {
      if (minTimeRentalMonth.value == "" || !minTimeRentalMonth.value) return false;
      if (rentalWithBuyOp.value && Boolean(minTimeRentalBuyMonth.value) && minTimeRentalBuyMonth.status == 'INVALID') return true;
      if (typeof minTimeRentalMonth.value == 'string') {
        if (parseInt(minTimeRentalMonth.value!) <= parseInt(minTimeRentalBuyMonth.value!)) return false;
      }
      if (minTimeRentalMonth.value! >= maxTimeRentalMonth.value!) return 'max'
      if (minTimeRentalMonth.value! >= minTimeRentalBuyMonth.value!) return true;
    }

    return false;
  }

  labelErrorBuyRental() {

    const {
      minTimeRentalBuyDay, minTimeRentalBuyWeek, minTimeRentalBuyMonth,
    } = this.stepPriceProduct.value;

    const isEmpty = minTimeRentalBuyDay == "" && minTimeRentalBuyWeek == "" && minTimeRentalBuyMonth == "";

    if (isEmpty) return '';

    const invalidDay = this.isInvalidMaxTimeBuyRental('day');
    const invalidWeek = this.isInvalidMaxTimeBuyRental('week');
    const invalidMonth = this.isInvalidMaxTimeBuyRental('month');

    if (invalidDay == 'max' || invalidWeek == 'max' || invalidMonth == 'max') {
      return 'El tiempo mínimo para poder comprarlo debe ser menor al tiempo maximo de alquiler';
    }
    if (invalidDay || invalidWeek || invalidMonth) {
      return 'pages.upload_prod.min_time_buy_err';
    }

    return '';
  }

  isInvalidPriceSale() {
    const { salePrice, rentalWithBuyOp } = this.stepPriceProduct.controls;

    if (!this.showErrorsPriceProduct && !this.stepPriceProduct.touched && !rentalWithBuyOp.value) return false;

    if (!salePrice.value) return true;

    if (salePrice.status == 'INVALID') return true;

    return false;
  }

  validationInputPrice() {

    this.showErrorsPriceProduct = true;

    const {
      rentalPriceDay, rentalPriceMonth, rentalPriceWeek,
      minTimeRentalBuyDay, minTimeRentalBuyMonth, minTimeRentalBuyWeek,
      maxTimeRentalDay, maxTimeRentalMonth, maxTimeRentalWeek,
      minTimeRentalDay, minTimeRentalWeek, minTimeRentalMonth,
      rentalWithBuyOp
    } = this.stepPriceProduct.controls;

    const isEmptyRentalPrice = !rentalPriceDay.value && !rentalPriceMonth.value && !rentalPriceWeek.value;
    const isEmptyMinTimeRental = !minTimeRentalDay.value && !minTimeRentalWeek.value && !minTimeRentalMonth.value;
    const isEmptyMaxTimeRental = !maxTimeRentalDay.value && !maxTimeRentalMonth.value && !maxTimeRentalWeek.value;
    const isEmptyMinTimeRentalBuy = !minTimeRentalBuyDay.value && !minTimeRentalBuyMonth.value && !minTimeRentalBuyWeek.value;

    const haveErrRentalPrice = rentalPriceDay.status == 'INVALID' || rentalPriceMonth.status == 'INVALID' || rentalPriceWeek.status == 'INVALID';
    const haveErrMinTimeRental = minTimeRentalDay.status == 'INVALID' || minTimeRentalWeek.status == 'INVALID' || minTimeRentalMonth.status == 'INVALID';
    const haveErrMaxTimeRental = maxTimeRentalDay.status == 'INVALID' || maxTimeRentalMonth.status == 'INVALID' || maxTimeRentalWeek.status == 'INVALID';
    const haveErrMinTimeRentalBuy = minTimeRentalBuyDay.status == 'INVALID' || minTimeRentalBuyMonth.status == 'INVALID' || minTimeRentalBuyWeek.status == 'INVALID';

    if (isEmptyRentalPrice) return 'Min fill one field';
    if (isEmptyMinTimeRental) return 'Min fill one field';
    if (isEmptyMaxTimeRental) return 'Min fill one field';

    if (haveErrRentalPrice) return 'Invalid values';
    if (haveErrMinTimeRental) return 'Invalid values';
    if (haveErrMaxTimeRental) return 'Invalid values';

    if (rentalWithBuyOp.value) {
      const isInvalidPriceSale = this.isInvalidPriceSale();
      if (isInvalidPriceSale) return 'Must have valid price to sold';
      if (isEmptyMinTimeRentalBuy) return 'min have 1 field';
      if (haveErrMinTimeRentalBuy) return 'Invalid values';

      if (rentalPriceDay.value && !minTimeRentalBuyDay.value) return 'INVALID';
      if (rentalPriceWeek.value && !minTimeRentalBuyWeek.value) return 'INVALID';
      if (rentalPriceMonth.value && !minTimeRentalBuyMonth.value) return 'INVALID';

      if (!rentalPriceDay.value && minTimeRentalBuyDay.value) return 'INVALID';
      if (!rentalPriceWeek.value && minTimeRentalBuyWeek.value) return 'INVALID';
      if (!rentalPriceMonth.value && minTimeRentalBuyMonth.value) return 'INVALID';
    }

    if (minTimeRentalDay.value) {
      const isInvalid = this.isInvalidRentalMinTimeRental('day')
      if (isInvalid) return 'INVALID';
    }
    if (minTimeRentalWeek.value) {
      const isInvalid = this.isInvalidRentalMinTimeRental('week')
      if (isInvalid) return 'INVALID';
    }
    if (minTimeRentalMonth.value) {
      const isInvalid = this.isInvalidRentalMinTimeRental('month')
      if (isInvalid) return 'INVALID';
    }

    if (maxTimeRentalDay.value) {
      const isInvalid = this.isInvalidRentalMaxTimeRental('day')
      if (isInvalid) return 'INVALID';
    }
    if (maxTimeRentalWeek.value) {
      const isInvalid = this.isInvalidRentalMaxTimeRental('week')
      if (isInvalid) return 'INVALID';
    }
    if (maxTimeRentalMonth.value) {
      const isInvalid = this.isInvalidRentalMaxTimeRental('month')
      if (isInvalid) return 'INVALID';
    }

    if (rentalPriceDay.value) {
      const isInvalid = this.isInvalidRentalMinTimeRental('day')
      if (isInvalid) return 'INVALID';
    }
    if (rentalPriceMonth.value) {
      const isInvalid = this.isInvalidRentalMinTimeRental('month')
      if (isInvalid) return 'INVALID';
    }
    if (rentalPriceWeek.value) {
      const isInvalid = this.isInvalidRentalMinTimeRental('week')
      if (isInvalid) return 'INVALID';
    }

    if (rentalWithBuyOp.value) {
      if (minTimeRentalBuyDay.value) {
        const isInvalid = this.isInvalidMaxTimeBuyRental('day')
        if (isInvalid) return 'INVALID';
      }

      if (minTimeRentalBuyWeek.value) {
        const isInvalid = this.isInvalidMaxTimeBuyRental('week')
        if (isInvalid) return 'INVALID';
      }

      if (minTimeRentalBuyMonth.value) {
        const isInvalid = this.isInvalidMaxTimeBuyRental('month')
        if (isInvalid) return 'INVALID';
      }
    }


    this.showErrorsPriceProduct = false;

    this.stepper.next();
  }
  //#endregion

  onSelectCountry(event: MatAutocompleteSelectedEvent) {
    const validators = [Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.minLength(5), Validators.maxLength(5), Validators.pattern(this.publicService.regExpPostalCode)];
    const inputPostalCtrl = this.stepAddressInfo.get('postalCode');

    this.countrySelected = '';
    const { value } = event.option;
    const completeCountry = this.countries.filter(item => item.name == value);
    this.province?.setValue('');
    const shortCountry = this.countryLocale.filter(country => country.translations['spa'].common.toLowerCase() == completeCountry[0].name.toLowerCase());

    if (shortCountry[0].altSpellings[0] == 'ES') {
      inputPostalCtrl?.clearValidators();
      inputPostalCtrl?.setValidators(validators);
      inputPostalCtrl?.markAsTouched();
    } else {
      inputPostalCtrl?.clearValidators();
      inputPostalCtrl?.setValidators([Validators.required, Validators.pattern(this.publicService.regExpNumber)]);
    }

    setTimeout(() => {
      this.countrySelected = shortCountry[0].altSpellings[0];
    }, 100);

    this.getStatesByCountry(completeCountry[0].id);
  }

  async getStatesByCountry(idCountry: string) {
    this.isLoadProvince = true;
    try {
      const response: GraphResponse = await this.publicService.getStatesByCountry(idCountry);
      console.log("🚀 ~ getStatesByCountry ~ response:", response.data.getStateByCountry);
      if (response.errors) throw (response.errors);
      this.states = [...response.data.getStateByCountry];
      this.province?.enable();
      this.isLoadProvince = false;
    } catch (error) {
      console.log("🚀 ~ getStatesByCountry ~ error:", error)
      this.isLoadProvince = false;
    }
  }

  onSlideRange(value: number) {
    this.radiusMarker = value * 1000;
  }

  handleAddressChange(address: Address) {
    if (!address.geometry) return;
    const { lat, lng } = address.geometry.location;
    this.addressMeet?.setValue(address.formatted_address);
    this.center = address.geometry.location.toJSON();
    this.markerPosition = address.geometry.location.toJSON();
    this.latitude = lat();
    this.longitude = lng();
  }

  // *************************************************
  async setPayloadUploadProduct(): Promise<AddProductPayload | null> {
    const { titleProd, categoryProd, descriptionProd, stateProd, subcategoryProd } = this.stepInformationProduct.value;
    const { maxTimeRentalDay, maxTimeRentalMonth, maxTimeRentalWeek,
      minTimeRentalBuyDay, minTimeRentalBuyMonth, minTimeRentalBuyWeek,
      minTimeRentalDay, minTimeRentalMonth, minTimeRentalWeek, rentalPriceDay,
      rentalPriceMonth, rentalPriceWeek, rentalWithBuyOp, salePrice
    } = this.stepPriceProduct.value;
    const { addressMeet, country, postalCode, province, range } = this.stepAddressInfo.value;

    if (!rentalPriceMonth && !rentalPriceWeek && !rentalPriceDay) {
      this.globalService.showInfo({ msg: 'pages.upload_prod.should_enter_price' });
      return null;
    }

    if (!minTimeRentalDay && !minTimeRentalMonth && !minTimeRentalWeek) {
      this.globalService.showInfo({ msg: 'pages.upload_prod.min_time_rent_err' });
      return null;
    }

    if (!maxTimeRentalDay && !maxTimeRentalMonth && !maxTimeRentalWeek) {
      this.globalService.showInfo({ msg: 'pages.upload_prod.max_time_rent_err' });
      return null;
    }

    // console.log(this.isInvalidRentalMinTimeRental('day'), this.isInvalidRentalMinTimeRental('month') , this.isInvalidRentalMinTimeRental('week'));
    // console.log(this.isInvalidRentalMaxTimeRental('day'), this.isInvalidRentalMaxTimeRental('month') , this.isInvalidRentalMaxTimeRental('week'));

    if (this.isInvalidRentalMinTimeRental('day') || this.isInvalidRentalMinTimeRental('month') || this.isInvalidRentalMinTimeRental('week')) {
      this.globalService.showInfo({ msg: 'pages.upload_prod.min_time_rent_err' });
      return null;
    }

    if (this.isInvalidRentalMaxTimeRental('day') || this.isInvalidRentalMaxTimeRental('month') || this.isInvalidRentalMaxTimeRental('week')) {
      this.globalService.showInfo({ msg: 'pages.upload_prod.max_time_rent_err' });
      return null;
    }


    const completeCountry = this.countries.filter(item => item.name == country);

    const completeState = this.states.filter(item => item.name == province);

    if (completeCountry.length == 0) {
      this.globalService.showInfo({ msg: 'pages.upload_prod.should_select_country' });
      return null;
    }

    if (completeState.length == 0) {
      this.globalService.showInfo({ msg: 'pages.upload_prod.should_select_province' });
      return null;
    }

    const response: AddProductPayload = {
      title: titleProd ?? '',
      subcategory_id: subcategoryProd ?? '',
      description: descriptionProd ?? '',
      category_id: categoryProd ?? '',
      condition: stateProd ?? '',
      daily_price: parseFloat(rentalPriceDay ?? ''),
      weekly_price: parseFloat(rentalPriceWeek ?? ''),
      monthly_price: parseFloat(rentalPriceMonth ?? ''),
      daily_minimum_rental_time: parseInt(minTimeRentalDay ?? ''),
      weekly_minimum_rental_time: parseInt(minTimeRentalWeek ?? ''),
      monthly_minimum_rental_time: parseInt(minTimeRentalMonth ?? ''),
      daily_maximum_rental_time: parseInt(maxTimeRentalDay ?? ''),
      weekly_maximum_rental_time: parseInt(maxTimeRentalWeek ?? ''),
      monthly_maximum_rental_time: parseInt(maxTimeRentalMonth ?? ''),
      rent_with_option_to_buy: rentalWithBuyOp ?? false,
      sale_price: parseFloat(salePrice ?? ''),
      country: completeCountry[0].id,
      state: completeState[0].id,
      zip_code: postalCode ?? '',
      address: addressMeet ?? '',
      daily_minimum_rental_time_to_buy: parseInt(minTimeRentalBuyDay ?? ''),
      weekly_minimum_rental_time_to_buy: parseInt(minTimeRentalBuyWeek ?? ''),
      monthly_minimum_rental_time_to_buy: parseInt(minTimeRentalBuyMonth ?? ''),
      latitud: this.latitude,
      longitud: this.longitude,
      displacement_range: range ?? 0
    };

    return response;
  }

  isValidateLocationProduct() {

    const valuesForm: any = this.stepAddressInfo.value;
    const valuesCtrl: any = this.stepAddressInfo.controls;
    const arrKeysForm: string[] = Object.keys(valuesForm).reverse();

    let isValid = true;
    let msg = 'messages.should_enter_min_1_field';

    const errMsg: { [key: string]: string } = {
      country: 'pages.upload_prod.should_select_country',
      province: 'pages.upload_prod.should_select_province',
      postalCode: 'pages.upload_prod.should_postal_code',
      addressMeet: 'pages.upload_prod.should_address_meet',
      range: 'pages.upload_prod.should_range_location'
    };

    arrKeysForm.forEach((key: string) => {

      if (valuesForm[key] == '' || valuesForm[key] == 0 || valuesCtrl[key].invalid || valuesCtrl[key].errors) {
        msg = errMsg[key];
        isValid = false;
        return false;
      }
    });

    if (!isValid) this.globalService.showInfo({ msg });

    return isValid;
  }

  async uploadProduct() {
    this.showLoader = true;
    try {
      const isValid = this.isValidateLocationProduct();
      if (!isValid) return this.showLoader = false;

      const payload = await this.setPayloadUploadProduct();
      if (!payload) return this.showLoader = false;
      const response: GraphResponse = await this.storeService.uploadProduct(payload);
      if (response.errors) throw (response.errors);
      console.log("🚀 ~ uploadProduct ~ response:", response.data);
      const product: ProductInfo = response.data.createProduct;
      this.idProductCreated = product.id;
      this.titleProductCreated = product.title;
      this.uploadImageProduct(product.id);
    } catch (error) {
      this.showLoader = false;
      console.log("🚀 ~ uploadProduct ~ error:", error);
      this.globalService.showInfo({
        msg: 'pages.upload_prod.err_create_prod'
      });
    }
  }

  async uploadImageProduct(productID: string) {
    try {
      let imgSelected: Photo[] = [];
      this.selectedImages.forEach(item => {
        if (item.image) {
          imgSelected.push(item.image);
        }
      });

      const response: GraphResponse = await this.storeService.uploadImageProduct(imgSelected, productID);
      if (response.errors) throw (response.errors);
      this.stepper.next();
      this.stepUploadImage.reset();
      this.stepInformationProduct.reset();
      this.stepPriceProduct.reset();
      this.stepPrice.editable = false;
      this.stepPrice.completed = false;
      this.stepAddressInfo.reset();
      this.selectedImages.forEach((item, index) => { if (item.image) this.removeImage(index); });
      this.latitude = 0;
      this.longitude = 0;
      this.addressMeet?.setValue(null);
      this.showLoader = false;

      this.productService.userProducts = [];
      this.productService.userDeletedProducts = [];

      this.globalService.showInfo({
        msg: 'pages.upload_prod.product_added_success'
      });

    } catch (error) {
      this.showLoader = false;
      this.globalService.showInfo({
        msg: 'pages.upload_prod.err_create_prod'
      });
      console.log("🚀 ~ uploadImageProduct ~ error:", error)
    }
  }

  sharedFacebook() {
    const url = `${location.origin}/products/${this.titleProductCreated.replace(/\s+/g, '-')}/${this.idProductCreated}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=${url}&display=popup&ref=plugin&src=share_button`, `${this.lang._('components.shared.shared_in', { type: 'Facebook' })}`, "width=500,height=400");
  }

  sharedEmail() {
    const url = `${location.origin}/products/${this.titleProductCreated.replace(/\s+/g, '-')}/${this.idProductCreated}`;
    window.open(`mailto:?subject=${this.lang._('components.shared.look_this_in_tenlow')}&amp;body=${this.lang._('components.shared.look_this_interest_tenlow', { type: "producto" })} ${url}.`, ` ${this.lang._('components.shared.shared_in', { type: 'Email' })}`, "width=500,height=400");
  }

  sharedTikTok() { }

  async deleteImageProduct(imgId: string) {
    this.showLoaderUpdateImg = true;
    try {
      const response: GraphResponse = await this.productService.deleteImageProduct(imgId);
      if (response.errors) throw (response.errors);
      this.showLoaderUpdateImg = false;
      return true;
    } catch (error) {
      console.log("🚀 ~ deleteImage ~ error:", error)
      this.globalService.showInfo({
        msg: 'pages.upload_prod.err_delete_img_prod'
      });
      this.showLoaderUpdateImg = false;
      return false;
    }
  }

  async updateProduct() {
    try {
      const payload = await this.setPayloadUploadProduct();
      console.log("🚀 ~ updateProduct ~ payload:", payload);
      if (!payload) return;
      const response: GraphResponse = await this.storeService.updateProduct(payload, this.editableProduct.id, this.editableProduct.status);
      if (response.errors) throw (response.errors);
      console.log("🚀 ~ uploadProduct ~ response:", response.data);
      this.editableProduct = response.data.updateProduct;

      this.showLastStep = true;
      this.productService.eventUpdateProduct.next(response.data.updateProduct);

      setTimeout(() => {
        this.showLoader = false;
        this.stepper.next();
        this.globalService.showInfo({
          msg: 'pages.upload_prod.product_update_success'
        });
      }, 500);
    } catch (error) {
      this.showLoader = false;
      console.log("🚀 ~ uploadProduct ~ error:", error);
      this.globalService.showInfo({
        msg: 'pages.upload_prod.err_update_prod'
      });
    }
  }

  async uploadUpdateImageProduct() {
    this.showLoader = true;
    try {

      if (this.stepAddressInfo.invalid) return this.showLoader = false;

      const isValid = this.isValidateLocationProduct();
      if (!isValid) return this.showLoader = false;

      const payload = await this.setPayloadUploadProduct();
      if (!payload) return this.showLoader = false;

      let imgSelected: Photo[] = [];

      this.selectedImages.forEach(item => {
        if (item.image) {
          imgSelected.push(item.image);
        }
      });

      const response: GraphResponse = await this.storeService.uploadUpdateImageProduct(imgSelected, this.editableProduct.id);
      if (response.errors) throw (response.errors);
      this.updateProduct();

    } catch (error) {
      this.showLoader = false;
      this.globalService.showInfo({
        msg: 'pages.upload_prod.err_update_prod'
      });
      console.log("🚀 ~ uploadImageProduct ~ error:", error)
    }
  }


  getRangeText() {
    if (this.radiusMarker > 100) {
      return this.radiusMarker / 1000;
    }

    return this.radiusMarker;
  }
}
