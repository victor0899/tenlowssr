import { Component, Input } from '@angular/core';
import { GraphResponse } from 'src/app/interfaces/graph';
import { TypeShared } from 'src/app/interfaces/public';
import { ProductInfo } from 'src/app/interfaces/store';
import { UserAuth } from 'src/app/interfaces/user';
import { GlobalService } from 'src/app/services/global.service';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'name-product-actions',
  templateUrl: './name-product-actions.component.html',
  styleUrls: ['./name-product-actions.component.scss']
})
export class NameProductActionsComponent {

  @Input() isLoadProduct!: boolean;
  @Input() product!: ProductInfo;

  isPressFavButton: boolean = false;
  userCurrent?: UserAuth;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private globalService: GlobalService
  ){
    this.userCurrent = this.userService.currentUser;
  }

  toogleFavorite(){
    this.isPressFavButton = true;
    if(this.product.favorite_by_auth_user){
      this.removeFavorite();
    } else {
      this.setFavoriteProduct();
    }
  }

  async setFavoriteProduct(){
    try {
      const response: GraphResponse = await this.productService.setFavoriteProduct(this.product.id);
      if(response.errors) throw(response.errors);
      let user = this.userService.currentUser;
      if(user){
        user?.favoriteProducts.unshift(this.product);
        this.userService.setCurrentUser(user)
      }
      this.isPressFavButton = false;
      this.product.favorite_by_auth_user = true;
      console.log("🚀 ~ setFavoriteProduct ~ response:", response);
    } catch (error) {
      this.isPressFavButton = false;
      console.log("🚀 ~ setFavoriteProduct ~ error:", error)
    }
  }

  async removeFavorite(){
    try {
      const response: GraphResponse = await this.productService.removeFavoriteProduct(this.product.id);
      if(response.errors) throw(response.errors);
      let user = this.userService.currentUser;
      if(user){
        const listUpdate = user.favoriteProducts.filter( (product) => product.id !== this.product.id);
        user.favoriteProducts = listUpdate;
        this.userService.setCurrentUser(user);
      }
      this.product.favorite_by_auth_user = false;
      this.isPressFavButton = false;
      console.log("🚀 ~ setFavoriteProduct ~ response:", response);
    } catch (error) {
      this.isPressFavButton = false;
      console.log("🚀 ~ setFavoriteProduct ~ error:", error)
    }
  }

  shared(){
    this.globalService.shareContent(TypeShared.product);
  }
}
