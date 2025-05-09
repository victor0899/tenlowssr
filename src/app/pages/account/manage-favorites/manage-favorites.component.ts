import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductInfo } from 'src/app/interfaces/store';
import { User, UserFav } from 'src/app/interfaces/user';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

enum VIEWS_FAVORITES {
  PRODUCTS,
  PROFILES
}

@Component({
  selector: 'app-manage-favorites',
  templateUrl: './manage-favorites.component.html',
  styleUrls: ['./manage-favorites.component.scss']
})
export class ManageFavoritesComponent {

  views = VIEWS_FAVORITES;
  nameComponent: VIEWS_FAVORITES = VIEWS_FAVORITES.PRODUCTS;

  products: ProductInfo[] = [];
  profiles: UserFav[] = [];
  userCurrent?: User;

  constructor(
    private router: Router,
    private userService: UserService,
    public publicService: PublicService,
    private lang: LangService,
  ) {
    this.userCurrent = this.userService.getCurrentUser();

    if(this.userCurrent){
      this.userCurrent?.favoriteProducts.forEach( item => item.favorite_by_auth_user = true );
      this.products = this.userCurrent.favoriteProducts;
      console.log("🚀 ~ this.products:", this.products)
      this.profiles = this.userCurrent.favoriteUsers;
      console.log("🚀 ~ this.profiles:", this.profiles)
    }

  }

  back(){
    this.router.navigate([this?.lang?._locale == 'es' ? 'cuenta/opciones' : 'account/options']);
  }

  setViewRender(view: VIEWS_FAVORITES){
    this.nameComponent = view;
  }
  removeProductFavorite(product: ProductInfo){
    this.products = this.products.filter( item => item.id !== product.id);
  }

  removeProfileFavorite(profile: UserFav){
    this.profiles = this.profiles.filter( item => item.id !== profile.id);
  }

}
