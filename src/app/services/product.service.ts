import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subject, lastValueFrom } from 'rxjs';
import { DELETE_IMAGE_PRODUCT, DELETE_PRODUCT, GET_DETAIL_PRODUCT, GET_USER_DELETED_PRODUCTS, GET_USER_PRODUCTS, REMOVE_FAVORITE_PRODUCT, RESTORE_PRODUCT, SET_FAVORITE_PRODUCT, TOGGLE_ACTIVATE_PRODUCT } from '../GraphQL/products';
import { ProductInfo } from '../interfaces/store';
import { UserService } from './user.service';
import { GET_PRODUCTS_BY_CATEGORY } from '../GraphQL/store';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private _productSelected!: ProductInfo;
  private _userProducts: ProductInfo[] = [];
  private _userDeletedProducts: ProductInfo[] = [];
  private _productEditable!: ProductInfo;

  eventUpdateProduct = new Subject<ProductInfo>();
  eventDeleteProduct = new Subject<ProductInfo>();
  eventAddOtherProduct = new Subject<Boolean>();

  constructor(
    private apollo: Apollo,
    private userService: UserService
  ) {
    this.eventUpdateProduct.subscribe( ( productUpdated ) => {

      const temp = this._userProducts.map( item => {
        if( item.id === productUpdated.id ) {
          item = productUpdated;
        }
        return item;
      });

      this.userProducts = temp;
    });

    this.eventDeleteProduct.subscribe( ( productDelete ) => {
      const temp = this._userProducts.filter( item => item.id !== productDelete.id);
      this.userProducts = temp;
    })
  }

  clearProducts(){
    this.userDeletedProducts = [];
    this.userProducts = [];
  }

  public get userDeletedProducts(): ProductInfo[] {
    return this._userDeletedProducts;
  }
  public set userDeletedProducts(value: ProductInfo[]) {
    this._userDeletedProducts = value;
  }

  public get productEditable(): ProductInfo {
    return this._productEditable;
  }
  public set productEditable(value: ProductInfo) {
    this._productEditable = value;
  }

  public get userProducts(): ProductInfo[] {
    return this._userProducts;
  }
  public set userProducts(value: ProductInfo[]) {
    this._userProducts = value;
  }

  public get productSelected(): ProductInfo {
    return this._productSelected;
  }

  public set productSelected(value: ProductInfo) {
    this._productSelected = value;
  }

  async getDetailProd( idProduct: number){

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_DETAIL_PRODUCT,
        variables: {
          idProduct
        }
      })
    );

    return response;
  }

  async getUserProducts(page:number){
    const user = this.userService.currentUser;
    const respose:any = await lastValueFrom(
      this.apollo.query({
        query: GET_USER_PRODUCTS,
        variables: {
          page,
          user_id: user?.id
        },
        errorPolicy: 'all'
      })
    );

    return respose;
  }

  async getProductsByUser(page:number, userId: string){
    const respose:any = await lastValueFrom(
      this.apollo.query({
        query: GET_USER_PRODUCTS,
        variables: {
          page,
          user_id: userId
        },
        errorPolicy: 'all'
      })
    );

    return respose;
  }

  async getUserDeletedProducts(page:number){
    const user = this.userService.currentUser;
    const respose:any = await lastValueFrom(
      this.apollo.query({
        query: GET_USER_DELETED_PRODUCTS,
        variables: {
          page
        },
        errorPolicy: 'all'
      })
    );

    return respose;
  }

  async deleteImageProduct( image_id: string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: DELETE_IMAGE_PRODUCT,
        variables: {
          image_id
        }
      })
    );

    return response;
  }

  async deleteProduct(productId: string){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: DELETE_PRODUCT,
        variables: {
          product_id: productId
        }
      })
    );
    return response;
  }

  async toggleActivateproduct(productId: string, isActive: boolean){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: TOGGLE_ACTIVATE_PRODUCT,
        variables: {
          product_id: productId,
          activate: isActive
        }
      })
    );
    return response;
  }

  async restoreProduct(productId: string){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: RESTORE_PRODUCT,
        variables: {
          product_id: productId
        }
      })
    );
    return response;
  }

  async setFavoriteProduct( idProduct: string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SET_FAVORITE_PRODUCT,
        variables:{
          id: idProduct
        }
      })
    );

    return response;
  }

  async removeFavoriteProduct( idProduct: string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: REMOVE_FAVORITE_PRODUCT,
        variables:{
          id: idProduct
        }
      })
    );

    return response;
  }

  async getSuggestedProducts(category_id:string){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_PRODUCTS_BY_CATEGORY,
        variables:{
          idCategory: category_id
        },
        errorPolicy: 'all'
      })
    )
    return response;
  }
}
