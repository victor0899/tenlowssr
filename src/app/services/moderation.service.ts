import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";;
import { Subject, lastValueFrom } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Apollo } from 'apollo-angular';
import { BLOCKED_USER, GET_BLOCKED_LIST, REPORT_USER } from '../GraphQL/moderation';
import { ReasonReport } from '../interfaces/moderation';

@Injectable({
  providedIn: 'root'
})
export class ModerationService {

  /**
   * @description Emit user id blocked
   */
  eventBlockUser = new Subject<string>();

  constructor(
    private apollo: Apollo,
    private firebase: FirebaseService
  ) { }

   ///*******************  GRAPHQL MODERATION FUNCTIONS  *************

  async reportUser(userReported: string, reason:ReasonReport, comment: string){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: REPORT_USER,
        variables:{
          reported_user_id: parseInt(userReported),
          reason,
          comment
        }
      })
    );

    return response;
  }

  async blockedUser(userBlocked: string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: BLOCKED_USER,
        variables: {
          blocked_user_id: userBlocked
        }
      })
    );
    return response;
  }

  async getBlockedUsers(){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_BLOCKED_LIST
      })
    );
    return response;
  }

   ///*******************  FIREBASE MODERATION FUNCTIONS  *************

  async blockedChat(idChat:string,idBlocked:string){
    try {
      const dataRef = doc(this.firebase.firestoreDb, `${environment.collectionChat}/${idChat}`);
      await updateDoc(dataRef, {
        blockedUser: arrayUnion(idBlocked)
      });
      return true;
    } catch (e) {
      console.error("Error adding document: ", e);
      return null;
    }
  }

  unblockedChat(idChat:string,idBlocked:string){
    try {
      const dataRef = doc(this.firebase.firestoreDb, `${environment.collectionChat}/${idChat}`);
      return updateDoc(dataRef, {
        blockedUser: arrayRemove(idBlocked)
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      return null;
    }
  }

  reportedChat(idChat:string,idUserReport:string){
    try {
      const dataRef = doc(this.firebase.firestoreDb, `${environment.collectionChat}/${idChat}`);
      return updateDoc(dataRef, {
        reportedUser: arrayUnion(idUserReport)
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      return null;
    }
  }
}
