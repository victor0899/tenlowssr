import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Observable, map, startWith } from 'rxjs';
import { CityData, Country, CountryData, StateData } from 'src/app/interfaces/countries';
import { GraphResponse } from 'src/app/interfaces/graph';
import { FIELDS_PROFILE, ItemViewProfile, ParamsUpdateProfile, User, VIEWS_SETTING_USER } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-manage-profile',
  templateUrl: './manage-profile.component.html',
  styleUrls: ['./manage-profile.component.scss']
})
export class ManageProfileComponent implements OnInit {

  cssFloatLabel:string = "";
  cssInputTxt:string = "";
  cssSpanValidation:string = "";
  cssInputToggle:string = "";
  user?: User;
  VIEWS = VIEWS_SETTING_USER;
  currentView: VIEWS_SETTING_USER | null = null;

  optionsFieldsEdit: Array<ItemViewProfile> = [
    {
      title: 'labels.names_last_names',
      subtitle: 'pages.config_profile.info_view_name',
      view: VIEWS_SETTING_USER.NAME
    },
    {
      title: 'labels.description',
      subtitle: 'pages.config_profile.info_description',
      view: VIEWS_SETTING_USER.DESCRIPTION
    },
    {
      title: 'labels.dni',
      subtitle: 'pages.config_profile.info_dni_view',
      view: VIEWS_SETTING_USER.DNI
    },
    {
      title: 'pages.config_profile.birthday_gender',
      subtitle: 'pages.config_profile.info_birthday_view',
      view: VIEWS_SETTING_USER.BIRTHDAY
    },
    // {
    //   title: 'labels.email',
    //   subtitle: 'pages.config_profile.info_email_view',
    //   view: VIEWS_SETTING_USER.EMAIL
    // },
    // {
    //   title: 'labels.phone_number',
    //   subtitle: 'pages.config_profile.info_phone_view',
    //   view: VIEWS_SETTING_USER.PHONE
    // },
    {
      title: 'labels.postal_address',
      subtitle: 'pages.config_profile.info_postal_view',
      view: VIEWS_SETTING_USER.ADDRESS
    },
  ];

  fields = FIELDS_PROFILE;

  formUpdateProfile!: FormGroup;

  genderList = [
    {
      id: 'male',
      name: 'labels.gender_male',
    },
    {
      id: 'female',
      name: 'labels.gender_female',
    },
    {
      id: 'nonbinary',
      name: 'labels.gender_no_binary',
    },
    {
      id: 'not_answer',
      name: 'labels.gender_other',
    },
  ];

  countries: Array<Country> = [];
  filteredCountry!: Observable<Country[]>;

  states: Array<StateData> = [];
  filteredState!: Observable<StateData[]>;
  isLoadProvince: boolean = false;

  cities: Array<CityData> = [];
  filteredCities!: Observable<CityData[]>;
  isLoadCities: boolean = false;

  isSended: boolean = true;


  mobileQuery!: MediaQueryList;
  private _mobileQueryListener!: () => void;
  isShowExpanded: boolean = false;

  // AUTOCOMPLETE DIRECTIONS
  countryLocale: CountryData[] = [];
  center: google.maps.LatLngLiteral = {lat: 40, lng: -3};
  countrySelected: string = "";
  defaultBounds:any = {
    north: this.center.lat + 0.1,
    south: this.center.lat - 0.1,
    east: this.center.lng + 0.1,
    west: this.center.lng - 0.1,
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private media: MediaMatcher,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    public publicService: PublicService,
    private userService: UserService,
    private globalService: GlobalService,
    private authService: AuthService,
    private lang: LangService
  ) {
    this.user = this.userService.currentUser;

    const { params } = this.route.snapshot;

    if( params['option'] ){
      if(params['option'] == 'description'){
        this.selectView(VIEWS_SETTING_USER.DESCRIPTION);
      } else {
        this.selectView(VIEWS_SETTING_USER.NAME);
      }
    }

    this.cssFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-tl-primary text-xs";
    this.cssInputTxt = this.publicService.cssInputBase + " border-tl-dark-2 focus:border-tl-primary bg-transparent focus:border-2";
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + " text-tl-dark-medium !text-xs";
    this.cssInputToggle = this.publicService.cssInputToggle;
    this.countries = this.publicService.countries;
    this.states = this.userService.listStates;
    this.cities = this.userService.listCities;

    const currentCountry = this.countries.filter( item => item.id == this.user?.personal_info?.country_id);
    console.log("🚀 ~ currentCountry:", currentCountry)

    this.formUpdateProfile = this.fb.group({
      name: [this.user?.name, [Validators.required, Validators.minLength(2)]],
      last_name: [this.user?.last_name, [Validators.required, Validators.minLength(2)]],
      dni: [this.user?.personal_info?.dni],
      alias: [this.user?.personal_info?.alias ?? ''],
      gender: [this.user?.personal_info?.gender],
      phone_country_code: [this.user?.personal_info?.phone_country_code],
      country_id: [this.user?.personal_info?.country_id],
      country_name: [currentCountry[0]?.name],
      description: [this.user?.personal_info?.description, [Validators.maxLength(250)]],
      state_id: [this.user?.personal_info?.state_id],
      state_name: [{value: '', disabled: true}],
      city_id: [this.user?.personal_info?.city_id],
      city_name: [''],
      zip_code: [this.user?.personal_info?.zip_code, [ Validators.required, Validators.pattern(this.publicService.regExpNumber), Validators.pattern(this.publicService.regExpPostalCode)]],
      birthDate: [this.user?.personal_info?.birthdate ?? '2000-01-01', [Validators.required]],
      email: [this.user?.email],
      phone: [this.user?.personal_info?.phone],
      address: [this.user?.personal_info?.address],
    });

    if(this.phone_country_code){
      this.filteredCountry = this.phone_country_code.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCountry(value || '')),
      );
    }

    if(this.country_name){
      this.filteredCountry = this.country_name.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCountry(value || '')),
      );
    }

    if(this.state_name){
      this.filteredState = this.state_name.valueChanges.pipe(
        startWith(''),
        map(value => this._filterState(value || '')),
      );
    }

    if(this.city_name){
      this.filteredCities = this.city_name.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCity(value || '')),
      );
    }
    /// **********************************************************************
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

  async ngOnInit() {
    await this.getListCountries();
    await this.setAddressData();
    this.isSended = false;
  }

  async setAddressData(){
    const currentCountry = this.countries.filter( item => item.id == this.user?.personal_info?.country_id);
    if(currentCountry.length == 0) return;

    const shortCountry = this.countryLocale.filter( country => country.translations['spa'].common.toLowerCase() ==  currentCountry[0].name.toLowerCase() );
    this.countrySelected =  shortCountry[0].altSpellings[0];

    const { state_id, city_id } = this.formUpdateProfile.value;

    if( !this.states.length ) {
      await this.getStatesByCountry(currentCountry[0].id);
    }

    const currentState = this.states.filter( item => item.id == state_id);

    if(currentState.length == 0 ) return;

    this.formUpdateProfile.get('state_name')?.setValue(currentState[0].name);

    if(!this.cities.length){
      await this.getCitiesByStates(currentState[0].id)
    }
    const currentCity = this.cities.filter( item => item.id == city_id);

    if(currentCity.length == 0 ) return;
    this.formUpdateProfile.get('city_name')?.setValue(currentCity[0].name);
  }

  back(){
    this.router.navigate([this.lang._locale == 'es' ? 'cuenta/opciones' :'account/options']);
  }

  //#region  FORM GET FIELDS *********************
  get phone_country_code() {
    return this.formUpdateProfile.get('phone_country_code');
  }

  get country_name() {
    return this.formUpdateProfile.get('country_name');
  }

  get description() {
    return this.formUpdateProfile.get('description');
  }

  get state_name() {
    return this.formUpdateProfile.get('state_name');
  }

  get city_name() {
    return this.formUpdateProfile.get('city_name');
  }

  get birthDate() {
    return this.formUpdateProfile.get('birthDate');
  }
  //#endregion

  //#region METHODS FOR AUTOCOMPLETE COMPONENTS *********************
  private _filterCountry(value: string): Country[] {
    const filterValue = value.toLowerCase();

    return this.countries.filter(option =>{

      if(option.name){
        return option.name.toLowerCase().includes(filterValue);
      }

      return option.name.toLowerCase().includes(filterValue);
    }
    );
  }

  private _filterState(value: string): StateData[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(option =>{

      if(option.name){
        return option.name.toLowerCase().includes(filterValue);
      }

      return option.name.toLowerCase().includes(filterValue);
    }
    );
  }

  private _filterCity(value: string): CityData[] {
    const filterValue = value.toLowerCase();

    return this.cities.filter(option =>{

      if(option.name){
        return option.name.toLowerCase().includes(filterValue);
      }

      return option.name.toLowerCase().includes(filterValue);
    }
    );
  }

  onSelectCountry(event: MatAutocompleteSelectedEvent){
    const { value } = event.option;
    this.formUpdateProfile.get('phone')?.setValue(`(${value}) `);
  }

  async getListCountries() {
    try {
      const response: Array<CountryData> = await this.publicService.getCountryList();
      console.log("🚀 ~ getListCountries ~ response:", response);
      this.countryLocale = [...response];
    } catch (error) {
      console.log('err getListCountries()', error);
    }
  }

  onSelectCountryAddress(event: MatAutocompleteSelectedEvent){
    const inputPostalCtrl = this.formUpdateProfile.get('zip_code');
    const validators =  [Validators.required,Validators.pattern(this.publicService.regExpNumber), Validators.minLength(5), Validators.maxLength(5),Validators.pattern(this.publicService.regExpPostalCode)];

    this.countrySelected = '';
    const { value } = event.option;
    const completeCountry = this.countries.filter(item => item.name == value);

    this.formUpdateProfile.get('country_id')?.setValue(completeCountry[0].id);
    this.state_name?.setValue('');
    this.formUpdateProfile.get('address')?.setValue('');
    this.states = [];

    const shortCountry = this.countryLocale.filter( country => country.translations['spa'].common.toLowerCase() ==  completeCountry[0].name.toLowerCase());

    if( shortCountry[0].altSpellings[0] == 'ES' ){
      inputPostalCtrl?.clearValidators();
      inputPostalCtrl?.setValidators( validators );
      inputPostalCtrl?.markAsTouched();
    } else {
      inputPostalCtrl?.clearValidators();
      inputPostalCtrl?.setValidators( [Validators.required,Validators.pattern(this.publicService.regExpNumber)] );
    }

    setTimeout(() => {
      this.countrySelected =  shortCountry[0].altSpellings[0];
    }, 100);

    this.getStatesByCountry(completeCountry[0].id);
  }


  handleAddressChange(address: Address) {
    if(!address.geometry) return;
    this.formUpdateProfile.get('address')?.setValue(address.formatted_address);
    this.center =  address.geometry.location.toJSON();
  }

  async getStatesByCountry(idCountry:string){
    this.isLoadProvince = true;
    try {
      const response:GraphResponse = await this.publicService.getStatesByCountry(idCountry);
      console.log("🚀 ~ getStatesByCountry ~ response:", response.data.getStateByCountry);
      if(response.errors) throw(response.errors);
      this.states = [...response.data.getStateByCountry];
      this.userService.listStates = [...response.data.getStateByCountry];
      this.state_name?.enable();
      this.isLoadProvince = false;
    } catch (error) {
      console.log("🚀 ~ getStatesByCountry ~ error:", error)
      this.isLoadProvince = false;
    }
  }

  onSelectState(event: MatAutocompleteSelectedEvent){
    const { value } = event.option;
    const state = this.states.filter( item => item.name == value);
    this.formUpdateProfile.get('state_id')?.setValue(state[0].id);
    this.getCitiesByStates(state[0].id);
  }

  async getCitiesByStates( stateID: string) {
    try {
      this.isLoadCities = true;
      const response: GraphResponse = await this.publicService.getCititeByStates( stateID );
      console.log("🚀 ~ getCitiesByStates ~ response:", response.data.getCityByState);
      if(response.errors) throw(response.errors);
      this.cities = [...response.data.getCityByState];
      this.userService.listCities = [...response.data.getCityByState];
      this.isLoadCities = false;
    } catch (error) {
      this.isLoadCities = false;
      console.log("🚀 ~ getCitiesByStates ~ error:", error);
    }
  }

  onSelectCity(event: MatAutocompleteSelectedEvent){
    const { value } = event.option;
    const city = this.cities.filter( item => item.name == value);
    console.log("🚀 ~ onSelectCity ~ city:", city)
    if(city){
      this.formUpdateProfile.get('city_id')?.setValue(city[0].id);
    } else {
      this.formUpdateProfile.get('city_id')?.markAsDirty();
    }
  }
  //#endregion

  cancelEdit(){
    this.currentView = null;
  }

  selectView(view:VIEWS_SETTING_USER){
    this.formUpdateProfile.markAsUntouched();
    this.currentView = view;
  }

  onValidate(field: FIELDS_PROFILE){
    const {
      name, last_name, dni, alias, gender, birthDate,
      phone, phone_country_code, city_id, country_id, state_id,
      state_name, city_name, country_name, description,
      address, zip_code
    } = this.formUpdateProfile.controls;

    this.formUpdateProfile.markAllAsTouched();

    if(field == FIELDS_PROFILE.NAME_LAST_NAME){
      if(name.errors && name.invalid){
        return '';
      }

      if(last_name.errors && last_name.invalid){
        return '';
      }
    }

    if(field == FIELDS_PROFILE.ALIAS){
      if(alias.errors && alias.invalid){
        return '';
      }
    }

    if(field == FIELDS_PROFILE.DNI){

      if(dni.errors && dni.invalid){
        return '';
      }

      if(!this.globalService.validateDNI(dni.value)) return '';
    }

    if(field == FIELDS_PROFILE.DESCRIPTION){
      if(description.errors && description.invalid){
        return '';
      }
    }



    if(field == FIELDS_PROFILE.GENDER){
      if(gender.errors && gender.invalid){
        return '';
      }
    }

    if(field == FIELDS_PROFILE.BIRTHDAY){
      if(birthDate.errors && birthDate.invalid){
        return '';
      }

    }

    if(field == FIELDS_PROFILE.PHONE){
      if(phone.errors && phone.invalid){
        return '';
      }
      if(phone_country_code.errors && phone_country_code.invalid){
        return '';
      }
    }

    if(field == FIELDS_PROFILE.ADDRESS){
      if( !city_id.value && city_id.errors && city_id.invalid){
        return '';
      }

      if( !state_id.value && state_id.errors && state_id.invalid){
        return '';
      }

      if( !country_id.value && country_id.errors && country_id.invalid){
        return '';
      }

      if( !state_name.value && state_name.errors && state_name.invalid){
        return '';
      }

      if( !city_name.value && city_name.errors && city_name.invalid){
        return '';
      }

      if( !country_name.value && country_name.errors && country_name.invalid){
        return '';
      }

      if(address.value == '') return '';
      if(zip_code.value == '') return '';
      if( !zip_code.valid  || zip_code.errors ) return '';
    }

    this.updateProfile();
  }

  getErrorLabel( formField:string ){
    const inputCtrl = this.formUpdateProfile.get(formField);

    if(!inputCtrl?.touched) return ''

    if(!inputCtrl?.value) return 'messages.field_required';

    if(formField == 'dni'){
      if(!this.globalService.validateDNI(inputCtrl.value)) return 'messages.enter_valid_field';
    }

    if(inputCtrl?.value == '') return 'messages.field_required';

    if(inputCtrl.errors){
      if(inputCtrl.errors['maxlength']){
        if(formField == 'description') return 'messages.limit_char_description';
      }
      if(inputCtrl.errors['child']){
        return 'messages.should_adult';
      }
    }

    if(inputCtrl?.invalid) return 'messages.enter_valid_field';

    return '';
  }

  setPayload(){
    if(!this.user) return;

    const { name,last_name,alias,dni,gender, birthDate,phone, phone_country_code, city_id, country_id, state_id, address, zip_code, description } = this.formUpdateProfile.value;
    console.log("🚀 ~ setPayload ~ this.formUpdateProfile.value:", this.formUpdateProfile.value)

    const payload: ParamsUpdateProfile = {
      user_id: this.user.id,
      name,
      last_name,
      email: this.user.email,
      alias: alias,
      dni: dni,
      birthdate: dayjs(birthDate).format('YYYY-MM-DD'),
      gender: gender,
      phone_country_code,
      description,
      phone,
      country_id,
      state_id,
      city_id,
      address,
      zip_code
    }

    return payload;
  }
  async updateProfile(){
    try {
      this.isSended = true;

      const params = this.setPayload();
      if(!params) return;

      const response: GraphResponse = await this.userService.updateProfile(params);
      console.log("🚀 ~ updateProfile ~ response:", response);
      if(response.errors) throw(response.errors);
      const { updatePersonalInfo } = response.data;
      this.userService.setCurrentUser( updatePersonalInfo );
      this.authService.eventAuthUser.next( updatePersonalInfo );
      this.user = updatePersonalInfo;
      this.isSended = false;
      this.globalService.showInfo({
        title: 'pages.config_profile.profile_updated',
        msg: 'pages.config_profile.msg_profile_updated'
      });
    } catch (error) {
      this.isSended = false;
      console.log("🚀 ~ updateProfile ~ error:", error)
      this.globalService.showInfo({
        msg: 'messages.global_err'
      });
    } finally {
      this.formUpdateProfile.markAsUntouched();
    }
  }

  onSelectDateBirthday(  ev: MatDatepickerInputEvent<any, Date> ){
    const birthday = dayjs(ev.value);
    const today = dayjs();
    const age = today.diff( birthday, 'years' );
    if( age < 18 ){
      this.formUpdateProfile.get('birthDate')?.setErrors({ child:true });
    }
  }
}
