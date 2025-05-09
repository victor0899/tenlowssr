import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { lastValueFrom, Subject } from 'rxjs';
import { CREATE_PRODUCT, UPDATE_PRODUCT, UPLOAD_IMAGES_PROD } from '../GraphQL/products';
import { AUTOCOMPLETE_SEARCH, CANCEL_OPERATION, CHECK_PRODUCT_AVAILABILITY, CREATE_OPERATION, DELETE_OPERATION, FILTER_PRODUCTS, GET_CATEGORIES_STORE, GET_OPERATION_ID, GET_PRICES_TO_FILTER, GET_PRODUCTS, GET_PRODUCTS_BY_CATEGORY, GET_PRODUCTS_BY_SUBCATEGORY, GET_SUBCATEGORIES_STORE, PREREGISTER_SHIPPING, REQUEST_CODE_EMAIL, REQUEST_CODE_RENTAL, SEARCH_PRODUCTS, VALIDATE_CODE_RENTAL, GET_PRODUCT_RESERVED_DATES, GET_OPERATIONS_BY_PRODUCT_STATUS } from '../GraphQL/store';
import { AddProductPayload } from '../interfaces/products';
import { PaginatorInfo, Photo } from '../interfaces/public';
import { AvailabilityProductParams, Categorie, CheckoutData, OperationStatus, ParamsFilterProducts, PayloadCheckout, ProductInfo, ProductStatus } from '../interfaces/store';
import { GlobalService } from './global.service';
import { LangService } from './lang.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private _categories: Array<Categorie> = [];
  private _products: Array<ProductInfo> = [];
  eventSearch = new Subject<string>();
  private _checkoutInfo!: CheckoutData;
  private _paginatorProd!: PaginatorInfo;

  constructor(
    private http: HttpClient,
    private apollo: Apollo,
    private langService: LangService,
    private globalService: GlobalService
  ) { }

  public get paginatorProd(): PaginatorInfo {
    return this._paginatorProd;
  }
  public set paginatorProd(value: PaginatorInfo) {
    this._paginatorProd = value;
  }

  public get categories(): Array<Categorie> {
    return this._categories;
  }
  public set categories(value: Array<Categorie>) {
    this._categories = value;
  }

  public get products(): Array<ProductInfo> {
    return this._products;
  }
  public set products(value: Array<ProductInfo>) {
    this._products = value;
  }

  public get checkoutInfo(): CheckoutData {
    return this._checkoutInfo;
  }
  public set checkoutInfo(value: CheckoutData) {
    this._checkoutInfo = value;
  }

  // ****************************************************

  async getListCategories(){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_CATEGORIES_STORE,
        variables:{
          lang: this.langService.getLocale
        }
      })
    );

    return response;
  }

  async getListSubcategories( categoryId: string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_SUBCATEGORIES_STORE,
        variables:{
          lang: this.langService.getLocale,
          categorieID: categoryId
        }
      })
    );

    return response;
  }

  async getProducts(page:number){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query:GET_PRODUCTS,
        variables:{
          page
        }
      })
    );
    return response;
  }

  async getProductsByCategory(idCategory:string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query:GET_PRODUCTS_BY_CATEGORY,
        variables:{
          idCategory
        }
      })
    );
    return response;
  }

  async getProductsBySubategory(idSubcategory:string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_PRODUCTS_BY_SUBCATEGORY,
        variables:{
          idSubcategory
        }
      })
    );
    return response;
  }

  async searchProducts(query:string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: SEARCH_PRODUCTS,
        variables: {
          query
        }
      })
    );

    return response;
  }

  async uploadProduct( payload: AddProductPayload){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: CREATE_PRODUCT,
        variables: payload
      })
    );

    return response;
  }

  async uploadImageProduct( images: Array<Photo> , productID:string ){
    let filesProd:File[] = [];

    images.forEach( async (image, i) => {
      if(!image.dataUrl) return;
      let blobImg = this.globalService.dataURIToBlob( image.dataUrl );
      filesProd.push(new File( [blobImg], `product-img-${Date.now()}.${image.format}`, { type: `image/${image.format}`}))
    });

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: UPLOAD_IMAGES_PROD,
        variables: {
          files: filesProd,
          product_id:productID
        },
        context:{
          useMultipart: true
        }
      })
    );

    return response;
  }

  async createOperation( payload:PayloadCheckout){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: CREATE_OPERATION,
        variables: payload
      })
    );
    return response;
  }

  async cancelOperation( idOperation:string ) {
    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: CANCEL_OPERATION,
        variables: {
          idOperation
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async filterProducts(payload: ParamsFilterProducts){
    const response:any = lastValueFrom(
      this.apollo.query({
        query: FILTER_PRODUCTS,
        variables: payload,
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async getPricesToFilter(){
    const response:any = lastValueFrom(
      this.apollo.query({
        query: GET_PRICES_TO_FILTER
      })
    );
    return response;
  }

  async getAutocompleteSearch(query: string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: AUTOCOMPLETE_SEARCH,
        variables:{
          query
        },
        errorPolicy: 'all'
      })
    )
    return response;
  }

  async updateProduct( payload: AddProductPayload, productId: string, status: ProductStatus){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: UPDATE_PRODUCT,
        variables: {
          ...payload,
          product_id: productId,
          status
        }
      })
    );

    return response;
  }

  async uploadUpdateImageProduct( images: Array<Photo> , productID:string ){
    let filesProd:File[] = [];

    images.forEach( async (image, i) => {
      if(!image.dataUrl) return;
      let blobImg = this.globalService.dataURIToBlob( image.dataUrl );
      filesProd.push(new File( [blobImg], `product-img-${Date.now()}.${image.format}`, { type: `image/${image.format}`}))
    });

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: UPLOAD_IMAGES_PROD,
        variables: {
          files: filesProd,
          product_id:productID
        },
        context:{
          useMultipart: true
        }
      })
    );

    return response;
  }

  async requestCodeEmail(email: string, sender: string, code: string) {
    const response: any = await lastValueFrom(
        this.apollo.mutate({
            mutation: REQUEST_CODE_EMAIL, // Usaremos un nuevo mutation
            variables: {
                email,
                sender,
                code
            }
        })
    );
    return response;
}

  async requestCodeRental( phone:string, sender:string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: REQUEST_CODE_RENTAL,
        variables: {
          phone,
          sender
        }
      })
    );
    return response;
  }

  async validateCodeRental( phone:string, pin:string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: VALIDATE_CODE_RENTAL,
        variables: {
          phone,
          pin
        }
      })
    );
    return response;
  }

  async preRegisterShipping( operation_id: string ){

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: PREREGISTER_SHIPPING,
        variables: { operation_id }
      })
    );

    return response;
  }

  async checkProductAvailability( payload: AvailabilityProductParams ){

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: CHECK_PRODUCT_AVAILABILITY,
        variables: payload
      })
    );

    return response;
  }

  async deleteOperation( operation_id:string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: DELETE_OPERATION,
        variables: { operation_id }
      })
    );
    return response;
  }

  async getOperationID( paymentIntent:string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: GET_OPERATION_ID,
        variables: { paymentIntent }
      })
    );
    return response;
  }

  async getProductReservedDates(product_id: string) {
    const response: any = await lastValueFrom(
      this.apollo.query({
        query: GET_PRODUCT_RESERVED_DATES,
        variables: {
          product_id
        },
        fetchPolicy: 'no-cache',  
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async getAllCategories(): Promise<any> {
    if (this._categories && this._categories.length > 0) {
      return { data: { categories: this._categories } };
    }
    
    const response: any = await lastValueFrom(
      this.apollo.query({
        query: GET_CATEGORIES_STORE,
        variables: {
          lang: this.langService.getLocale
        },
        errorPolicy: 'all'
      })
    );
    
    if (response.data && response.data.categories) {
      this._categories = response.data.categories;
    }
    
    return response;
  }
  
async getOperationsByProductAndStatus(productId: string, status: OperationStatus) {
  const response: any = await lastValueFrom(
    this.apollo.query({
      query: GET_OPERATIONS_BY_PRODUCT_STATUS,
      variables: {
        productId,
        status
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    })
  );
  return response;
}
}

