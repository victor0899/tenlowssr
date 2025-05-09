import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ParamModalSelectProduct } from 'src/app/interfaces/board';
import { GraphResponse } from 'src/app/interfaces/graph';
import { ProductInfo } from 'src/app/interfaces/store';
import { User } from 'src/app/interfaces/user';
import { BoardService } from 'src/app/services/board.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { ProductService } from 'src/app/services/product.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-select-product-tablon',
  templateUrl: './select-product-tablon.component.html',
  styleUrls: ['./select-product-tablon.component.scss']
})
export class SelectProductTablonComponent implements OnInit {
  listProducts: ProductInfo[] = [];
  isLoad: boolean = true;
  productSelected!: ProductInfo;
  currentUser?: User;
  isSendResponse: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private productService: ProductService,
    private boardService: BoardService,
    private globalService: GlobalService,
    private lang: LangService,
    public publicService: PublicService,
    private dialogRef: MatDialogRef<SelectProductTablonComponent>,
    @Inject(MAT_DIALOG_DATA) public params: ParamModalSelectProduct
  ){

    this.currentUser = this.userService.currentUser;

    if(this.productService.userProducts.length > 0 ){
      const strProducts: ProductInfo[] = JSON.parse(JSON.stringify(this.productService.userProducts));
      this.listProducts = strProducts.filter( item => item.status == "validated" );
      // this.listProducts =  this.listProducts.concat(this.listProducts);
      this.isLoad = false;
      return;
    }

    this.getUserProducts();
  }

  ngOnInit(): void {
    console.log('params SelectProductTablonComponent',this.params);
  }

  close(){
    this.dialogRef.close(this.productSelected);
  }

  navUploadProd(){
    this.close();
    this.router.navigateByUrl(this.lang._locale === 'es' ? 'producto/nuevo-producto' : 'products/add-product');
  }

  selectProduct( product: ProductInfo){
    console.log("🚀 ~ selectProduct ~ product:", product)

  }

  async getUserProducts(){
    try {
      const response: GraphResponse = await this.productService.getUserProducts(1);
      console.log("🚀 ~ getUserProducts ~ response:", response.data.productsByUser);
      if (response.errors)  throw(response.errors);
      const  { data: products } = response.data.productsByUser;
      this.listProducts = [...products].filter( item => item.status == "validated" );
      this.productService.userProducts = [...products];
      this.isLoad = false;
    } catch (error) {
      this.isLoad = false;
      console.log("🚀 ~ getUserProducts ~ error:", error)
    }
  }

  async sendSelectProduct(){
    this.isSendResponse = true;
    try {
      const response: GraphResponse = await this.boardService.responseBoardProduct( this.params.request_id , this.productSelected.id);
      console.log("🚀 ~ sendSelectProduct ~ response:", response);
      if(response.errors) throw(response.errors);
      this.isSendResponse = false;
      this.close();
      this.globalService.showInfo({
        msg: 'pages.table_request.request_send_succcess'
      });
    } catch (error) {
      this.isSendResponse = false;
      this.globalService.showInfo({
        msg: 'messages.global_err'
      });
      console.log("🚀 ~ sendSelectProduct ~ error:", error)
    }
  }
}
