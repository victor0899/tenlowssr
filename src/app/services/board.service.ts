import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';
import * as board from '../GraphQL/board';
import { CreateRequestBoardPayload } from '../interfaces/board';
import { ResponseRequestBoardStatus } from '../interfaces/board';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(
    private apollo: Apollo
  ) { }

  async getRequestBoard(page:number){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query:board.GET_REQUEST_BOARD,
        variables: {
          page
        }
      })
    );

    return response;
  }

  async createRequestBoard( payload:CreateRequestBoardPayload ){
    const { description,need,province,zip_code } = payload;
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: board.CREATE_REQUEST_BOARD,
        variables:{
          description,
          need,
          province,
          zip_code
        }
      })
    );
    return response;
  }

  async getMyBoardRequest(){

    const response:any = lastValueFrom(
      this.apollo.query({
        query: board.GET_MY_BOARD_RQUESTS
      })
    );

    return response;
  }

  async responseBoardProduct( request_board_id: string,  product_id: string,){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: board.RESPONSE_PRODUCT_IN_BOARD,
        variables: {
          request_board_id,
          product_id,
        },
        errorPolicy: 'all'
      })
    );

    return response;
  }

  async deleteRequest( idBoard: string ){
    const response:any = lastValueFrom(
      this.apollo.mutate({
        mutation: board.DELETE_REQUEST,
        variables:{
          id: idBoard
        },
        errorPolicy: 'all'
      })
    );

    return response;
  }


  async getAnswersBoard( page:number){

    const response:any = lastValueFrom(
      this.apollo.query({
        query: board.GET_MY_ANSWERS_BOARD,
        variables: {
          page
        }
      })
    );

    return response;
  }

  async setProductSolved( response_id: string ){
    const response:any = lastValueFrom(
      this.apollo.mutate({
        mutation: board.SET_STATUS_RESPONSE_BOARD,
        variables:{
          response_id,
          status: ResponseRequestBoardStatus.solved
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async setProductUnsolved( response_id: string ){
    const response:any = lastValueFrom(
      this.apollo.mutate({
        mutation: board.SET_STATUS_RESPONSE_BOARD,
        variables:{
          response_id,
          status: ResponseRequestBoardStatus.unsolved
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }
}
