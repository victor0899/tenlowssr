import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';
import { AUTHORIZE_PAYMENT, CONFIRM_AUTHORIZE_PAYMENT, GET_CHARGES_USER, GET_PAYMENTS_USER, GET_PAYMENT_METHODS, REGISTER_BANK_ACCOUNT, SET_PAYMENT } from '../GraphQL/payments';
import { HttpClient } from '@angular/common/http';
import { AuthorizePaymentParams, BankAccountData, ParamSetPayment } from '../interfaces/payments';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(
    private apollo: Apollo,
    private http: HttpClient
  ) { }

  async getPaymentsUser(page:number){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_PAYMENTS_USER,
        variables: {
          page
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async getChargesUser(page:number){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_CHARGES_USER,
        variables: {
          page
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async sendRedsysPetition(payload: any){
    const { DS_MERCHANT_IDOPER, DS_MERCHANT_ORDER } = payload;

    const response:any = await lastValueFrom(
      this.http.post('https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST', payload)
    );

    return response;
  }

  async getPaymentMethods(){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_PAYMENT_METHODS,
        variables: {
          lang: 'es'
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async setPaymentOperation( payload:ParamSetPayment){

    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SET_PAYMENT,
        variables:payload,
        errorPolicy: 'all'
      })
    );

    return response;
  }

  /**
   * Asynchronously authorizes a payment using the given payload.
   *
   * @param {AuthorizePaymentParams} payload - the payload containing the payment authorization information
   * @return {Promise<any>} a Promise that resolves with the response from the payment authorization server
   */
  async authorizePayment( payload:AuthorizePaymentParams  ): Promise<any> {
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: AUTHORIZE_PAYMENT,
        variables: payload,
      })
    );

    return response;
  }

  /**
   * Asynchronously confirms authorization payment with provided payload.
   *
   * @param {AuthorizePaymentParams} payload - Parameters required to authorize payment.
   * @return {Promise<any>} Returns a Promise that resolves to the response from the confirmation of the authorize payment.
   */
  async confirmAuthorizationPayment( payload:AuthorizePaymentParams ): Promise<any> {
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: CONFIRM_AUTHORIZE_PAYMENT,
        variables: payload,
      })
    );

    return response;
  }

  async registerAccountBank( payload: BankAccountData ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: REGISTER_BANK_ACCOUNT,
        variables: payload
      })
    );

    return response;
  }
}
