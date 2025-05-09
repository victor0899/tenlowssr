import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphResponse } from 'src/app/interfaces/graph';
import { OperationInfo } from 'src/app/interfaces/payments';
import { OptionCancelRental } from 'src/app/interfaces/public';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-modal-cancel-rental',
  templateUrl: './modal-cancel-rental.component.html',
  styleUrls: ['./modal-cancel-rental.component.scss']
})
export class ModalCancelRentalComponent {

  optionsCancel: OptionCancelRental[] = [
    {
      label: 'components.cancel_rental.change_opinion',
      value: 'change_opinion'
    },
    {
      label: 'components.cancel_rental.item_unavailable',
      value: 'item_unavailable'
    },
    {
      label: 'components.cancel_rental.personal_issues',
      value: 'personal_issue'
    },
    {
      label: 'components.cancel_rental.item_damage',
      value: 'item_damage'
    },
    {
      label: 'components.cancel_rental.others',
      value: 'others'
    },
  ];

  reason!: OptionCancelRental;
  comment: string = '';
  isShowLoader: boolean = false;

  constructor(
    public publicService: PublicService,
    private globalService: GlobalService,
    private rentalService: RentalService,
    private lang: LangService,
    private dialogRef: MatDialogRef<ModalCancelRentalComponent>,
    @Inject(MAT_DIALOG_DATA) public operation: OperationInfo
  ){}

  confirm(){}

  async cancelRental(){
    this.isShowLoader = true;
    try {
      // await this.moderationService.reportedChat( this.chatParam.id ?? '', this.chatParam.userReceive.id );
      const response:GraphResponse = await this.rentalService.rejectRentalRequest( this.operation.id )
      console.log("🚀 ~ sendReport ~ response:", response.data);
      this.isShowLoader = false;
      this.dialogRef.close(true);
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ sendReport ~ error:", error);
      this.globalService.showToast( this.lang._('messages.global_err'), 'Ok', 'top' );
    }
  }
}
