import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterCategoryComponent } from 'src/app/components/modals/filter-category/filter-category.component';
import { GraphResponse } from 'src/app/interfaces/graph';
import { NavbarItems, Photo, TypeShared } from 'src/app/interfaces/public';
import { Categorie, ProductAvailability, ProductInfo } from 'src/app/interfaces/store';
import { User, UserFav, ViewProducts } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { ProductService } from 'src/app/services/product.service';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dashboard-user',
  templateUrl: './dashboard-user.component.html',
  styleUrls: ['./dashboard-user.component.scss']
})
export class DashboardUserComponent implements OnInit{

  filterBtns: Array<NavbarItems> = [
    {
      label: "pages.profile.all",
      route: 'all'
    },
    {
      label: "pages.profile.in_rental",
      route: 'in_rental'
    },
    {
      label: "pages.profile.available",
      route: 'available'
    },
    {
      label: "pages.profile.ratings",
      route: 'ratings'
    },
    {
      label: "pages.profile.my_favorites",
      route: 'my_favorites'
    }
  ];

  selectedIndex:number = 0;
  currentView: string = 'all';
  userCurrent?: User;
  dev:ProductInfo[] = [];
  listProducts:ProductInfo[] = [];
  bkListProducts:ProductInfo[] = [];
  isLoadProds: boolean = true;
  isPublicProfile: boolean = false;
  idUserParam?: string;
  showLoader: boolean = true;
  isPressFavButton: boolean = false;

  listAvailableProducts:ProductInfo[] = [];
  listInRentalProducts:ProductInfo[] = [];

  isFilterCategory: boolean = false;
  categoryFilter!: Categorie;
  categories: Categorie[];

  constructor(
    private matDialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private productService: ProductService,
    public publicService: PublicService,
    private globalService: GlobalService,
    private authService: AuthService,
    private storeService: StoreService,
    private lang: LangService,
  ){
    this.categories = this.storeService.categories;

    this.idUserParam = this.route.snapshot.params['id'];
    const userCurrent = this.userService.currentUser;

    if(this.idUserParam && userCurrent?.id !== this.idUserParam) {
      this.isPublicProfile = true;
      this.filterBtns = this.filterBtns.filter( item => item.label !== 'pages.profile.my_favorites');
    }

    if(!this.isPublicProfile){
      this.userCurrent = this.userService.currentUser;

      if(this.productService.userProducts.length){
        this.listProducts = [...this.productService.userProducts];
        this.bkListProducts = [...this.productService.userProducts];
        this.separatedProductByAvailability();
        this.isLoadProds = false;
        this.showLoader = false;
      } else {
        this.getUserProducts();
        this.showLoader = false;
      }
    }
  }

  async ngOnInit() {

    if(this.isPublicProfile){
      await this.getDetailUser();
      await this.getUserProducts();
      return;
    }

    if(!this.userCurrent){
      this.userCurrent = this.userService.getCurrentUser();
      this.showLoader = false;
    }
  }

  separatedProductByAvailability(){
    this.listAvailableProducts = [...this.listProducts].filter( prod => prod.availability == ProductAvailability.available);
    this.listInRentalProducts = [...this.listProducts].filter( prod => prod.availability == ProductAvailability.rented);
    return;
  }

  onSelectCategorie( event: MatSelectChange, categories:any ) {
    const idCategory = event.value;

    const category = this.categories.filter( item =>  item.id == idCategory )[0];
    this.listProducts = [...this.bkListProducts];

    this.separatedProductByAvailability();
    this.isFilterCategory = true;
    this.categoryFilter = category;

    this.listProducts = this.listProducts.filter( item => item.categories[0].id == idCategory );
    this.listAvailableProducts = this.listAvailableProducts.filter( item => item.categories[0].id == idCategory );
    this.listInRentalProducts = this.listInRentalProducts.filter( item => item.categories[0].id == idCategory );
  }

  resetFilter(){
    this.isFilterCategory = false
    this.listProducts = [...this.bkListProducts];
    this.separatedProductByAvailability();
  }

  async onSelectImage( event:Event) {
    try {

      if(!event.target) return;

      const targetInput = event.target as HTMLInputElement;

      if(!targetInput.files?.length) return;

      let fileImg = targetInput.files;
      const img = await this.globalService.processImage(fileImg);

      console.log("🚀 ~ onSelectImage ~ this.selectedImages:", img);
      this.updateProfileImage(img);
    } catch (error) {
      console.log("🚀 ~ onSelectImage ~ error:", error);
      this.globalService.showInfo({
        msg: 'pages.upload_prod.err_select_img'
      });
    }
  }

  async updateProfileImage(img: Photo){
    this.showLoader = true;
    try {
      const response: GraphResponse = await this.userService.updateImageProfile(img);
      console.log("🚀 ~ updateProfileImage ~ response:", response.data.uploadImageUser);
      if(response.errors) throw(response.errors);
      await this.getDetailUser(this.userCurrent?.id ?? '');
    } catch (error) {
      this.showLoader = false;
      console.log("🚀 ~ updateProfileImage ~ error:", error)
    }
  }

  async getDetailUser( idUser?: string ){
    try {
      const id = (this.idUserParam) ? this.idUserParam : (idUser) ? idUser : '';
      const response: GraphResponse = await this.userService.getUserById( id );
      console.log("🚀 ~ getDetailUser ~ response:", response.data.user);
      this.userCurrent = response.data.user;
      this.showLoader = false;
      if(!this.isPublicProfile) {
        // this.authService.eventAuthUser.next( this.userCurrent );
        // this.userService.setCurrentUser(this.userCurrent);
      }
    } catch (error) {
      console.log("🚀 ~ getDetailUser ~ error:", error)
    }
  }

  async getUserProducts(){
    try {
      const response: GraphResponse = await this.productService.getProductsByUser(1, this.userCurrent?.id ?? '');
      console.log("🚀 ~ getUserProducts ~ response:", response.data.productsByUser);
      if (response.errors)  throw(response.errors);
      const  { data: products } = response.data.productsByUser;
      this.listProducts = [...products];
      this.bkListProducts = [...products];
      if(!this.isPublicProfile) this.productService.userProducts = [...products];
      this.separatedProductByAvailability();
      this.isLoadProds = false;
    } catch (error) {
      this.isLoadProds = false;
      this.showLoader = false;
      console.log("🚀 ~ getUserProducts ~ error:", error)
    }
  }

  onSearchItems(event: Event) {
    const target = event.target as HTMLInputElement;

    if(target.value.trim().length == 0) {
      return this.listProducts = [...this.bkListProducts];
    }

    const temp = this.listProducts.filter( item =>
      item.title.toLowerCase().includes(target.value.trim().toLowerCase()) ||
      item.description.toLowerCase().includes(target.value.trim().toLowerCase())
    );

    this.listProducts = temp;
  }

  goEdit( option: 'description' | 'profession'){
    this.router.navigate([this.lang._locale == 'es' ? 'cuenta/' : 'account/panel-usuario/editar', option ]);
  }

  goTab(index:number){
    this.selectedIndex = index;
  }

  getNameUser(){
    if(this.userCurrent){
      const { name , last_name} = this.userCurrent;
      return `${name} ${last_name}`;
    }

    return '';
  }

  //****************************************************************************

  shareProfile(){
    this.globalService.shareContent(TypeShared.profile);
  }

  toogleFavoriteProfile(){
    if(!this.userCurrent?.favorite_by_auth_user){
      this.setFavoriteProfile();
    } else {
      this.removeFavoriteProfile();
    }
  }

  async setFavoriteProfile(){
    this.isPressFavButton = true;
    try {
      const response: GraphResponse = await this.userService.setFavoriteProfile(this.idUserParam  ?? '');
      console.log("🚀 ~ setFavoriteProfile ~ response:", response.data);
      if(response.errors) throw(response.errors);
      let user = this.userService.currentUser;
      if(user && this.userCurrent){
        const userFav: UserFav = {
          id: this.userCurrent?.id,
          name: this.userCurrent?.name,
          last_name: this.userCurrent?.last_name,
          email: this.userCurrent?.email,
          profile_photo_path: this.userCurrent?.profile_photo_path,
          type_login: this.userCurrent?.type_login,
          email_verified_at: this.userCurrent?.email_verified_at,
          created_at: this.userCurrent?.created_at,
          updated_at: this.userCurrent?.updated_at,
          rating: this.userCurrent?.rating,
          personal_info: {
            id: this.userCurrent.id,
            alias: this.userCurrent.personal_info!.alias,
            gender: this.userCurrent.personal_info!.gender,
            description: this.userCurrent.personal_info!.description,
          },
          __typename: '',
          view_products: this.listProducts.map( (prod, index)  => {
            if(index < 2){
              return {
                id: prod.id,
                title: prod.title,
                images: prod.images
              } as ViewProducts;
            }
          }) as ViewProducts[]
        };
        user?.favoriteUsers.unshift(userFav);
        this.userService.setCurrentUser(user)
      }
      this.userCurrent!.favorite_by_auth_user = true;
      this.isPressFavButton = false;
    } catch (error) {
      this.isPressFavButton = false;
      console.log("🚀 ~ setFavoriteProfile ~ error:", error)
    }
  }

  async removeFavoriteProfile(){
    this.isPressFavButton = true;
    try {
      const response: GraphResponse = await this.userService.removeFavoriteProfile(this.idUserParam  ?? '');
      console.log("🚀 ~ setFavoriteProfile ~ response:", response.data);
      if(response.errors) throw(response.errors);
      let user = this.userService.currentUser;
      if(user && this.userCurrent){
        user.favoriteUsers = user.favoriteUsers.filter( fav => fav.id !== this.userCurrent?.id );
        this.userService.setCurrentUser(user)
      }
      this.userCurrent!.favorite_by_auth_user = false;
      this.isPressFavButton = false;
    } catch (error) {
      this.isPressFavButton = false;
      console.log("🚀 ~ setFavoriteProfile ~ error:", error)
    }
  }

  //****************************************************************************

}
