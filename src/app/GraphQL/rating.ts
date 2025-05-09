import { gql } from "apollo-angular";

export const RATING_PRODUCT = gql`
    mutation setCalificationProduct(
        $product_id: ID!
        $comment: String!
        $rating: Int!
    ){
        setCalificationProduct(
            product_id: $product_id,
            comment: $comment,
            rating: $rating
        )
    }
`;

export const RATING_OWNER_PRODUCT = gql`
    mutation setCalificationOwner(
        $owner_user_id: ID!
        $comment: String!
        $rating: Int!
    ){
        setCalificationOwner(
            owner_user_id: $owner_user_id,
            comment: $comment,
            rating: $rating
        )
    }
`;

export const SEND_TENLOW_EXPERIENCE = gql`
    mutation setCalificationOwner(
        $comment: String!
    ){
        setExperience(
            comment: $comment
        )
    }
`;