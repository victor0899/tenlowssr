import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';
import { RATING_OWNER_PRODUCT, RATING_PRODUCT, SEND_TENLOW_EXPERIENCE } from '../GraphQL/rating';
import { RatingOwnerParams, RatingProductParams } from '../interfaces/public';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  isRatingTenlow:boolean = true;

  constructor(
    private apollo: Apollo,
    private globalService: GlobalService
  ) { }

  setIsRatingInStorage(){
    localStorage.setItem(this.globalService.STORAGE_RATING_TENLOW, 'true');
  }

  getIsRatingInStorage(){
    const resp = localStorage.getItem(this.globalService.STORAGE_RATING_TENLOW);
    if(resp !== null) this.isRatingTenlow = true;
    return this.isRatingTenlow;
  }

  async ratingProduct(payload: RatingProductParams){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: RATING_PRODUCT,
        variables: payload
      })
    );
    return response;
  }

  async ratingOwnerProduct(payload: RatingOwnerParams){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: RATING_OWNER_PRODUCT,
        variables: payload
      })
    );
    return response;
  }

  async ratingTenlow(comment: string){

    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SEND_TENLOW_EXPERIENCE,
        variables: { comment }
      })
    );

    return response;
  }
}
