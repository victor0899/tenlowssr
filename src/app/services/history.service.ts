import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';
import { HISTORY_OPERATIONS } from '../GraphQL/history';
import { OPERATIONS_TYPE } from '../interfaces/history';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(
    private apollo:Apollo
  ) { }

  async getHistoryOperations(page:number, query: OPERATIONS_TYPE){

    const response:any = await lastValueFrom(
      this.apollo.query({
        query: HISTORY_OPERATIONS,
        variables: {
          page,
          query
        },
        errorPolicy: 'all'
      })
    );

    return response;
  }
}
