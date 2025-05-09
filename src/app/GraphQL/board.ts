import { gql } from "apollo-angular";
import { PAGINATOR_INFO } from "./store";
import { USER_DATA } from "./user";


export const RESPONSE_REQ_BOARD = gql`
    fragment RESPONSE_REQ_BOARD on ResponseRequestBoard {
        id,
        product_id,
        product{
            id,
            title,
            images{
                id,
                name,
                path
            }
        },
        user_id,
        request_board_id,
        status,
        user{
            id,
            name,
            last_name,
            email,
            profile_photo_path
        }
        request{
            id,
            need,
            status,
            description,
            zip_code,
            province,
            locatario_user_id,
            product_id,
            locator_user_id,
            created_at,
            locatario{
                id,
                name,
                email,
                last_name,
                profile_photo_path
            }
        }
    }
`;

export const BOARD_DATA = gql`
    fragment BOARD_DATA on RequestBoard {
        id,
        need,
        status,
        description,
        zip_code,
        province,
        locatario_user_id,
        product_id,
        locator_user_id,
        created_at,
        locator{
            ...USER_DATA
        },
        locatario{
            ...USER_DATA
        },
        responses{
            ...RESPONSE_REQ_BOARD
        }
    }
    ${USER_DATA}
    ${RESPONSE_REQ_BOARD}
`;

export const GET_REQUEST_BOARD = gql`
    query getRequestBoard($page: Int){
        requestsBoard(
            first: 15,
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                ...BOARD_DATA
            }
        }
    }
    ${PAGINATOR_INFO}
    ${BOARD_DATA}
`;

export const CREATE_REQUEST_BOARD = gql`
    mutation createRequestBoard(
        $need: String!,
        $description: String!,
        $zip_code: String!,
        $province: String!
    ){
        createRequestBoard(
            need: $need,
            description: $description,
            zip_code: $zip_code,
            province: $province
        ){
            ...BOARD_DATA
        }
    }
    ${BOARD_DATA}
`;

export const GET_MY_BOARD_RQUESTS = gql`
    query getMyBoard{
        getUserRequestBoard{
            ...BOARD_DATA
        }
    }
    ${BOARD_DATA}
`;


export const RESPONSE_PRODUCT_IN_BOARD = gql`
    mutation createResponseRequestBoard(
        $request_board_id: ID!,
        $product_id: ID!
    ) {
        createResponseRequestBoard(
            request_board_id: $request_board_id,
            product_id: $product_id
        ){
            ...RESPONSE_REQ_BOARD
        }
    }
    ${RESPONSE_REQ_BOARD}
`;


export const GET_MY_ANSWERS_BOARD = gql`
    query getSendResponseRequestBoard($page: Int){
        getSendResponseRequestBoard(
            first: 15,
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                ...RESPONSE_REQ_BOARD
            }
        }
    }
    ${PAGINATOR_INFO}
    ${RESPONSE_REQ_BOARD}
`;

export const DELETE_REQUEST = gql`
    mutation deleteRequest($id: ID!){
        deleteRequestBoard(
            id: $id
        )
    }
`;

export const SET_STATUS_RESPONSE_BOARD = gql`
    mutation setProductSolvedBoard(
        $response_id: ID!
        $status: ResponseRequestBoardStatus!
    ){
        changeStatusResponseRequestBoard(
            response_id: $response_id,
            status: $status
        )
    }
`;