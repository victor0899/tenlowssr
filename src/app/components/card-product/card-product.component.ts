import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GraphResponse } from 'src/app/interfaces/graph';
import { ProductAvailability, ProductInfo } from 'src/app/interfaces/store';
import { User } from 'src/app/interfaces/user';
import { ProductService } from 'src/app/services/product.service';
import { PublicService } from 'src/app/services/public.service';
import { UrlFormatterService } from 'src/app/services/url-formatter.service';
import { UserService } from 'src/app/services/user.service';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: 'card-product',
  templateUrl: './card-product.component.html',
  styleUrls: ['./card-product.component.scss']
})
export class CardProductComponent {
  @Input() showFavorites: boolean = false;
  @Input() showDelete: boolean = false;
  @Input() showManage: boolean = false;
  @Input() activeProduct: boolean = false;
  @Input() enabledActions: boolean = true;
  @Input() disabledClick: boolean = false;
  @Input() product!: ProductInfo;

  @Output() onEdit: EventEmitter<boolean> = new EventEmitter();
  @Output() onDelete: EventEmitter<boolean> = new EventEmitter();
  @Output() onDisabled: EventEmitter<boolean> = new EventEmitter();
  @Output() onRestore: EventEmitter<boolean> = new EventEmitter();
  @Output() onRemoveFavorite: EventEmitter<ProductInfo> = new EventEmitter();

  currentUser?: User;
  isLoad: boolean = false;
  availability = ProductAvailability;

  constructor(
    private router: Router,
    private productService: ProductService,
    public publicService: PublicService,
    private userService: UserService,
    private urlFormatter: UrlFormatterService,
    private lang: LangService
  ) {
    this.currentUser = this.userService.currentUser;
  }

  getProductLink(product: ProductInfo): string {
    return this.urlFormatter.formatProductUrl(product.title, product.id);
  }

  viewProduct(idProd: string, title: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    if (this.disabledClick) return;
    if (!this.product.categories.length) return;

    this.productService.productSelected = this.product;
    const url = this.getProductLink(this.product);
    this.router.navigateByUrl(url);
  }

  toogleFavorite(event: Event) {
    event.preventDefault();
    this.isLoad = true;
    if (this.product.favorite_by_auth_user) {
      this.removeFavorite();
    } else {
      this.addFavorite();
    }
  }

  getPrice() {
    const { daily_price, weekly_price, monthly_price } = this.product;
    if (daily_price) return daily_price;
    if (weekly_price) return weekly_price;
    if (monthly_price) return monthly_price;
  }

  getLabel(): string {
    const { daily_price, weekly_price, monthly_price } = this.product;
    if (daily_price) return 'labels.day';
    if (weekly_price) return 'labels.week';
    if (monthly_price) return 'labels.month';
    return '';
  }

  editProduct() {
    this.onEdit.emit(true);
  }

  disabledProduct() {
    this.onDisabled.emit(true);
  }

  deleteProduct() {
    this.onDelete.emit(true);
  }

  restoreProduct() {
    this.onRestore.emit(true);
  }

  async addFavorite() {
    try {
      const response: GraphResponse = await this.productService.setFavoriteProduct(this.product.id);
      if (response.errors) throw response.errors;
      
      let user = this.userService.currentUser;
      if (user) {
        user.favoriteProducts.unshift(this.product);
        this.userService.setCurrentUser(user);
      }
      
      this.product.favorite_by_auth_user = true;
      this.isLoad = false;
    } catch (error) {
      this.isLoad = false;
      console.error("Error adding favorite:", error);
    }
  }

  async removeFavorite() {
    try {
      const response: GraphResponse = await this.productService.removeFavoriteProduct(this.product.id);
      if (response.errors) throw response.errors;
      
      let user = this.userService.currentUser;
      if (user) {
        const listUpdate = user.favoriteProducts.filter((product) => product.id !== this.product.id);
        user.favoriteProducts = listUpdate;
        this.userService.setCurrentUser(user);
      }
      
      this.product.favorite_by_auth_user = false;
      this.isLoad = false;
      this.onRemoveFavorite.emit(this.product);
    } catch (error) {
      this.isLoad = false;
      console.error("Error removing favorite:", error);
    }
  }
}