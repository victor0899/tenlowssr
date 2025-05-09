import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphResponse } from 'src/app/interfaces/graph';
import { ParamModalRating } from 'src/app/interfaces/public';
import { GlobalService } from 'src/app/services/global.service';
import { PublicService } from 'src/app/services/public.service';
import { RatingService } from 'src/app/services/rating.service';

@Component({
  selector: 'app-modal-rating',
  templateUrl: './modal-rating.component.html',
  styleUrls: ['./modal-rating.component.scss']
})
export class ModalRatingComponent {

  isShowRatingTenlow: boolean = false;
  colorDark:string = '#1C1B1F';
  colorYellow:string = '#FFB959';
  isShowLoader: boolean = false;
  commentTenlow:string = '';
  isCommentErrTenlow: boolean = false;
  msgErrCommentTenlow: string = '';
  //////////////////////
  ratingProduct: number = 0;
  commentProduct:string = '';
  isCommentErr: boolean = false;
  msgErrComment: string = '';
  //////////////////////
  ratingOwner: number = 0;
  commentOwner:string = '';
  isCommentErrOwner: boolean = false;
  msgErrCommentOwner: string = '';

  constructor(
    public publicService: PublicService,
    private globalService: GlobalService,
    private ratingService:RatingService,
    private dialogRef: MatDialogRef<ModalRatingComponent>,
    @Inject(MAT_DIALOG_DATA) public param: ParamModalRating
  ) {}

  updateRating( value:number ){
    this.ratingProduct = value;
  }

  updateRatingOwner( value:number ){
    this.ratingOwner = value;
  }

  validateRatingTenlow(){
    if(this.commentTenlow.length == 0) {
      this.msgErrCommentTenlow = 'messages.field_required';
      this.isCommentErrTenlow = true;
      return;
    }

    if(this.commentTenlow.length < 10) {
      this.msgErrCommentTenlow = 'components.rating.write_valid_review';
      this.isCommentErrTenlow = true;
      return;
    }

    this.ratingTenlow();
  }

  async ratingTenlow(){
    try {
      this.isShowLoader = true;
      const response: GraphResponse = await this.ratingService.ratingTenlow( this.commentTenlow );
      if(response.errors) throw(response.errors);
      this.ratingService.isRatingTenlow = true;
      this.ratingService.setIsRatingInStorage();

      this.dialogRef.close(true);

      this.globalService.showInfo({
        msg: 'components.rating.success_rating'
      });

    } catch (error) {
      console.log("🚀 ~ ratingTenlow ~ error:", error)
    } finally {
      this.isShowRatingTenlow = false;
      this.isShowLoader = false;
    }
  }

  validate(){

    const isEmpty = this.commentProduct.trim().length == 0 || this.commentOwner.trim().length == 10;
    const isInvalid = this.commentProduct.length < 10 || this.commentOwner.length < 10;

    if(isEmpty) {
      this.msgErrComment = 'messages.field_required';
      this.msgErrCommentOwner = 'messages.field_required';
      this.isCommentErr = true;
      this.isCommentErrOwner = true;
      return;
    }

    if(isInvalid) {
      this.msgErrComment = 'components.rating.write_valid_review';
      this.msgErrCommentOwner = 'components.rating.write_valid_review';
      this.isCommentErr = true;
      this.isCommentErrOwner = true;
      return;
    }

    this.sendRating();
  }

  async sendRating(){
    try {
      this.isShowLoader = true;
      const responseProduct: GraphResponse = await this.ratingService.ratingProduct({
        comment: this.commentProduct,
        product_id: this.param.product_id,
        rating: this.ratingProduct
      });

      const responseOwner: GraphResponse = await this.ratingService.ratingOwnerProduct({
        comment: this.commentProduct,
        owner_user_id: this.param.owner_user_id,
        rating: this.ratingProduct
      });

      if(responseOwner.errors || responseProduct.errors){
        throw({
          errOwner: responseOwner.errors,
          errProdutc: responseProduct.errors
        });
      }

      this.isShowRatingTenlow = this.ratingService.isRatingTenlow;

    } catch (error) {
      console.log("🚀 ~ sendRating ~ error:", error);
      this.globalService.showInfo({
        msg: 'messages.global_err'
      });
    } finally {
      this.isShowLoader = false;
    }
  }
}
