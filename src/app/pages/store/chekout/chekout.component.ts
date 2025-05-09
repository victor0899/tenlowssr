import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { ModalConfirmComponent } from 'src/app/components/modals/modal-confirm/modal-confirm.component';
import { SelectCollectPointComponent } from 'src/app/components/modals/select-collect-point/select-collect-point.component';
import { GraphResponse } from 'src/app/interfaces/graph';
import { PaymentMethod, ShhipingInfo, UserInfo } from 'src/app/interfaces/payments';
import { HomePaq, SoapResponse } from 'src/app/interfaces/rental';
import { Categorie, CheckoutData, OperationData, OperationShippingMethod, OperationStatus, OperationType, PayloadCheckout, ProductAvailability, ProductConditions, ProductStatus } from 'src/app/interfaces/store';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { PublicService } from 'src/app/services/public.service';
import { RentalService } from 'src/app/services/rental.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
declare var getInSiteForm: any;
declare var storeIdOper: any;
@Component({
  selector: 'app-chekout',
  templateUrl: './chekout.component.html',
  styleUrls: ['./chekout.component.scss']
})
export class ChekoutComponent implements OnInit,AfterViewInit {
  cssSelect:string;
  cssInputDate:string;
  cssDateFloatLabel:string;
  cssSpanValidationDate:string;
  cssRadioInput:string;
  cardFields: Array<string> = [
    "pages.checkout.card_number",
    "pages.checkout.expire",
    "pages.checkout.cvv",
    "labels.country",
    "labels.postal_code"
  ];
  isShowSuccess:boolean = false;
  isCancelRental: boolean = false;
  isSelectShipping: boolean = false;
  checkoutData: CheckoutData;
  categories: Categorie[];
  userInfo:UserInfo = {
    name: '',
    email: '',
    id: null
  }
  shippingInfo:ShhipingInfo = {
    method: '',
    cost: 0,
    label: '',
    address: '',
  };
  addressShipping:string = '';
  isLoad:boolean = false;
  // **********************************
  DS_MERCHANT_IDOPER: string = '';
  DS_MERCHANT_ORDER: string = 'pedido8888';
  // **********************************
  operationData!: OperationData;

  paymentMethods: PaymentMethod[] = [];
  // **********************************
  officeNear: HomePaq[] = [];
  idOfficeSelected!: HomePaq;

  constructor(
    private matDialog: MatDialog,
    private router: Router,
    public publicService: PublicService,
    private storeService: StoreService,
    private globalService: GlobalService,
    private paymentService: PaymentsService,
    private userService: UserService,
    private lang: LangService,
    private rentalService: RentalService
  ) {
    this.cssRadioInput = this.publicService.cssRadioInput;
    this.cssSelect = this.publicService.cssSelect;
    this.cssInputDate = this.publicService.cssInputBase + " focus:border-tl-dark-medium";
    this.cssSpanValidationDate = this.publicService.cssSpanValidationBase + " text-tl-dark-medium";
    this.cssDateFloatLabel = this.publicService.cssFloatLabelBase +  " peer-focus:text-tl-dark-medium";
    this.checkoutData = this.storeService.checkoutInfo;
    console.log("🚀 ~ this.checkoutData:", this.checkoutData);
    this.categories = this.storeService.categories;
  }

  ngOnInit(): void {

    this.getPaymentMethods();

    if(this.checkoutData){
      this.setInStorageCheckout();
      this.getOfficeNear();
      return;
    }

    this.getChekoutInStorage();
  }

  ngAfterViewInit(): void {
    const shipInput = document.getElementById(this.shippingInfo.method) as HTMLInputElement;
    if( shipInput ){
      shipInput.checked = true;
    }
    const { name, email, id } = this.userService.currentUser!;
    this.userInfo = { name: name, email: email, id: id }

    const addressInput = document.getElementById('directionAddress') as HTMLInputElement;
    if(addressInput){
      addressInput.value = this.shippingInfo?.address ?? '';
    }
  }

  isValidUserAddress(){
    const { personal_info } = this.userService.currentUser!;
    const { state_id , zip_code,city_id, country_id} = personal_info!;

    if(!state_id  || !zip_code ||!city_id || !country_id ) return false;

    return true;
  }

  async getOfficeNear(){
    try {
      const { location } = this.checkoutData.product;
      const response:GraphResponse = await this.rentalService.getNearOfficeShipping( location?.zip_code! );
      if(response.errors) throw(response.errors);
      const { getOffices } = response.data;
      console.log("🚀 ~ getOfficeNear:", JSON.parse(getOffices));
      const offices:SoapResponse = JSON.parse(getOffices);
      this.officeNear = offices.soapenv_Body.homePaqRespuesta1.listaHomePaq.homePaq;
    } catch (error) {
      console.log("🚀 ~ getOfficeNear ~ error:", error)
    }
  }

  getTextStateProduct(condition: ProductConditions){
    const txt = {
      excellent: "labels.excellent",
      very_good: "labels.very_good",
      right: "labels.correct",
    }
    return txt[condition];
  }

  async getPaymentMethods(){
    try {
      const response:GraphResponse =  await this.paymentService.getPaymentMethods();
      if(response.errors) throw(response.errors);
      this.paymentMethods = response.data.paymentMethods;
      return;
    } catch (error) {
      console.log("🚀 ~ getPaymentMethods ~ error:", error)
      return;
    }
  }

  getNumberOrder(){
    this.DS_MERCHANT_ORDER = 'pedido' + Math.floor(Math.random() * 9000 + 1000);
    console.log("🚀 ~ getNumberOrder ~ this.DS_MERCHANT_ORDER:", this.DS_MERCHANT_ORDER);
    return this.DS_MERCHANT_ORDER;
  }

  setPaymentForm(): void {

    const _this = this;

    this.setInSiteFormPayment();

    window.addEventListener("message", function receiveMessage(event) {

      if(!event.data.idOper && (typeof event.data !== 'string' )) return;

      console.log("🚀 ~ receiveMessage ~ event:", event.data);

      storeIdOper(event, "token", "errorCode", () => {
        // HERE VALIDATIONS
        return true;
      });

      if(typeof event.data == 'string' ) return;

      if(!event.data.idOper) return;

      if(event.data.idOper == -1){
        _this.modalReloadCheckout();
        return;
      }

      if(event.data.idOper != -1){
        _this.DS_MERCHANT_IDOPER = event.data.idOper;
        _this.doCheckout();
      }
    });
  }

  modalReloadCheckout(){
    const ref = this.globalService.showInfo({
      msg: 'pages.checkout.err_order_repeated_reload'
    });

    ref.afterClosed().subscribe( resp => location.reload() )
  }

  setInSiteFormPayment(){
    getInSiteForm('card-form', '', '', '', '', this.lang._('pages.detail_prod.booking_now'), environment.commerceNumber , '1', this.getNumberOrder()  , 'ES', true);
  }

  goHome(){
    this.router.navigateByUrl('shopping/store');
  }

  modalSelectPointCollect(){
    const ref = this.matDialog.open(SelectCollectPointComponent, {
      data: {
        offices:this.officeNear,
        selected: this.idOfficeSelected
      }
    });
    ref.afterClosed().subscribe( (resp: HomePaq) => {
      if(resp){
        this.shippingInfo.address = `${resp.alias}, ${resp.direccion}`;
        this.idOfficeSelected = resp;
      }
    });
  }

  onSelectCategorie(){}

  setPayloadCheckout(){
    const tempTotal =  this.checkoutData.amount + this.shippingInfo.cost;
    let payload:PayloadCheckout = {
      user_id: this.checkoutData.user_id,
      amount: parseFloat(tempTotal.toFixed(2)),
      product_id: this.checkoutData.product.id,
      type: 'rental',
      init_date: dayjs(this.checkoutData.init_date).format('YYYY-MM-DD'),
      end_date: dayjs(this.checkoutData.end_date).format('YYYY-MM-DD'),
      shipping_method: this.shippingInfo.method,
      shipping_address: this.shippingInfo.address!
    };
    console.log("🚀 ~ setPayloadCheckout ~ payload:", payload)
    return payload;
  }

  async doCheckout(){
    this.isLoad = true;
    try {
      const payload = this.setPayloadCheckout();
      const response:GraphResponse = await this.storeService.createOperation(payload);
      console.log("🚀 ~ doCheckout ~ response:", response.data.createOperation);
      if(response.errors) throw(response.errors);
      const  { createOperation } = response.data;

      this.operationData = createOperation;

      await this.registerPayment();
    } catch (error) {
      this.isLoad = false;
      console.log("🚀 ~ doCheckout ~ error:", error);
      this.globalService.showInfo({
        msg: 'messages.global_err'
      })
    }
  }

  modalConfirmCancelOperation(){
    const ref = this.matDialog.open( ModalConfirmComponent, {
      data: {
        title: 'pages.checkout.title_cancel_checkout',
        msg: 'pages.checkout.msg_cancel_checkout',
        txtOk: 'pages.checkout.btn_ok_cancel',
        txtCancel: 'pages.checkout.btn_cancel'
      }
    });

    ref.afterClosed().subscribe( resp => {
      if(resp) this.cancelOperation();
    });
  }

  async cancelOperation(){
    this.isLoad = true;
    try {
      const response: GraphResponse = await this.storeService.cancelOperation( this.operationData.id );
      console.log("🚀 ~ cancelOperation ~ response:", response.data.cancelOperation)
      if(response.errors) throw(response.errors);
      this.isCancelRental = true;
      this.isLoad = false;
    } catch (error) {
      this.isLoad = false;
      console.log("🚀 ~ cancelOperation ~ error:", error)
      this.globalService.showInfo({
        msg: 'pages.checkout.err_cancel_checkout'
      })
    }
  }

  onSelectShipping(event:any){
    console.log("🚀 ~ onSelectShipping ~ event:", event.target.value);
    const { value } = event.target;
    this.shippingInfo.method = event.target.value;

    if(value == 'in_person') {
      this.shippingInfo.cost = 0;
      this.shippingInfo.label = this.lang._('pages.checkout.in_person');
    }

    if(value == 'my_address') {
      const { personal_info } = this.userService.currentUser!;
      const { address } = personal_info!;
      this.shippingInfo.cost = 3.99;
      this.shippingInfo.address = address;
      this.shippingInfo.label = this.lang._('pages.checkout.my_address');
    }

    if(value == 'delivery_address') {
      this.shippingInfo.cost = 2.99;
      this.shippingInfo.label = this.lang._('pages.checkout.collect_point');
    }

    this.globalService.saveData(this.globalService.STORAGE_SHIPPING, this.shippingInfo);
  }

  changeShipping(){
    this.isSelectShipping = !this.isSelectShipping;
  }

  async selectShipping(){

    if( this.shippingInfo.method == 'my_address' && !this.shippingInfo.address){
      this.globalService.showInfo({
        msg: 'pages.checkout.first_must_enter_address'
      })
      return;
    }

    if( this.shippingInfo.method == 'delivery_address' && !this.shippingInfo.address){
      this.globalService.showInfo({
        msg: 'pages.checkout.must_select_collect_point'
      })
      return;
    }

    const isAvailable = await this.isProductAvailable();
    if(!isAvailable ) return;

    this.isSelectShipping = !this.isSelectShipping;
    setTimeout(() => this.setPaymentForm(), 500);
  }

  setAddress(event:any){
    this.addressShipping = event.target.value;
    this.shippingInfo.address = this.addressShipping;
    this.globalService.saveData(this.globalService.STORAGE_SHIPPING, this.shippingInfo);
  }

  getChekoutInStorage(){
    const strShipping = this.globalService.getData(this.globalService.STORAGE_SHIPPING);
    console.log("🚀 ~ getChekoutInStorage ~ strShipping:", strShipping);
    this.shippingInfo = strShipping;
    this.addressShipping = this.shippingInfo.address ?? '';
    const strChekout = this.globalService.getData(this.globalService.STORAGE_CHECKOUT_DATA);
    console.log("🚀 ~ getChekoutInStorage ~ strChekout:", strChekout);
    this.checkoutData = strChekout;
    this.getOfficeNear();
  }

  setInStorageCheckout(){
    this.globalService.saveData(this.globalService.STORAGE_SHIPPING, this.shippingInfo);
    this.globalService.saveData(this.globalService.STORAGE_CHECKOUT_DATA, this.checkoutData);
  }

  openCart(){
    this.router.navigate([this.lang._locale == 'es' ? '/producto' : '/products', this.checkoutData.product.id]);
  }

  async authorizePayment(){
    try {
      const { rentalData } = this.checkoutData;
      const total = rentalData.cost *  rentalData.duration + this.shippingInfo.cost;

      const response: GraphResponse =  await this.paymentService.authorizePayment({
        id_operation:this.DS_MERCHANT_IDOPER,
        amount: total * 100,
        order_id: this.DS_MERCHANT_ORDER,
        operation_id: this.operationData.id
      });

      if(response.errors) throw(response.errors);

      const objResponse = JSON.parse( response.data.authorizationPayment );
      console.log("🚀 ~ authorizePayment ~ objResponse:", objResponse);

      if(objResponse.errorCode){
        const err = this.msgErrAuthorizePayment( objResponse.errorCode );
        throw(err);
      }

      this.globalService.removeData(this.globalService.STORAGE_CHECKOUT_DATA);
      this.isShowSuccess = true;
      this.isLoad = false;

    } catch (error:any) {

      this.deleteOperation();

      this.isLoad = false;

      if( typeof error == 'string'){
        return this.globalService.showInfo({
          msg: error.toString()
        });
      }

      console.log("🚀 ~ autorizePayment ~ error:", error)
    }
  }

  msgErrAuthorizePayment( codeErr: string ){

    const msgErr = ( msg:string ) =>  this.lang._('pages.checkout.' + msg);

    const errCodes:{[key:string]:string} = {
      "SIS0502": msgErr('err_id_oper'),
      "SIS0019" : msgErr('err_amount'),
      "SIS0218" : msgErr('err_commerce_operation'),
      "SIS0028" : msgErr('err_commerce_disabled'),
      "SIS0031" : msgErr('err_method_wrong'),
      "SIS0040":  msgErr('err_config_commerce'),
      "SIS0051":  msgErr('err_order_repeated'),
      "SIS0071":  msgErr('err_card_expired'),
      "SIS0256":  msgErr('err_commerce_unauthorized'),
      "SIS0257":  msgErr('err_card_unauthorized'),
      "SIS0295":  msgErr('err_duplicate_operation'),
      "SIS0033":  msgErr('err_invalid_operation'),
      "SIS0055":  msgErr('err_order_multiple_payments'),
      "SIS0066":  msgErr('err_month_card'),
      "SIS0067":  msgErr('err_month_card'),
      "SIS0068":  msgErr('err_month_card'),
      "SIS0069":  msgErr('err_year_card'),
      "SIS0070":  msgErr('err_year_card'),
      "SIS0064":  msgErr('err_card_number'),
    };

    return errCodes[codeErr] ?? msgErr('err_authorize_payment');
  }

  async registerPayment(){
    try {
      const response:GraphResponse = await this.paymentService.setPaymentOperation({
        operation_id: this.operationData.id,
        payment_method_id: '1',
        transaction_id: this.DS_MERCHANT_IDOPER,
        amount: this.operationData.amount,
        order_id: this.DS_MERCHANT_ORDER
      });

      if(response.errors) throw(response.errors);

      this.authorizePayment();

    } catch (error) {
      console.log("🚀 ~ registerPayment ~ error:", error)
      this.isLoad = false;
      console.log("🚀 ~ doCheckout ~ error:", error);
      this.globalService.showInfo({
        msg: 'messages.global_err'
      })
    }
  }

  async deleteOperation(){
    try {
      this.isLoad = true;
      const response:GraphResponse = await this.storeService.deleteOperation( this.operationData.id );
      if(response.errors) throw(response.errors);
    } catch (error) {
      console.log("🚀 ~ deleteOperation ~ error:", error)
    } finally {
      this.isLoad = false;
    }
  }


  async isProductAvailable(){

    if(!this.userService.currentUser) return this.globalService.showInfo({ msg: 'pages.detail_prod.must_be_auth' });

    const { startDate, endDate } =  this.checkoutData.rentalData;
    console.log("🚀 ~ checkProductAvailable ~ rentalData:", this.checkoutData.rentalData.startDate)
    if(!startDate || !endDate) return false;

    try {

      this.isLoad = true;

      const response:GraphResponse = await this.storeService.checkProductAvailability({
        init_date: dayjs(startDate).add(1 , 'day').format('YYYY-MM-DD'),
        end_date: dayjs(endDate).format('YYYY-MM-DD'),
        product_id: this.checkoutData.product.id
      });

      if(response.errors) throw(response.errors);

      const {  availabilityProduct } = response.data;

      console.log("🚀 ~ checkProductAvailable ~ availabilityProduct:", availabilityProduct)

      if(!availabilityProduct){

        this.globalService.showInfo({
          msg: 'pages.detail_prod.no_product_available'
        });

        return false;
      }

      return true;

    } catch (error) {

      console.log("🚀 ~ checkAvailableProduct ~ error:", error);

      this.globalService.showInfo({
        msg: 'pages.detail_prod.err_check_product_available'
      });

      return false;

    } finally {
      this.isLoad = false;
    }

  }
}
