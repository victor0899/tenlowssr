import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TypeShared } from 'src/app/interfaces/public';
import { CheckoutData } from 'src/app/interfaces/store';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-shared-content',
  templateUrl: './shared-content.component.html',
  styleUrls: ['./shared-content.component.scss']
})
export class SharedContentComponent implements OnInit {

  txtShared: string = '';
  url: string;

  constructor(
    private dialogRef: MatDialogRef<SharedContentComponent>,
    private globalService: GlobalService,
    private lang: LangService,
    @Inject(MAT_DIALOG_DATA) public typeShared: TypeShared
  ){

    if( location.href.includes('checkout') ){
      const strChekout:CheckoutData = this.globalService.getData(this.globalService.STORAGE_CHECKOUT_DATA);

      this.url = `${location.origin}/products/${strChekout.product?.title.replace(/\s+/g, '-')}/${strChekout.product.id}`
      return;
    }

    this.url = location.href;
  }
  ngOnInit(): void {
    if(this.typeShared == TypeShared.product){
      this.txtShared = 'components.shared.shared_product'
    } else {
      this.txtShared = 'components.shared.shared_profile'
    }
  }

  copyUrl(){
    navigator.clipboard.writeText(this.url);
    this.dialogRef.close();
    this.globalService.showToast( this.lang._('components.shared.link_copy'), 'Ok', 'top')
  }

  sharedFacebook(){
    window.open(`https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&sdk=joey&u=${this.url}&display=popup&ref=plugin&src=share_button`, `${this.lang._('components.shared.shared_in',{type: 'Facebook'})}`, "width=500,height=400");
  }

  sharedLinkedin(){
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${this.url}`, ` ${this.lang._('components.shared.shared_in',{type: 'LinkedIn'})}`, "width=500,height=400");
  }

  sharedTwitter(){
    window.open(`https://twitter.com/intent/tweet?text=${this.getMsgShared()}&url=${this.url}&via=tenlow&hashtags=tenlow`, ` ${this.lang._('components.shared.shared_in',{type: 'Twitter'})}`, "width=500,height=400");
  }

  sharedEmail(){
    window.open(`mailto:?subject=${this.lang._('components.shared.look_this_in_tenlow')}&amp;body=${this.getMsgShared()} ${this.url}.`, ` ${this.lang._('components.shared.shared_in',{type: 'Email'})}`, "width=500,height=400");
  }

  getMsgShared(){
    const type = this.typeShared == TypeShared.product ? 'producto' : 'perfil'
    return this.lang._('components.shared.look_this_interest_tenlow',{type})
  }
}
