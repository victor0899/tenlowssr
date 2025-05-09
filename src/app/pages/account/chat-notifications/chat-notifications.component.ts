import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Subject, Subscription, retry } from 'rxjs';
import { CheckCodeRentalComponent } from 'src/app/components/modals/check-code-rental/check-code-rental.component';
import { ModalCancelRentalComponent } from 'src/app/components/modals/modal-cancel-rental/modal-cancel-rental.component';
import { ModalConfirmComponent } from 'src/app/components/modals/modal-confirm/modal-confirm.component';
import { ModalRatingComponent } from 'src/app/components/modals/modal-rating/modal-rating.component';
import { GraphResponse } from 'src/app/interfaces/graph';
import { BlockedUser } from 'src/app/interfaces/moderation';
import { TypeConfirmRental } from 'src/app/interfaces/payments';
import { PaginatorInfo, ParamModalConfirm, ParamModalRating } from 'src/app/interfaces/public';
import { OperationStatus } from 'src/app/interfaces/store';
import { NotificationType, UserChat, UserElement } from 'src/app/interfaces/user';
import { ChatInfo, MessageChat, NotificationData, User } from 'src/app/interfaces/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';
import { ModerationService } from 'src/app/services/moderation.service';
import { PublicService } from 'src/app/services/public.service';
import { RentalService } from 'src/app/services/rental.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { DateTime } from 'luxon';
import { StripeService } from 'src/app/services/stripe.service';

@Component({
  selector: 'app-chat-notifications',
  templateUrl: './chat-notifications.component.html',
  styleUrls: ['./chat-notifications.component.scss']
})
export class ChatNotificationsComponent implements OnInit, OnDestroy {
  @ViewChild('matPagNotifications') matPagNotifications!: MatPaginator;


  isShowChat: boolean = false;
  isOpenNotification: boolean = false;
  isOpenSetPreferences: boolean = false;
  isShowLoader: boolean = false;

  chatOptions: Array<string> = [
    "components.chat.delete_chat",
    "components.chat.report_user",
    "components.chat.block_user"
  ];

  notificationPage: number = 1;
  notifications: Array<NotificationData> = [];
  paginatorNotification!: PaginatorInfo;
  isLoadNotifications: boolean = true;
  notificationSelected!: NotificationData;

  optionsAutocomplete: any = {
    bounds: null
  };

  cssInputDate: string = "";
  cssDateFloatLabel: string = "";

  isSuccess: boolean = false;
  isAcceptRental: boolean = false;
  isOpenConfirmDelivery: boolean = false;
  isConfirmDelivery: boolean = false;
  isOpenConfirmReceive: boolean = false;
  isConfirmReceive: boolean = false;

  userCurrent?: User;

  chatSelected!: ChatInfo | null;
  listChat: ChatInfo[] = [];
  isLoadChat: boolean = true;

  eventNewMessage: Subscription;
  eventNewChat!: Subscription;
  eventChat = new Subject<ChatInfo>();

  eventBlockUser!: Subscription;

  hourMeet: any;
  hourMeet2: any;
  hourMeet3: any;
  directionMeet: string = "";
  listIdBlocked: string[] = [];

  isSendMeet: boolean = false;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private location: Location,
    private stripeService: StripeService,
    private userService: UserService,
    private globalService: GlobalService,
    private lang: LangService,
    private storeService: StoreService,
    private firebase: FirebaseService,
    public publicService: PublicService,
    private rentalService: RentalService,
    private moderationService: ModerationService
  ) {
    this.userCurrent = this.userService.currentUser;
    this.cssInputDate = this.publicService.cssInputBase + " focus:border-tl-dark-medium";
    this.cssDateFloatLabel = this.publicService.cssFloatLabelBase + " peer-focus:text-tl-dark-medium";
    /// ***********************************************************
    this.eventNewMessage = this.firebase.eventNewMessage.subscribe(chatUpdated => {

      console.log("🚀 ~ *********** chatUpdated:", chatUpdated);

      const { blockedUser, userReceive, userSender } = chatUpdated;

      if (blockedUser) {
        if (blockedUser.includes(userReceive.id) || blockedUser.includes(userSender.id)) return;
      }

      if (this.listIdBlocked.includes(userReceive.id) || this.listIdBlocked.includes(userSender.id)) return;


      this.listChat = this.listChat.map(chat => {

        if (chatUpdated.userToId == this.userCurrent!.id && chatUpdated.id == chat.id) {
          return {
            ...chatUpdated,
            userFromId: chatUpdated.userToId,
            userToId: chatUpdated.userFromId,
            userSender: chatUpdated.userReceive,
            userReceive: chatUpdated.userSender,
          };
        }


        if (chatUpdated.id == chat.id) {
          return chatUpdated;
        }

        return chat;
      });

      this.pushChatInList(chatUpdated);

      this.eventChat.next(chatUpdated);
    });
    /// ***********************************************************
    this.eventBlockUser = this.moderationService.eventBlockUser.subscribe(idUser => {
      this.listChat = this.listChat.filter(item => item.userToId !== idUser);
      this.notifications = this.notifications.filter(item => item.operation.user.id !== idUser);
    });
  }

  async ngOnInit() {
    await this.getBlockedUsers();
    await this.getNotifications();
    await this.getChatList();
  }

  ngOnDestroy(): void {
    this.eventNewMessage.unsubscribe();
    this.eventBlockUser.unsubscribe();
  }

  async getBlockedUsers() {
    try {
      const response: GraphResponse = await this.moderationService.getBlockedUsers();
      const blocked: BlockedUser[] = response.data.getBlockeds;
      this.listIdBlocked = blocked.map(item => item.blocked_user_id);
      return;
    } catch (error) {
      console.log("🚀 ~ getBlockedUsers ~ error:", error)
      return;
    }
  }

  back() {
    this.location.back();
  }

  observableNewChat() {
    this.eventNewChat = this.firebase.eventNewChat.subscribe(newChat => {
      console.log("🚀 ~ ************ newChat:", newChat);

      const { blockedUser, deletedBy, userReceive, userSender } = newChat;

      if (blockedUser) {
        if (blockedUser.includes(userReceive.id) || blockedUser.includes(userSender.id)) return;
      }

      if (this.listIdBlocked.includes(userReceive.id) || this.listIdBlocked.includes(userSender.id)) return;


      if (deletedBy?.includes(this.userCurrent!.id)) return;

      this.pushChatInList(newChat);
    });
  }

  isCanceledOperation() {
    const { operation } = this.notificationSelected;
    const isCancelled = operation.status == 'canceled_by_admin' || operation.status == 'canceled_by_locator' || operation.status == 'canceled_by_locatario';
    return isCancelled;
  }

  modalCancelRental() {
    const ref = this.matDialog.open(ModalCancelRentalComponent, {
      data: this.notificationSelected.operation
    });

    ref.afterClosed().subscribe((resp: boolean) => {
      if (resp) {
        // ToDo: Cancel state operation
        this.notificationSelected.operation.status = 'canceled_by_locatario';
        this.closeNotification();
      }
    });
  }

  /**
   * CHAT **********************************
   */

  //#region CHAT FUNCTIONS *********
  pushChatInList(newChat: ChatInfo) {

    const existChat = this.listChat.find(item => item.id == newChat.id);

    if (existChat) return;

    if (newChat.userToId == this.userCurrent!.id) {
      this.listChat.unshift({
        ...newChat,
        userFromId: newChat.userToId,
        userToId: newChat.userFromId,
        userSender: newChat.userReceive,
        userReceive: newChat.userSender,
      });
      return;
    }

    this.listChat.unshift(newChat);

  }

  onDeleteChat(chat: ChatInfo) {
    this.listChat = this.listChat.filter(item => item.id !== chat.id);
    this.chatSelected = null;
  }

  selectChat(conversation: ChatInfo) {
    conversation.new_message = false;
    this.chatSelected = conversation;
  }

  async getChatList() {
    try {
      let chatList: ChatInfo[] = [];
      const response = await this.firebase.getChatList(this.userCurrent!.id);
      console.log("🚀 ~ getChatList ~ response:", response)
      response.forEach(chat => {
        const { idsUsers, userFromId, messages, userReceive, userSender, userToId, id, newMsgFrom, new_message, reportedUser, blockedUser, product, deletedBy } = chat;

        if (blockedUser) {
          if (blockedUser.includes(userReceive.id) || blockedUser.includes(userSender.id)) return;
        }

        if (deletedBy?.includes(this.userCurrent!.id)) return;

        // if(this.listIdBlocked.includes(userReceive.id) || this.listIdBlocked.includes(userSender.id)) return;

        if (chat.userToId == this.userCurrent!.id) {
          chatList.push({
            ...chat,
            userFromId: userToId,
            userToId: userFromId,
            userSender: userReceive,
            userReceive: userSender,
          });
          return;
        }

        chatList.push(chat);
      });

      this.listChat = this.listChat.concat(chatList);
      this.firebase.listChats = [...this.listChat];
      this.isLoadChat = false;
      this.observableNewChat();
      return;
    } catch (error) {
      this.isLoadChat = false;
      return;
    }
  }

  getLastMessage(messages: MessageChat[]) {
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.message.length > 20) {
      lastMsg.message.substring(0, 20) + "...";
    }

    return lastMsg;
  }

  getCompleteName(user: UserElement) {
    return `${user.name} ${user.last_name}`
  }

  async sendPreferDeliveredProduct() {

    const product = this.notificationSelected.operation.product;
    const otherUser = { ...product.user };

    const userReceive: UserChat = {
      id: otherUser.id,
      name: `${otherUser.name} ${otherUser.last_name}`,
      photo: otherUser.profile_photo_path ?? ''
    };

    const { id, name, last_name, profile_photo_path } = this.userCurrent!;

    const userSender: UserChat = {
      id,
      name: `${name} ${last_name}`,
      photo: profile_photo_path
    };

    const encryptMsg = await this.firebase.encryptUsingAES256(this.lang._('pages.notifications.msg_prefer_send_me', { user: userReceive.name }));

    const chat: ChatInfo = {
      userFromId: id,
      userToId: otherUser.id,
      idsUsers: [id, otherUser.id],
      userReceive,
      userSender,
      new_message: true,
      newMsgFrom: id,
      messages: [
        {
          createdAt: Timestamp.now(),
          message: encryptMsg,
          sendUserId: id,
          deletedBy: []
        }
      ],
      blockedUser: [],
      reportedUser: [],
      deletedBy: [],
      product: {
        description: product.description,
        id: product.id,
        name: product.title,
        image: product.images[0].path,
      }
    };

    await this.setAcceptedAddressMeeting(false);

    const existChat = await this.firebase.verifyExistChat(chat.userToId, chat.userFromId);

    if (existChat) {

      if (existChat?.blockedUser?.length) return;

      this.isShowChat = true;
      this.chatSelected = existChat;
      return;

    }

    this.createChat(chat);
  }

  async setPayloadChat() {

    const otherUser = this.notificationSelected.operation.user;
    const product = this.notificationSelected.operation.product;

    const userReceive: UserChat = {
      id: otherUser.id,
      name: `${otherUser.name} ${otherUser.last_name}`,
      photo: otherUser.profile_photo_path ?? ''
    };

    const { id, name, last_name, profile_photo_path } = this.userCurrent!;

    const userSender: UserChat = {
      id,
      name: `${name} ${last_name}`,
      photo: profile_photo_path
    };

    const encryptMsg = await this.firebase.encryptUsingAES256(`Hola! ${userReceive.name}`);

    const chat: ChatInfo = {
      userFromId: id,
      userToId: otherUser.id,
      idsUsers: [id, otherUser.id],
      userReceive,
      userSender,
      new_message: true,
      newMsgFrom: id,
      messages: [
        {
          createdAt: Timestamp.now(),
          message: encryptMsg,
          sendUserId: id,
          deletedBy: []
        }
      ],
      blockedUser: [],
      reportedUser: [],
      deletedBy: [],
      product: {
        description: product.description,
        id: product.id,
        name: product.title,
        image: product.images[0].path,
      }
    };

    return chat;
  }

  async initConversation() {
    try {

      const payload = await this.setPayloadChat();

      const existChat = await this.firebase.verifyExistChat(payload.userToId, payload.userFromId);

      if (existChat) {

        if (existChat?.blockedUser?.length) return;

        this.isShowChat = true;
        this.chatSelected = existChat;
        return;

      }

      // IF NOT EXIST ID CHAT, CREATE CONVERSATION
      this.createChat(payload);

    } catch (error) {
      console.log("🚀 ~ openChat ~ error:", error)
      this.globalService.showInfo({
        msg: 'pages.notification.err_open_chat'
      })
    }
  }

  async createChat(payload: ChatInfo) {
    this.isShowLoader = true;
    try {
      const response = await this.firebase.createChat(payload);
      if (!response) throw ("Can't init chat");
      this.isShowChat = true;
      const newChat = {
        id: response,
        ...payload
      };

      const existChat = this.listChat.find(item => item.id == newChat.id);
      this.chatSelected = newChat;

      if (!existChat) {
        this.listChat.push(newChat);
        this.firebase.listChats = [...this.listChat];
      }

      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ createChat ~ error:", error)
      this.globalService.showInfo({
        msg: 'pages.notification.err_open_chat'
      })
    }
  }
  //#endregion

  /**
   * NOTIFICATIONS **********************************
   */

  //#region NOTIFICATIONS *********
  openNotification(notification: NotificationData) {
    const { operation } = notification;
    console.log("🚀 ~ openNotification ~ notification:", notification);

    if (notification.type == NotificationType.information) return;

    if (notification.type == NotificationType.table_request) {
      const objMeta: any = JSON.parse(notification.meta);
      if (!notification.user_read_at) this.setReadNotification(notification);
      this.router.navigate([this?.lang?._locale == 'es' ? 'tablon/mi-peticion' : 'tablon/my-petition', objMeta.request_board_id]);
      return;
    }

    const { product } = operation;


    if (notification.type == NotificationType.delivery_confirm) {

      if (operation.status == OperationStatus.confirmed && product.user.id == this.userCurrent?.id) {
        this.isOpenConfirmDelivery = true;
      }

      if (operation.status == OperationStatus.delivered && product.user.id == this.userCurrent?.id) {
        this.isOpenConfirmDelivery = true;
        this.isConfirmDelivery = true;
      }

      if ((operation.status == OperationStatus.confirmed || operation.status == OperationStatus.delivered) && product.user.id !== this.userCurrent?.id) {
        this.isOpenConfirmReceive = true;
      }

      if (operation.status == OperationStatus.received) {
        this.isOpenConfirmReceive = true;
        this.isConfirmReceive = true;
      }
    }

    if (notification.type == NotificationType.rental) {

      if (operation.shipping_method == 'in_person') {
        if (typeof operation.suggestion_hours == 'string') operation.suggestion_hours = JSON.parse(operation.suggestion_hours as string);
      }

      if (operation.status == 'confirmed' && operation.shipping_method !== "in_person" && operation.user.id !== this.userCurrent?.id!) {
        this.isSuccess = true;
      }

      if ((operation.status == 'received' || operation.status == 'delivered') && operation.shipping_method !== "in_person" && operation.user.id !== this.userCurrent?.id!) {
        this.isSuccess = true;
      }

      if ((operation.status == 'received' || operation.status == 'delivered') && operation.shipping_method !== "in_person" && operation.user.id == this.userCurrent?.id!) {
        this.isSuccess = true;
      }
    }

    this.isOpenNotification = true;
    if (!notification.user_read_at) this.setReadNotification(notification);
    this.notificationSelected = notification;
  }

  getImageNotification(notification: NotificationData) {
    const { operation, type } = notification;
    if (type == NotificationType.rental || type == NotificationType.purchase || type == NotificationType.sale) {
      return operation.product.images[0].path;
    }

    return 'assets/icons/tl-notification.svg'
  }

  async setReadNotification(notification: NotificationData) {
    try {
      await this.userService.setReadNotification(notification.id);
      notification.user_read_at = dayjs().format('YYYY-MM-DD');
      this.userService.evntReduceNotification.next({ isReduce: true, total: 0 });
    } catch (error) {
      console.log("🚀 ~ setReadNotification ~ error:", error)
    }
  }

  openRejectRental(operation_id: string) {

    const payload: ParamModalConfirm = {
      title: 'pages.notifications.sure_not_rental_item',
      title2: `${this.notificationSelected.operation?.product?.title}?`,
      msg: '',
      txtCancel: 'pages.notifications.i_change_mind',
      txtOk: 'pages.notifications.yes_very_sure'
    };

    const ref = this.matDialog.open(ModalConfirmComponent, {
      data: payload
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.rejectRental(operation_id);
      }
    });
  }

  async rejectRental(operation_id: string) {
    this.isShowLoader = true;
    try {
      const response: GraphResponse = await this.rentalService.rejectRentalRequest(operation_id);
      if (response.errors) throw (response.errors);
      this.isAcceptRental = false;
      this.isShowLoader = false;
      this.isOpenNotification = false
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ acceptRental ~ error:", error)
      this.globalService.showInfo({
        msg: 'messages.global_err'
      })
    }
  }

  async acceptRental(operation_id: string) {
    this.isShowLoader = true;
    try {
      const response: GraphResponse = await this.rentalService.acceptRentalRequest(operation_id);
      if (response.errors) throw (response.errors);

      const { shipping_method, id } = this.notificationSelected.operation;

      if (shipping_method !== 'in_person') {
        await this.preRegisterDelivery(id);
      }

      return true;
    } catch (error) {
      console.log("🚀 ~ acceptRental ~ error:", error)
      this.isShowLoader = false;
      return false;
      // this.globalService.showInfo({
      //   msg: 'messages.global_err'
      // })
    }
  }

  closeNotification() {
    this.isOpenNotification = false
    this.isSuccess = false
    this.isConfirmDelivery = false;
    this.isOpenConfirmDelivery = false;
    this.isOpenConfirmReceive = false;
    this.isConfirmReceive = false;
    this.isAcceptRental = false;
  }

  async getNotifications() {
    try {
      const response: GraphResponse = await this.userService.getAllNotifications(this.notificationPage);
      if (response.errors) throw (response.errors);
      console.log("🚀 ~ getNotifications ~ response:", response.data.notifications);
      const { notifications } = response.data;
      this.notifications = [...notifications.data];
      this.paginatorNotification = { ...notifications.paginatorInfo };
      this.isLoadNotifications = false;
      await this.userService.getUnreadNotifications();
    } catch (error) {
      this.isLoadNotifications = false;
      this.globalService.showToast(this.lang._('pages.notifications.err_load_notifications'), 'Ok');
      console.log("🚀 ~ getNotifications ~ error:", error)
    }
  }

  async eventPaginatorNotifications(e: PageEvent) {
    this.isLoadNotifications = true;

    if (e.previousPageIndex == undefined) return;

    if (e.previousPageIndex > this.matPagNotifications.pageIndex) {
      this.notificationPage--;
    } else {
      this.notificationPage++;
    }

    if (this.notificationPage > this.paginatorNotification.lastPage) return;

    await this.getNotifications();

    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  modalConfirmDeliveryProduct() {

    const { operation } = this.notificationSelected;

    const payload = {
      operation,
      type: TypeConfirmRental.delivered
    };
    console.log('enviar', operation, 'payload', payload)

    const ref = this.matDialog.open(CheckCodeRentalComponent, {
      disableClose: true,
      data: payload
    });

    ref.afterClosed().subscribe(resp => {
      if (resp) {
        this.isConfirmDelivery = true;
        this.updateStatusOperation(operation.id, OperationStatus.delivered);
        this.notificationSelected.operation.status = OperationStatus.delivered;
      }
    });
  }

  async modalConfirmReceiveProduct() {

    const { operation } = this.notificationSelected;

    const payload = {
      operation,
      type: TypeConfirmRental.received
    };

    const ref = this.matDialog.open(CheckCodeRentalComponent, {
      disableClose: true,
      data: payload
    });


    ref.afterClosed().subscribe(async resp => {
      if(resp){
        this.updateStatusOperation( operation.id, OperationStatus.received );
        this.isConfirmReceive = true;
        const resCapture = await this.stripeService.capturePaymentIntent(operation.payment.transaction_id);
        console.log('respuesta', resCapture)
        this.notificationSelected.operation.status = OperationStatus.received;
        this.openModalRating();
      }
    });
    // const resCapture = await this.stripeService.capturePaymentIntent(operation.payment.transaction_id);
    
    // if (resCapture.data.capturePaymentIntent.success) {
    //   console.log("Pago capturado con éxito", resCapture.data.capturePaymentIntent.status);
    //   this.updateStatusOperation(operation.id, OperationStatus.received);
    //   this.isConfirmReceive = true;
    //   this.notificationSelected.operation.status = OperationStatus.received;
    //   this.openModalRating();
    // } else {
    //   console.log("Error capturando el pago");
    // }
    
  }
  //#endregion

  async sendNotificationDeliveryProduct() {
    try {
      const { id } = this.notificationSelected.operation;

      const responseNot: GraphResponse = await this.rentalService.sendNotificationDelivered(id);
      if (responseNot.errors) throw (responseNot.errors);

    } catch (error) {
      console.log("🚀 ~ sendNotificationDeliveredProduct ~ error:", error)
    } finally {
      return;
    }
  }

  async sendNotificationReceiveProduct() {
    try {
      const { id } = this.notificationSelected.operation;
      const responseNot: GraphResponse = await this.rentalService.sendNotificationReceive(id);
      if (responseNot.errors) throw (responseNot.errors);
    } catch (error) {
      console.log("🚀 ~ sendNotificationDeliveredProduct ~ error:", error)
    } finally {
      return;
    }
  }

  async proccessAceptRental() {
    const { shipping_method, id } = this.notificationSelected.operation;

    if (shipping_method == 'in_person') {
      return this.isAcceptRental = true;
    }

    const isRental = await this.acceptRental(id);

    if (isRental) {
      this.sendNotificationDeliveryProduct();
      this.isShowLoader = false;
      this.isSuccess = true;
    }
  }

  onSelectAddress(event: Address) {
    console.log("🚀 ~ onSelectAddress ~ event:", event)
    this.directionMeet = event.formatted_address;
  }

  isAddedHours() {
    if (!this.isSendMeet) return true;

    if (!this.hourMeet) return false;
    if (!this.hourMeet2) return false;
    if (!this.hourMeet3) return false;

    return true;
  }

  async sendMeetingInformation() {
    try {
      this.isSendMeet = true;

      if (!this.hourMeet || this.directionMeet == '') return;
      if (!this.hourMeet2) return;
      if (!this.hourMeet3) return;

      // this.hourMeet = this.hourMeet + ':00'

      const hours = [
        this.hourMeet + ':00',
        this.hourMeet2 + ':00',
        this.hourMeet3 + ':00',
      ];

      this.isSendMeet = false;

      await this.acceptRental(this.notificationSelected.operation.id);

      const response: GraphResponse = await this.rentalService.setInPersonRentalAddress({
        operation_id: this.notificationSelected.operation.id,
        shipping_address: this.directionMeet,
        suggestion_hours: hours
      });

      if (response.errors) throw (response.errors);

      this.notificationSelected.operation.status = OperationStatus.confirmed;
      this.notificationSelected.operation.shipping_address = this.directionMeet;
      this.notificationSelected.operation.shipping_hour = this.hourMeet;
      this.notificationSelected.operation.accepted_shipping_address = null;
      this.notificationSelected.operation.suggestion_hours = hours;
      this.isAcceptRental = false;

      // this.isSuccess = true;
      this.isShowLoader = false;
    } catch (error) {
      this.isShowLoader = false;
      console.log("🚀 ~ acceptRental ~ error:", error)
      this.globalService.showInfo({
        msg: 'messages.global_err'
      });
    }
  }

  isExistResponseAddress() {
    const { accepted_shipping_address, shipping_address, shipping_method } = this.notificationSelected.operation;

    if (shipping_method !== 'in_person') return false;

    if (shipping_address == null) return false;

    if (accepted_shipping_address == null) return false;

    return true;
  }
  msgResponseAddressMeet() {
    const { accepted_shipping_address, shipping_address } = this.notificationSelected.operation;

    if (accepted_shipping_address) {
      return '';
    }

    return '';
  }

  selectHour(hour: string) {
    this.notificationSelected.operation.shipping_hour = hour;
  }

  async setAcceptedAddressMeeting(isAccept: boolean) {
    try {

      this.isShowLoader = true;
      const { id, shipping_hour } = this.notificationSelected.operation;
      const response: GraphResponse = await this.rentalService.toggleAcceptRentalAddress({ accepted: isAccept, operation_id: id, hour: shipping_hour });
      if (response.errors) throw (response.errors);

      this.notificationSelected.operation.accepted_shipping_address = isAccept;
      this.sendNotificationDeliveryProduct();

    } catch (error) {
      console.log("🚀 ~ acceptedAddressMeeting ~ error:", error);
      this.globalService.showInfo({ msg: 'messages.global_err' });
    } finally {
      this.isShowLoader = false;
    }
  }

  async updateStatusOperation(operation_id: string, status: OperationStatus) {
    try {
      this.isShowLoader = true;
      const response: GraphResponse = await this.rentalService.updateStatusOperation(operation_id, status);
      if (response.errors) throw (response.errors);
      if (!response.data) throw ("empty data");

      this.notificationSelected.operation.status = status;

    } catch (error) {
      console.log("🚀 ~ updateStatusOperation ~ error:", error);
      this.globalService.showInfo({ msg: 'messages.global_err' });
    } finally {
      this.isShowLoader = false;
    }
  }

  async openModalRating() {
    const { product } = this.notificationSelected.operation;
    const params: ParamModalRating = {
      product_id: product.id,
      owner_user_id: product.user.id
    };

    const ref = this.matDialog.open(ModalRatingComponent, {
      data: params
    });
  }

  async preRegisterDelivery(operation_id: string) {
    try {

      const response: GraphResponse = await this.storeService.preRegisterShipping(operation_id);
      if (response.errors) throw (response.errors);

      const { preRegistration } = response.data;

      if (preRegistration[0] !== '1') {
        this.globalService.showToast(preRegistration[1], 'Ok', 'top');
        return;
      }

    } catch (error) {
      console.log("🚀 ~ preRegisterDelivery ~ error:", error)
      this.globalService.showInfo({ msg: 'messages.global_err' });
    }
  }
}
