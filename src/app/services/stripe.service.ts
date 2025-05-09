import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { loadStripe } from '@stripe/stripe-js';
import { lastValueFrom } from 'rxjs';
import { CAPTURE_PAYMENT_INTENT, STRIPE_CREATED_CUSTOM, STRIPE_REQUEST } from '../GraphQL/stripe';
import { Apollo } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  urlBase: string = environment.apiURL;
  private stripePromise = loadStripe('pk_test_51PHPE5F9Y2n1k461KkVAhIE5w8Viffz70W40ULACvwbdAVvxrEZT1s6zmeaIkuoowmCrLAsaY1zSCp5SVo0Cox3U00SmcB7kVe');

  constructor(
    private apollo: Apollo
  ) { }

  async paymentIntent(amount: number, currency: string, customerName: string, customerEmail: string, user: string) {
    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: STRIPE_REQUEST,
        variables: {
          amount,
          currency,
          customerName,
          customerEmail,
          user
        },
        errorPolicy: 'all'
      })
    );

    if (response.errors) {
      throw response.errors[0];
    }

    return response.data.createPaymentIntent.clientSecret;
  }

  async getStripe() {
    return this.stripePromise;
  }

  async validationStripe(
    email: string,
    account_number: string,
    account_holder_name: string,
    first_name: string,
    last_name: string,
    phone: string,
    day: string,
    month: string,
    year: string,
    line1: string,
    city: string,
    postal_code: string,
    state: string,
    country: string,
    action: string
  ) {
    try {
      const response: any = await lastValueFrom(
        this.apollo.mutate({
          mutation: STRIPE_CREATED_CUSTOM,
          variables: {
            email,
            account_number,
            account_holder_name,
            first_name,
            last_name,
            phone,
            day,
            month,
            year,
            line1,
            city,
            postal_code,
            state,
            country,
            action
          },
          errorPolicy: 'all'
        })
      );
      if (response.errors) {
        throw response.errors[0];
      }
      if (!response.data) {
        throw new Error('No se recibieron datos de la respuesta');
      }

      return response.data;
      
    } catch (error: any) {
      if (error.message?.includes('Error creando la cuenta de Stripe:')) {
        throw error;
      } else {
        throw new Error(`Error en la validación de Stripe: ${error.message}`);
      }
    }
  }

  async capturePaymentIntent(paymentIntentId: string) {
    const response: any = await lastValueFrom(
      this.apollo.mutate({
        mutation: CAPTURE_PAYMENT_INTENT,
        variables: {
          paymentIntentId,
        },
        errorPolicy: 'all'
      })
    );

    if (response.errors) {
      throw response.errors[0];
    }

    return response.data;
  }
}