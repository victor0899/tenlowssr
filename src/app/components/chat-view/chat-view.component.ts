import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';
import { Observable, Subscription } from 'rxjs';
import { ParamModalConfirm } from 'src/app/interfaces/public';
import { ChatInfo, MessageChat, OptionMenuChat, OptionsChat, UserAuth, UserChat } from 'src/app/interfaces/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { PublicService } from 'src/app/services/public.service';
import { UserService } from 'src/app/services/user.service';
import { ModalConfirmComponent } from '../modals/modal-confirm/modal-confirm.component';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { ModalReportUserComponent } from '../modals/modal-report-user/modal-report-user.component';
import { ModerationService } from 'src/app/services/moderation.service';
import { GraphResponse } from 'src/app/interfaces/graph';

@Component({
  selector: 'chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit{

  @Input() chatInfo!: ChatInfo;
  @Input() onNewMessage!: Observable<ChatInfo>;
  @Output() onDelete = new EventEmitter<ChatInfo>();

  msg:string = '';
  idChat: string = '';
  userReceive!: UserChat;
  isSend: boolean = false;
  isShowLoader: boolean = false;
  isFinishLoad: boolean = false;
  eventNewMsg!: Subscription;
  //julius.ward@example.net

  chatOptions: Array<OptionMenuChat> = [
    {
      label: "components.chat.delete_chat",
      value: OptionsChat.delete
    },
    {
      label: "components.chat.report_user",
      value: OptionsChat.report_user
    },
    {
      label: "components.chat.block_user",
      value: OptionsChat.block_user
    }
  ];

  userLogged?: UserAuth;

  constructor(
    private matDialog: MatDialog,
    public publicService: PublicService,
    private userService: UserService,
    private firebase: FirebaseService,
    private globalService: GlobalService,
    private lang: LangService,
    private moderationService: ModerationService
  ){
    this.userLogged = this.userService.currentUser;
  }

  ngOnInit(): void {
    this.idChat = this.chatInfo.id ?? '';
    this.userReceive = this.chatInfo.userReceive;
    this.isFinishLoad =  true;
    this.scrollToBottom();
    this.observableMessage();
  }

  observableMessage(){
    this.eventNewMsg = this.onNewMessage.subscribe( evnChat => {
      if(evnChat.id == this.idChat){
        console.log("🚀 ~ observableMessage ~ evnChat:", evnChat)
        let newMsg:MessageChat = evnChat.messages[evnChat.messages.length - 1];
        if(!this.isFinishLoad) return;
        const lengthMsg = this.chatInfo.messages.length;
        if(newMsg.createdAt.toMillis() == this.chatInfo.messages[lengthMsg-1].createdAt.toMillis()) return;
        if( newMsg.sendUserId !== this.userLogged?.id){
          this.chatInfo.messages.push(newMsg);
          this.scrollToBottom();
        }
      }
    });
  }

  scrollToBottom(){
    const chatContent = document.getElementById("chatMessages");
    if(chatContent){
      setTimeout(() => {
        chatContent.scrollTop = chatContent?.scrollHeight;
      }, 200);
    }
  }
  checkDateMessage(current:Timestamp, previous?:Timestamp) {
    if (
      !previous || dayjs(current.toDate()).format("MMM Do YY") != dayjs(previous.toDate()).format("MMM Do YY")
    ) {
      return true;
    }
    return false;
  }

  async sendMessage(){

    if(!this.userLogged) return;

    if(this.msg.trim() == '') return;
    this.isSend = true;

    const message: MessageChat = {
      createdAt: Timestamp.now(),
      message: this.msg,
      sendUserId: this.userLogged.id,
      deletedBy: []
    };

    await this.firebase.sendChatMessage( message , this.idChat);

    // this.sendNotification(this.userReceive.id,descryptMsg);
    this.chatInfo.messages.push(message);
    this.isSend = false;
    this.msg = '';
    await this.firebase.haveNewMessages(this.idChat, this.userLogged.id);
    await this.firebase.setNewMessage(this.idChat, true);
    // this.firebase.eventNotificationMsg.next(false);
    this.chatInfo.newMsgFrom = '';
    this.chatInfo.new_message = false;
    // this.firebase.eventNewMessage.next(this.chat);

    this.scrollToBottom();
  }

  isDisabledButton(option: OptionsChat){

    if(option == OptionsChat.report_user){
      if(!this.chatInfo.reportedUser) return false;
      if(!this.chatInfo.reportedUser.includes(this.chatInfo.userReceive.id)) return false;
      return true;
    }

    if(option == OptionsChat.block_user){
      if(!this.chatInfo.blockedUser) return false;
      if(!this.chatInfo.blockedUser.includes(this.chatInfo.userReceive.id)) return false;
      return true;
    }

    return false;
  }
  ////********** ACTIONS ****************/

  isDeletedMsg( msg:MessageChat ){
    if(!msg.deletedBy) return false;

    return msg.deletedBy.includes( this.userLogged!.id );
  }

  doActionChat(option : OptionsChat){
    if( option == OptionsChat.delete ) return this.alertDeleteChat();

    if( option == OptionsChat.report_user ) return this.alertReportUser();

    this.alertBlockUser();
  }

  alertDeleteChat(){

    const textsModal:ParamModalConfirm = {
      title: 'components.chat.delete_chat',
      msg: 'components.chat.delete_chat_msg'
    };

    const ref = this.matDialog.open( ModalConfirmComponent, {
      data: textsModal
    });

    ref.afterClosed().subscribe( resp => {
      if(resp){
        this.deleteChat();
      }
    })
  }

  async deleteChat(){
    this.isShowLoader = true;
    try {
      const response:boolean = await this.firebase.deleteChat( this.idChat, this.chatInfo.messages );
      this.isShowLoader = false;
      this.onDelete.emit( this.chatInfo );
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ deleteChat ~ error:", error)
      this.globalService.showToast( this.lang._('messages.global_err'), 'Ok', 'top' );
    }
  }

  alertReportUser(){
    const ref = this.matDialog.open(ModalReportUserComponent,{
      data: this.chatInfo
    });

    ref.afterClosed().subscribe( resp => {
      if(resp){
        this.chatInfo.reportedUser = [];
        this.chatInfo.reportedUser.push(this.chatInfo.userReceive.id);
      }
    })
  }

  alertBlockUser(){
    const { name } = this.chatInfo.userReceive;

    const textsModal:ParamModalConfirm = {
      title:  this.lang._('components.chat.block_at', { user: name}),
      msg: this.lang._('components.chat.block_user_msg', { user: name})
    };

    const ref = this.matDialog.open( ModalConfirmComponent, {
      data: textsModal
    });

    ref.afterClosed().subscribe( resp => {
      if(resp){
        this.blockUser();
      }
    })
  }

  async blockUser(){
    this.isShowLoader = true;
    try {
      const { name } = this.chatInfo.userReceive;
      const response = await this.moderationService.blockedChat( this.idChat, this.chatInfo.userReceive.id );
      const responseGraph:GraphResponse = await this.moderationService.blockedUser( this.chatInfo.userReceive.id );
      console.log("🚀 ~ blockUser ~ response:", responseGraph.data)
      if(!response) throw('Err cant blocked user');
      this.globalService.showToast( this.lang._('components.chat.msg_success_block', { user: name } ), 'Ok', 'top' );
      this.moderationService.eventBlockUser.next( this.chatInfo.userFromId );
      this.isShowLoader = false;
      this.onDelete.emit( this.chatInfo );
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ blockUser ~ error:", error);
      this.globalService.showToast( this.lang._('messages.global_err'), 'Ok', 'top' );
    }
  }
}
