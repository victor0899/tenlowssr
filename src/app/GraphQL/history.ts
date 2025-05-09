import { gql } from "apollo-angular";
import { PAGINATOR_INFO, PRODUCT_DATA } from "./store";
import { USER_DATA } from "./user";

export const HISTORY_OPERATIONS = gql`
    query getHistory( $query: OperationType!, $page: Int ){
        record(
            query: $query
            first: 15
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                id,
                product{
                    ...PRODUCT_DATA
                },
                status,
                amount,
                type,
                init_date,
                end_date,
                user{
                    ...USER_DATA
                },
                shipping_method
            }
        }
    }
    ${PAGINATOR_INFO}
    ${USER_DATA}
    ${PRODUCT_DATA}
`;