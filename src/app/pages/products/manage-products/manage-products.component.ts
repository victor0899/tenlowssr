import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modals/modal-confirm/modal-confirm.component';
import { GraphResponse } from 'src/app/interfaces/graph';
import { PaginatorInfo } from 'src/app/interfaces/public';
import { ProductInfo } from 'src/app/interfaces/store';
import { LangService } from 'src/app/services/lang.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-manage-products',
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.scss']
})
export class ManageProductsComponent implements OnInit{

  isShowActive: boolean = true;
  listProducts: Array<ProductInfo> = [];
  productsDeleted: Array<ProductInfo> = [];
  paginatorProd!: PaginatorInfo;
  isLoadProds: boolean = true;
  isShowLoader: boolean = false;

  dev = [1,2,3,4,5,6];

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private productService: ProductService,
    private lang: LangService,
  ){}

  async ngOnInit() {

    if(this.productService.userDeletedProducts.length > 0 ){
      this.productsDeleted = this.productService.userDeletedProducts;
    } else {
      await this.getDeletedProducts();
    }

    if(this.productService.userProducts.length > 0 ){
      this.listProducts = this.productService.userProducts;
      this.isLoadProds = false;
      return;
    }

    this.getUserProducts();
  }

  async getUserProducts(){
    try {
      const response: GraphResponse = await this.productService.getUserProducts(1);
      console.log("🚀 ~ getUserProducts ~ response:", response.data.productsByUser);
      if (response.errors)  throw(response.errors);
      const  { data: products } = response.data.productsByUser;
      this.listProducts = [...products];
      this.productService.userProducts = [...products];
      this.isLoadProds = false;
    } catch (error) {
        this.isLoadProds = false;
        console.log("🚀 ~ getUserProducts ~ error:", error)
    }
  }

  async getDeletedProducts(){
    try {
      const response: GraphResponse = await this.productService.getUserDeletedProducts(1);
      console.log("🚀 ~ getUserProducts ~ response:", response.data.getDeleteProducts);
      if (response.errors)  throw(response.errors);
      const  { data: products } = response.data.getDeleteProducts;
      this.productsDeleted = [...products];
      this.productService.userDeletedProducts  = this.productsDeleted;
    } catch (error) {
        console.log("🚀 ~ getUserProducts ~ error:", error)
    }
  }

  back(){
    this.router.navigate([this.lang._locale == 'es' ? 'cuenta/opciones' : 'account/options']);
  }

  editProduct( product: ProductInfo ){
    this.productService.productEditable = product;
    this.router.navigateByUrl(`producto/${product?.title.replace(/\s+/g, '-').replace(/[,"\(\)]/g, '')}/${product.id}/editar`);
  }

  confirmDeleteProduct(product: ProductInfo){
    console.log("🚀 ~ deleteProduct ~ product:", product);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data:{
        title : 'pages.manage_products.delete_prod',
        msg : 'pages.manage_products.sure_delete_prod'
      }
    });

    dialogRef.afterClosed().subscribe( ( isConfirm: boolean ) => {
      if(!isConfirm) return;
      this.deleteProduct(product);
    });
  }

  confirmDisabledProduct( product: ProductInfo  ){
    console.log("🚀 ~ deleteProduct ~ product:", product);
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      data:{
        title : 'pages.manage_products.disabled_prod',
        msg : 'pages.manage_products.sure_disabled_prod'
      }
    });

    dialogRef.afterClosed().subscribe( ( isConfirm: boolean ) => {
      if(!isConfirm) return;
      this.disabledProduct(product);
    });
    // this.router.navigateByUrl(`product/${product.id}/edit`);
  }

  async deleteProduct( product: ProductInfo ){
    this.isShowLoader = true;
    try {
      const response: GraphResponse = await this.productService.deleteProduct( product.id );
      console.log("🚀 ~ deleteProduct ~ response:", response)
      this.productService.eventDeleteProduct.next(product);
      this.productsDeleted = this.productsDeleted.filter( item => item.id !== product.id );
      // this.productsDeleted.push(product);
      this.updateDataInService();
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ deteleProduct ~ error:", error)
    }
  }

  async disabledProduct( product: ProductInfo ){
    this.isShowLoader = true;
    try {
      const response: GraphResponse = await this.productService.toggleActivateproduct( product.id, false );
      console.log("🚀 ~ deleteProduct ~ response:", response)
      this.productService.eventDeleteProduct.next(product);
      this.listProducts = this.listProducts.filter( item => item.id !== product.id );
      this.productsDeleted.push(product);
      this.updateDataInService();
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ deteleProduct ~ error:", error)
    }
  }

  async restoreProduct( product: ProductInfo ){
    this.isShowLoader = true;
    try {
      const response: GraphResponse = await this.productService.toggleActivateproduct( product.id, true );
      console.log("🚀 ~ deleteProduct ~ response:", response)
      this.productService.eventDeleteProduct.next(product);
      this.listProducts.push(product);
      this.productsDeleted = this.productsDeleted.filter( item => item.id !== product.id );
      this.updateDataInService();
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ deteleProduct ~ error:", error)
    }
  }
  getProductUrl(item: ProductInfo): string {
    return '/' + (this.lang._locale == 'es' ? 'producto' : 'products') + '/' + 
           item.title.replace(/\s+/g, '-') + '/' + item.id;
  }

  updateDataInService(){
    this.productService.userProducts = this.listProducts;
    this.productService.userDeletedProducts  = this.productsDeleted;
  }
}
