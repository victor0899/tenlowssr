import { gql } from "apollo-angular";
import { PRODUCT_DATA } from "./store";
import { PAGINATOR_INFO } from "./store";

export const CREATE_PRODUCT = gql`
    mutation createProduct(
        $title: String!,
        $category_id: ID,
        $subcategory_id: ID,
        $description: String!,
        $condition: ProductConditions!,
        $daily_price: Float,
        $weekly_price: Float,
        $monthly_price: Float,
        $daily_minimum_rental_time: Int,
        $weekly_minimum_rental_time: Int,
        $monthly_minimum_rental_time: Int,
        $daily_maximum_rental_time: Int,
        $weekly_maximum_rental_time: Int,
        $monthly_maximum_rental_time: Int,
        $rent_with_option_to_buy: Boolean,
        $sale_price: Float,
        $country: ID,
        $state: ID,
        $zip_code: String,
        $address: String,
        $daily_minimum_rental_time_to_buy: Int,
        $weekly_minimum_rental_time_to_buy: Int,
        $monthly_minimum_rental_time_to_buy: Int,
        $latitud: Float,
        $longitud: Float,
        $displacement_range: Int
    ){
        createProduct(
            title: $title,
            category_id: $category_id,
            subcategory_id: $subcategory_id,
            description: $description,
            condition: $condition,
            daily_price: $daily_price,
            weekly_price: $weekly_price,
            monthly_price: $monthly_price,
            daily_minimum_rental_time: $daily_minimum_rental_time,
            weekly_minimum_rental_time: $weekly_minimum_rental_time,
            monthly_minimum_rental_time: $monthly_minimum_rental_time,
            daily_maximum_rental_time: $daily_maximum_rental_time,
            weekly_maximum_rental_time: $weekly_maximum_rental_time,
            monthly_maximum_rental_time: $monthly_maximum_rental_time,
            rent_with_option_to_buy: $rent_with_option_to_buy,
            sale_price: $sale_price,
            country_id: $country,
            state_id: $state,
            zip_code: $zip_code,
            address: $address,
            latitude: $latitud,
            longitude: $longitud,
            displacement_range:$displacement_range,
            daily_minimum_rental_time_to_buy: $daily_minimum_rental_time_to_buy,
            weekly_minimum_rental_time_to_buy: $weekly_minimum_rental_time_to_buy,
            monthly_minimum_rental_time_to_buy: $monthly_minimum_rental_time_to_buy
        ){
            ...PRODUCT_DATA
        }
    }
    ${PRODUCT_DATA}
`;

export const UPLOAD_IMAGES_PROD = gql`
    mutation uploadImagesProduct(
        $files: [Upload!]!
        $product_id: ID!
    ){
        uploadImagesProduct(
            files: $files,
            product_id: $product_id
        )
    }
`;


export const GET_DETAIL_PRODUCT = gql`
    query getProduct($idProduct: Int!){
        getProduct(
            id: $idProduct
        ){
            ...PRODUCT_DATA
        }
    }
    ${PRODUCT_DATA}
`;

export const GET_USER_PRODUCTS = gql`
    query getUserProducts(
        $user_id: ID!,
        $page: Int
    ){
        productsByUser(
            user_id: $user_id
            first: 15
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                ...PRODUCT_DATA
            }
        }
    }
    ${PAGINATOR_INFO}
    ${PRODUCT_DATA}
`;

export const GET_USER_DELETED_PRODUCTS = gql`
    query getDeleteProducts(
        $page: Int
    ){
        getDeleteProducts(
            first: 15
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                ...PRODUCT_DATA
            }
        }
    }
    ${PAGINATOR_INFO}
    ${PRODUCT_DATA}
`;

export const UPDATE_PRODUCT = gql`
    mutation updateProduct(
        $product_id: ID!
        $title: String!,
        $category_id: ID,
        $subcategory_id: ID,
        $description: String!,
        $condition: ProductConditions!,
        $status: ProductStatus!
        $daily_price: Float,
        $weekly_price: Float,
        $monthly_price: Float,
        $daily_minimum_rental_time: Int,
        $weekly_minimum_rental_time: Int,
        $monthly_minimum_rental_time: Int,
        $daily_maximum_rental_time: Int,
        $weekly_maximum_rental_time: Int,
        $monthly_maximum_rental_time: Int,
        $rent_with_option_to_buy: Boolean,
        $sale_price: Float,
        $country: String,
        $state: String,
        $zip_code: String,
        $address: String,
        $daily_minimum_rental_time_to_buy: Int,
        $weekly_minimum_rental_time_to_buy: Int,
        $monthly_minimum_rental_time_to_buy: Int,
        $latitud: Float,
        $longitud: Float,
        $displacement_range: Int
    ){
        updateProduct(
            product_id: $product_id,
            title: $title,
            category_id: $category_id,
            subcategory_id: $subcategory_id,
            description: $description,
            condition: $condition,
            status: $status,
            daily_price: $daily_price,
            weekly_price: $weekly_price,
            monthly_price: $monthly_price,
            daily_minimum_rental_time: $daily_minimum_rental_time,
            weekly_minimum_rental_time: $weekly_minimum_rental_time,
            monthly_minimum_rental_time: $monthly_minimum_rental_time,
            daily_maximum_rental_time: $daily_maximum_rental_time,
            weekly_maximum_rental_time: $weekly_maximum_rental_time,
            monthly_maximum_rental_time: $monthly_maximum_rental_time,
            rent_with_option_to_buy: $rent_with_option_to_buy,
            sale_price: $sale_price,
            country: $country,
            state: $state,
            zip_code: $zip_code,
            address: $address,
            latitude: $latitud,
            longitude: $longitud,
            displacement_range:$displacement_range,
            daily_minimum_rental_time_to_buy: $daily_minimum_rental_time_to_buy,
            weekly_minimum_rental_time_to_buy: $weekly_minimum_rental_time_to_buy,
            monthly_minimum_rental_time_to_buy: $monthly_minimum_rental_time_to_buy
        ){
            ...PRODUCT_DATA
        }
    }
    ${PRODUCT_DATA}
`;

export const DELETE_PRODUCT = gql`
    mutation deleteProdust($product_id: ID!){
        deleteProduct(
            product_id: $product_id
        )
    }
`;

export const TOGGLE_ACTIVATE_PRODUCT = gql`
    mutation activateProduct($product_id: ID!, $activate:Boolean!){
        activateProduct(
            product_id: $product_id,
            activate:  $activate
        )
    }
`;

export const DELETE_IMAGE_PRODUCT = gql`
    mutation deleteImageProduct( $image_id: ID! ){
        deleteImageProduct(
            image_id: $image_id
        )
    }
`;

export const RESTORE_PRODUCT = gql`
    mutation restoreProduct($product_id: ID!){
        restoreProduct(
            product_id: $product_id
        )
    }
`;

export const SET_FAVORITE_PRODUCT = gql`
    mutation favoriteProduct( $id: ID! ){
        favoriteProduct(
            product_id: $id
        )
    }
`;

export const REMOVE_FAVORITE_PRODUCT = gql`
    mutation notFavoriteProduct( $id: ID! ){
        notFavoriteProduct(
            product_id: $id
        )
    }
`;

export const GET_SUGGEST_PRODUCTS = gql`
    query getUserProducts(
        $user_id: ID!
    ){
        productsByUser(
            user_id: $user_id
            first: 6
            page: 1
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            },
            data{
                ...PRODUCT_DATA
            }
        }
    }
    ${PAGINATOR_INFO}
    ${PRODUCT_DATA}
`;