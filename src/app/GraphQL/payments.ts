import { gql } from "apollo-angular";
import { OPERATION_DATA, USER_DATA } from "./user";
import { PAGINATOR_INFO, PRODUCT_DATA } from "./store";

export const PAYMENT_DATA = gql`
    fragment PAYMENT_DATA on Payment {
        id,
        user_id,
        payment_method_id,
        status,
        amount,
        shipping_method,
        order_id,
        created_at,
        user{
            ...USER_DATA
        }
        paymentMethod{
            id,
            name,
            description
        },
        operation{
            ...OPERATION_DATA
        }
    }
    ${USER_DATA}
    ${OPERATION_DATA}
`;

export const CHARGES_DATA = gql`
    fragment CHARGES_DATA on Charge {
        id,
        paying_user_id,
        charge_user_id,
        amount,
        product_id,
        status,
        product{
            ...PRODUCT_DATA
        }
        charge{
            ...USER_DATA
        }
        paying{
            ...USER_DATA
        },
        operation{
            ...OPERATION_DATA
        }
    }
    ${USER_DATA}
    ${PRODUCT_DATA}
    ${OPERATION_DATA}
`;

export const GET_PAYMENTS_USER = gql`
    query getPayments($page:Int!){
        payments(
            first:10
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                ...PAYMENT_DATA
            }
        }
    }
    ${PAGINATOR_INFO}
    ${PAYMENT_DATA}
`;

export const GET_CHARGES_USER = gql`
    query getCharges($page:Int!){
        charges(
            first: 10
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                ...CHARGES_DATA
            }

        }
    }
    ${PAGINATOR_INFO}
    ${CHARGES_DATA}
`;

export const SET_PAYMENT = gql`
    mutation registerPayment(
            $transaction_id: String!,
            $operation_id: ID!,
            $order_id: String!
            $payment_method_id: ID!,
            $amount: Float!,
        ) {
        registerPayment(
            transaction_id: $transaction_id,
            operation_id: $operation_id,
            payment_method_id: $payment_method_id,
            amount: $amount,
            order_id: $order_id
        ){
            id,
            user_id,
            payment_method_id,
            status,
            order_id,
            amount,
        }
    }
`;

export const GET_PAYMENT_METHODS = gql`
    query paymentMethods( $lang: String ){
        paymentMethods(
            lang: $lang
        ) {
            id,
            name,
            description
        }
    }
`;

export const AUTHORIZE_PAYMENT = gql`
    mutation authorizationPayment(
        $amount: Float!
        $id_operation: String!,
        $order_id: String!,
        $operation_id: ID!
    ){
        authorizationPayment(
            amount: $amount,
            id_operation: $id_operation,
            order_id: $order_id,
            operation_id: $operation_id
        )
    }
`;

export const CONFIRM_AUTHORIZE_PAYMENT = gql`
    mutation confirmAuthorizationPayment(
        $amount: Float!
        $id_operation: String!,
        $order_id: String!,
        $operation_id: ID!
    ){
        confirmAuthorizationPayment(
            amount: $amount,
            id_operation: $id_operation,
            order_id: $order_id
            operation_id: $operation_id
        )
    }
`;


export const REGISTER_BANK_ACCOUNT =  gql`
    mutation updateAccountBank(
        $iban: String!
        $address: String!
        $zip_code: String!
        $name: String!
        $country: String!
    ){
        updateAccountBank(
            iban: $iban,
            address: $address,
            zip_code: $zip_code,
            name: $name,
            country: $country
        )
    }
`;