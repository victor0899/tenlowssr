import { gql } from "apollo-angular";


export const REPORT_DATA = gql`
    fragment REPORT_DATA on Report {
        id,
        reported_user_id,
        reporting_user_id,
        status,
        reason,
        comment,
        reporting{
            id,
            name,
            last_name,
            email,
            profile_photo_path
        },
        reported{
            id,
            name,
            last_name,
            email,
            profile_photo_path
        }
    }

`;

export const REPORT_USER = gql`
    mutation createReport(
        $reported_user_id: Int!,
        $reason: ReasonType!,
        $comment: String
    ){
        createReport(
            reported_user_id: $reported_user_id,
            reason: $reason,
            comment: $comment
        ){
            ...REPORT_DATA
        }
    }
    ${REPORT_DATA}
`;

export const BLOCKED_USER = gql`
    mutation blockUser(
        $blocked_user_id: ID!
    ){
        createBlockage(
            blocked_user_id: $blocked_user_id
        ){
            id,
            blocking_user_id,
            blocked_user_id,
            blocking {
                id,
                name,
                last_name,
                email,
                profile_photo_path
            },
            blocked {
                id,
                name,
                last_name,
                email,
                profile_photo_path
            }
        }
    }
`;


export const GET_BLOCKED_LIST = gql`
    query {
        getBlockeds{
            id,
            blocking_user_id,
            blocked_user_id,
            blocking{
                id,
                name,
                last_name
            },
            blocked{
                id,
                name,
                last_name
            }
        }
    }
`;