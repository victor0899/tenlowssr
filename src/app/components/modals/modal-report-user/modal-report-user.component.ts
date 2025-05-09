import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphResponse } from 'src/app/interfaces/graph';
import { OptionReport } from 'src/app/interfaces/moderation';
import { ChatInfo } from 'src/app/interfaces/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { ModerationService } from 'src/app/services/moderation.service';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-modal-report-user',
  templateUrl: './modal-report-user.component.html',
  styleUrls: ['./modal-report-user.component.scss']
})
export class ModalReportUserComponent {

  reasonsReport: Array<OptionReport> = [
    {
      icon: "assets/icons/tl-sad.svg",
      label:"components.report_user.no_show",
      value: "not_show_up"
    },
    {
      icon: "assets/icons/tl-angry.svg",
      label:"components.report_user.misconduct",
      value: "bad_behavior"
    },
    {
      icon: "assets/icons/tl-heart_broken.svg",
      label:"components.report_user.defective_item",
      value: "defective_item"
    },
    {
      icon: "assets/icons/tl-other.svg",
      label:"components.report_user.other",
      value: "others"
    },
  ];

  reasonSelected!:OptionReport | null;
  isShowSuccess: boolean = false;
  isShowLoader: boolean = false;
  isCommentErr: boolean = false;
  comment: string = '';
  msgErrComment: string = '';

  constructor(
    private firebase: FirebaseService,
    private globalService: GlobalService,
    public publicService: PublicService,
    private lang: LangService,
    private moderationService: ModerationService,
    private dialogRef: MatDialogRef<ModalReportUserComponent>,
    @Inject(MAT_DIALOG_DATA) public chatParam: ChatInfo
  ){}

  selectReason( reason: OptionReport ){
    this.reasonSelected = reason;
  }

  resetReport(){
    this.reasonSelected = null;
    this.comment = '';
  }

  close(){
    this.dialogRef.close(this.isShowSuccess);
  }

  validate(){
    if( this.reasonSelected?.value == 'others' ){

      if(this.comment.length == 0) {
        this.msgErrComment = 'messages.field_required';
        this.isCommentErr = true;
        return;
      }

      if(this.comment.length < 15) {
        this.msgErrComment = 'components.report_user.err_valid_comment';
        this.isCommentErr = true;
        return;
      }
    }

    this.sendReport();
  }

  async sendReport(){
    this.isShowLoader = true;
    try {
      await this.moderationService.reportedChat( this.chatParam.id! , this.chatParam.userReceive.id );
      const resp:GraphResponse = await this.moderationService.reportUser( this.chatParam.userReceive.id , this.reasonSelected!.value, this.comment )
      console.log("🚀 ~ sendReport ~ resp:", resp.data)
      this.isShowSuccess = true;
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ sendReport ~ error:", error);
      this.globalService.showToast( this.lang._('messages.global_err'), 'Ok', 'top' );
    }
  }
}
