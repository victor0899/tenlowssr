import { gql } from "apollo-angular";

export const STRIPE_REQUEST = gql`
  mutation createPaymentIntent(
    $amount: Int!, 
    $currency: String, 
    $customerName: String, 
    $customerEmail: String
    $user: String) {
    createPaymentIntent(
      amount: $amount, 
      currency: $currency, 
      customerName: $customerName, 
      customerEmail: $customerEmail,
      user: $user
       ) {
      clientSecret
    }
  }
`;

export const STRIPE_CREATED_CUSTOM = gql`
  mutation createStripe(
    $email: String,
    $account_number: String,
    $account_holder_name: String,
    $first_name: String,
    $last_name: String,
    $phone: String,
    $day: String,
    $month: String,
    $year: String,
    $line1: String,
    $city: String,
    $postal_code: String,
    $state: String,
    $country: String,
    $action: String
    ) {
    createStripe(
      email: $email,
      account_number: $account_number,
      account_holder_name: $account_holder_name,
      first_name: $first_name,
      last_name: $last_name,
      phone: $phone,
      day: $day,
      month: $month,
      year: $year,
      line1: $line1,
      city: $city,
      postal_code: $postal_code,
      state: $state,
      country: $country,
      action: $action
      ) {
      id
    }
  }
`;

export const CAPTURE_PAYMENT_INTENT = gql`
  mutation capturePaymentIntent($paymentIntentId: String!) {
    capturePaymentIntent(paymentIntentId: $paymentIntentId) {
      success
      status
    }
  }
`;