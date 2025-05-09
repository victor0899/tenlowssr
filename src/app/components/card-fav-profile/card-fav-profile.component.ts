import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GraphResponse } from 'src/app/interfaces/graph';
import { UserFav } from 'src/app/interfaces/user';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'card-fav-profile',
  templateUrl: './card-fav-profile.component.html',
  styleUrls: ['./card-fav-profile.component.scss']
})
export class CardFavProfileComponent {

  @Input() profileFav!: UserFav;
  /**
   * Emit profile to remove from favorites.
   */
  @Output() onRemoveFavorite: EventEmitter<UserFav> = new EventEmitter();

  isPressFav: boolean = false;

  constructor(
    public publicService: PublicService,
    private userService: UserService
  ){}

  async setFavoriteProfile( profile: UserFav ){
    this.isPressFav = true;
    try {
      const response: GraphResponse = await this.userService.setFavoriteProfile(profile.id);
      console.log("🚀 ~ setFavoriteProfile ~ response:", response.data);
      if(response.errors) throw(response.errors);
      let user = this.userService.currentUser;
      if(user){
        user?.favoriteUsers.unshift(profile);
        this.userService.setCurrentUser(user)
      }
      this.isPressFav = false;
    } catch (error) {
      this.isPressFav = false;
      console.log("🚀 ~ setFavoriteProfile ~ error:", error)
    }
  }

  async removeFavoriteProfile( profile: UserFav ){
    this.isPressFav = true;
    try {
      const response: GraphResponse = await this.userService.removeFavoriteProfile(profile.id);
      console.log("🚀 ~ setFavoriteProfile ~ response:", response.data);
      if(response.errors) throw(response.errors);
      let user = this.userService.currentUser;
      if(user){
        user.favoriteUsers = user.favoriteUsers.filter( fav => fav.id !== profile.id );
        this.userService.setCurrentUser(user)
      }
      this.onRemoveFavorite.emit(profile);
      this.isPressFav = false;
    } catch (error) {
      this.isPressFav = false;
      console.log("🚀 ~ setFavoriteProfile ~ error:", error)
    }
  }

  getNameUser( user: UserFav ){
    const { name, last_name } = user;
    return `${name} ${last_name}`;
  }
}
