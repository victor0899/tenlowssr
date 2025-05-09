import { OperationStatus } from './rental';
import { ProductInfo } from './store';
import { User, UserElement } from './user';

export type StatusCharge =
  | 'created'
  | 'pending'
  | 'complete'
  | 'canceled'
  | 'refused';
export type StatusPayment = 'pending' | 'complete' | 'canceled' | 'refused';

export interface Payments {
  id: string;
  user_id: string;
  payment_method_id: string;
  product_id: string;
  order_id: string;
  status: StatusPayment;
  amount: number;
  shipping_method: string;
  user: User;
  created_at: Date;
  paymentMethod: PaymentMethod;
  operation: OperationInfo;
  __typename: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: null;
}

export interface UserInfo {
  name: string;
  email: string;
  id: any
}

export type ViewsPayments =
  | 'PAYMENT_METHOD'
  | 'MY_PAYMENTS'
  | 'MY_CHARGES'
  | 'BANK_DATA';

export interface ViewsPaymentsInfo {
  title: string;
  view: ViewsPayments;
  subtitle: string;
}

export interface ChargeData {
  id: string;
  paying_user_id: string;
  charge_user_id: string;
  amount: number;
  product_id: string;
  status: StatusCharge;
  operation: OperationInfo;
  product: ProductInfo;
  charge: User;
  paying: User;
  __typename: string;
}

export interface ShhipingInfo {
  method: string;
  cost: number;
  label: string;
  address?: string;
}

export interface PARAMS_REDSYS {
  DS_MERCHANT_IDOPER: string;
  DS_MERCHANT_ORDER: string;
}

export interface OperationPayment {
  id: string;
  payment_method_id: string;
  status: string;
  amount: number;
  shipping_method: string;
  order_id: string;
  transaction_id: string;
}

export interface OperationInfo {
  id: string;
  user: UserElement;
  amount: number;
  product: ProductInfo;
  status: OperationStatus;
  payment: OperationPayment;
  type: string;
  init_date: Date;
  end_date: Date;
  shipping_method: string;
  shipping_address: string;
  suggestion_hours: any;
  accepted_shipping_address: boolean | null;
  shipping_hour: string;
  __typename: string;
}

export enum OperationShippingMethod {
  in_person = 'in_person',
  my_address = 'my_address',
  delivery_address = 'delivery_address',
}

export interface AuthorizePaymentParams {
  amount: number;
  id_operation?: string;
  order_id: string;
  operation_id: string;
  transaction_id?: string; 
}

export interface ParamSetPayment {
  transaction_id: string;
  operation_id: string;
  payment_method_id: string;
  amount: number;
  order_id: string;
}

export interface BankAccountData {
  iban: string;
  address: string;
  zip_code: string;
  name: string;
  country: string;
}


export enum TypeConfirmRental { delivered='delivered', received= 'received' };