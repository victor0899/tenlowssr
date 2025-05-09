import { gql } from "apollo-angular";
import { OPERATION_DATA } from "./user";

export const ACCEPT_RENTAL_REQUEST = gql`
    mutation confirmedOperation(
        $operation_id: ID!
    ){
        confirmedOperation(
            operation_id: $operation_id
        )
    }
`;

export const REJECT_RENTAL_REQUEST = gql`
    mutation cancelOperation(
        $operation_id: ID!
    ){
        cancelOperation(
            operation_id: $operation_id
        )
    }
`;

export const SET_IN_PERSON_RENTAL_ADDRESS = gql`
    mutation setShippingAddress(
        $operation_id: ID!
        $shipping_address: String!
        $suggestion_hours: [String]!
    ){
        setShippingAddress(
            operation_id: $operation_id,
            shipping_address: $shipping_address,
            suggestion_hours: $suggestion_hours
        )
    }
`;

export const GET_OFFICES_SHIPPING = gql`
    query getOffices( $zip_code: String! ){
        getOffices(
            zip_code: $zip_code
        )
    }
`;

export const TOGGLE_ACCEPT_ADDRESS = gql`
    mutation acceptShippingAddress(
        $operation_id: ID!
        $accepted: Boolean!
        $shipping_hour: Time
    ){
        acceptShippingAddress(
            operation_id: $operation_id
            accepted: $accepted,
            shipping_hour: $shipping_hour
        )
    }
`;

export const SEND_NOTIFICATION_DELIVERED_PRODUCT = gql`
    mutation sendNotificationDelivery($operation_id: ID!){
        sendNotificationReturnProduct(
            operation_id: $operation_id
        )
    }
`;

export const SEND_NOTIFICATION_RECEIVE_PRODUCT = gql`
    mutation sendNotificationReceptionProduct($operation_id: ID!){
        sendNotificationReceptionProduct(
            operation_id: $operation_id
        )
    }
`;

export const UPDATE_OPERATION_STATUS = gql`
    mutation updateStatusOperation($operation_id: ID!, $status: OperationStatus!){
        updateStatusOperation(
            status: $status,
            operation_id: $operation_id
        ){
            ...OPERATION_DATA
        }
    }
    ${OPERATION_DATA}
`;