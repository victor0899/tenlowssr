import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import { environment } from 'src/environments/environment';
import { Firestore, Unsubscribe, addDoc, arrayUnion, collection, doc, getDocs, getFirestore, onSnapshot, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { ChatInfo, MessageChat } from '../interfaces/user';
import CryptoJS from 'crypto-js';
import { Subject } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  firebaseApp!: FirebaseApp;
  analytics!: Analytics;
  firestoreDb!: Firestore;
  private _listChats: ChatInfo[] = [];

  eventListenMessages!: Unsubscribe;
  eventNewChat = new Subject<ChatInfo>();
  eventNewMessage = new Subject<ChatInfo>();
  eventNotificationMsg = new Subject<boolean>();
  eventDeleteChat = new Subject<ChatInfo>();

  constructor(
    private userService: UserService
  ) {}

  public get listChats(): ChatInfo[] {
    return this._listChats;
  }

  public set listChats(value: ChatInfo[]) {
    this._listChats = value;
  }

  initFirebaseService(){
    this.firebaseApp = initializeApp(environment.firebaseConfig);
    this.analytics = getAnalytics(this.firebaseApp);
    this.firestoreDb = getFirestore(this.firebaseApp);
    return;
  }

  ///*******************  CHAT FUNCTIONS  *************
  async deleteChat( idChat: string, messages: MessageChat[]){
    try {

      const userCurrent =  this.userService.currentUser;
      if(!userCurrent) return false;

      const chatRef = doc(this.firestoreDb,  `${environment.collectionChat}/${idChat}` );

      // Update doc chat
      await updateDoc( chatRef , {
        deletedBy: arrayUnion(userCurrent.id)
      });

      // Update chat messages to hidden
      const msgsUpdated = messages.map( msg => {
        return {
          ...msg,
          deletedBy: [userCurrent.id]
        }
      });

      const batch = writeBatch(this.firestoreDb);
      batch.update(chatRef, {"messages": msgsUpdated });
      await batch.commit();

      return true;

    } catch (error) {
      console.log("🚀 ~ deleteChat ~ error:", error)
      return false;
    }
  }

  /**
   * @description
   * Asynchronously creates a new chat with the given ChatInfo object.
   * @param {ChatInfo} chat - The ChatInfo object containing the chat information.
   * @return {Promise<string | null>} Returns a string containing the ID of the newly created chat if successful, or null if an error occurred.
   */
  async createChat( chat: ChatInfo ): Promise<string | null>{
    try {
      const docRef = await addDoc(collection(this.firestoreDb, environment.collectionChat ),  chat );
      return docRef.id;
    } catch (e) {
      return null;
    }
  }

  async verifyExistChat(receiveID: string, senderID: string): Promise<ChatInfo | null>{
    let chat!: ChatInfo;
    try {
      const chatRef = collection(this.firestoreDb, environment.collectionChat );
      const q1 = query(chatRef, where( "idsUsers", "array-contains-any", [ senderID ] ));
      const querySnapshot = await getDocs(q1);

      querySnapshot.forEach((doc) => {
        const temp = doc.data() as ChatInfo;
        if( temp.idsUsers.includes( receiveID ) ){
          chat = doc.data() as ChatInfo;
          chat.id = doc.id;
        }
      });

      console.log("🚀 ~ verifyExistChat ~ chat:", chat);

      return chat;
    } catch (error) {
      return null;
    }
  }

  async sendChatMessage( msg: MessageChat, idChat: string ){
    try {
      // const docRef = await addDoc(collection(this.firestoreDb, `chats/${idChat}`),  msg );
      const encryptMsg = await this.encryptUsingAES256(msg.message);
      msg.message = encryptMsg;
      const dataRef = doc(this.firestoreDb, `${environment.collectionChat}/${idChat}`);
      return updateDoc(dataRef, {
        deletedBy: [],
        messages: arrayUnion(msg)
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      return null;
    }
  }

  async getChatList( userLoggedId: string ): Promise<ChatInfo[]>{
    let chatList: ChatInfo[] = [];
    try {
      const chatRef = collection(this.firestoreDb, environment.collectionChat);
      const q1 = query(chatRef, where("idsUsers", "array-contains", userLoggedId));
      const querySnapshot = await getDocs(q1);
      querySnapshot.forEach((doc) => {
        const chat = doc.data() as ChatInfo;
        chatList.push({
          id: doc.id,
          ...chat
        });
      });
      return chatList;
    } catch (error) {
      return chatList;
    }
  }

  async haveNewMessages( idChat: string , idSender:string){
    try {
      const dataRef = doc(this.firestoreDb, `${environment.collectionChat}/${idChat}`);
      return updateDoc(dataRef, {
        newMsgFrom: idSender
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      return null;
    }
  }

  async setNewMessage( idChat: string , isNew: boolean){
    try {
      const dataRef = doc(this.firestoreDb, `${environment.collectionChat}/${idChat}`);
      return updateDoc(dataRef, {
        new_message: isNew
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      return null;
    }
  }

  async observableChat( loggerUserId: string ){

    const queryObs =  query(collection(this.firestoreDb, environment.collectionChat), where("idsUsers", "array-contains", loggerUserId));

    this.eventListenMessages = onSnapshot(queryObs, (snapshot) => {
      snapshot.docChanges().forEach((change) => {

        if(change.type == 'added'){
          console.log("🚀 ~ snapshot.docChanges ~ added:", change.doc.id)
          const updateChat = change.doc.data() as ChatInfo;
          this.eventNewChat.next({
            id: change.doc.id,
            ...updateChat
          });
        }

        if(change.type == 'modified'){
          const updateChat = change.doc.data() as ChatInfo;
          console.log("🚀 ~ snapshot.docChanges ~ modified:", updateChat)

          const lastMessage = updateChat.messages[updateChat.messages.length - 1];
          const senderUser = lastMessage.sendUserId;

          if(parseInt(updateChat.newMsgFrom) !== parseInt(loggerUserId)){
            this.eventNewMessage.next({
              id: change.doc.id,
              ...updateChat
            });
            this.userService.evntReduceNotification.next({isReduce: false, total: this.userService.unreadNotifications + 1})
            this.eventNotificationMsg.next(true);
          }
          const isAdded = this.listChats.filter(chat => chat.id == change.doc.id);

          if(isAdded.length == 0){
            this.listChats.push({
              id: change.doc.id,
              ...updateChat
            });
            this.eventNewChat.next({
              id: change.doc.id,
              ...updateChat
            });
          }
        }
      });
    });
  }

  ///*******************  ENCRYP FUNCTIONS  *************
  async encryptUsingAES256(msg:string){
    let _key = CryptoJS.enc.Utf8.parse(environment.keyEncrypt);
    let _iv = CryptoJS.enc.Utf8.parse(environment.keyEncrypt);

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(msg), _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  decryptUsingAES256( msgEncrypted: string){
    let _key = CryptoJS.enc.Utf8.parse(environment.keyEncrypt);
    let _iv = CryptoJS.enc.Utf8.parse(environment.keyEncrypt);

    const decrypted = CryptoJS.AES.decrypt(
      msgEncrypted, _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);

    return decrypted.slice(1, -1);
  }
}
