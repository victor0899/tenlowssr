import { gql } from "apollo-angular";
import { PAYMENT_DATA } from "./payments";

export const PRODUCT_DATA = gql`
    fragment PRODUCT_DATA on Product {
        id,
        title,
        description,
        slug,
        status,
        condition,
        daily_price,
        weekly_price,
        monthly_price,
        daily_minimum_rental_time,
        weekly_minimum_rental_time,
        monthly_minimum_rental_time,
        daily_maximum_rental_time,
        weekly_maximum_rental_time,
        monthly_maximum_rental_time,
        daily_minimum_rental_time_to_buy,
        weekly_minimum_rental_time_to_buy,
        availability,
        monthly_minimum_rental_time_to_buy,
        rent_with_option_to_buy,
        sale_price,
        favorite_by_auth_user,
        rating,
        califications{
            id,
            created_at,
            comment,
            rating,
            user{
                id,
                name,
                last_name,
                profile_photo_path
            }
        }
        images{
            id,
            name,
            path
        },
        location{
            product_id,
            country_id,
            state_id,
            zip_code,
            delivery_address,
            latitude,
            longitude,
            displacement_range,
            country{
                id,
                name
            },
            state{
                id,
                name
            }
        },
        user{
            id,
            name,
            last_name,
            profile_photo_path,
            email
        }
        categories{
            id,
            name
        }
        subcategories{
            id,
            name
        }
    }
`;

export const PAGINATOR_INFO = gql`
    fragment PAGINATOR_INFO on PaginatorInfo {
        count,
        currentPage,
        firstItem,
        hasMorePages,
        lastItem,
        lastPage,
        perPage,
        total
    }
`;

export const GET_CATEGORIES_STORE = gql`
    query categories($lang: String!){
        categories(
            lang: $lang
        ){
            id,
            name,
            description,
            icon
        }
    }
`;

export const GET_SUBCATEGORIES_STORE = gql`
    query subCategories($lang: String!, $categorieID: ID!){
        subCategories(
            lang: $lang,
            category_id: $categorieID
        ){
            id,
            name,
            description
        }
    }
`;

export const GET_PRODUCTS = gql`
    query getProducts($page:Int!){
        products(
            first:30,
            page:$page
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

export const GET_PRODUCTS_BY_CATEGORY = gql`
    query productsByCategory($idCategory: ID!){
        productsByCategory(
            category_id: $idCategory
        ){
            ...PRODUCT_DATA
        }
    }
    ${PRODUCT_DATA}
`;

export const GET_PRODUCTS_BY_SUBCATEGORY = gql`
    query getProductBySubCategory($idSubcategory: ID!){
        getProductBySubCategory(
            subcategory_id: $idSubcategory
        ){
            ...PRODUCT_DATA
        }
    }
    ${PRODUCT_DATA}
`;

export const SEARCH_PRODUCTS = gql`
    query searchProduct($query: String!){
        searchProduct(
            query: $query
        ){
            ...PRODUCT_DATA
        }
    }
    ${PRODUCT_DATA}
`;

export const CREATE_OPERATION = gql`
    mutation createOperation(
        $user_id: ID!,
        $amount: Float!,
        $product_id: ID!,
        $type: OperationType!,
        $init_date: Date,
        $end_date: Date,
        $shipping_address: String,
        $shipping_method: OperationShippingMethod!,
        $shipping_code: String
    ){
        createOperation(
            user_id: $user_id,
            amount: $amount,
            product_id: $product_id,
            type: $type,
            init_date: $init_date,
            end_date: $end_date,
            shipping_address: $shipping_address,
            shipping_method: $shipping_method,
            shipping_code: $shipping_code
        ){
            id
            amount
            status
            type
            init_date
            end_date
            shipping_method
        }
    }
`;

export const FILTER_PRODUCTS = gql`
    query filterProducts(
        $category_id: ID
        $latitude: Float
        $longitude: Float
        $min_price: Float
        $max_price: Float
        $order_price: String
        $init_date: Date
        $end_date: Date
        $page: Int
    ){
        filterByProduct(
            category_id: $category_id
            latitude: $latitude
            longitude: $longitude
            min_price: $min_price
            max_price: $max_price
            order_price: $order_price
            init_date: $init_date
            end_date: $end_date
            first: 30
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

export const GET_PRICES_TO_FILTER = gql`
    query { getPrices }
`;

export const AUTOCOMPLETE_SEARCH = gql`
    query getAutocomplete($query: String!){
        autocompleteProduct(
            query: $query
        )
    }
`;

export const CANCEL_OPERATION = gql`
    mutation cancelOperation( $idOperation: ID! ){
        cancelOperation(
            operation_id: $idOperation
        )
    }
`;

export const REQUEST_CODE_RENTAL = gql`
    mutation f2ARequest(
        $phone: String!
        $sender: String!
    ) {
        f2ARequest(
            msisdn: $phone
            sender: $sender
        )
    }
`;

export const REQUEST_CODE_EMAIL = gql`
    mutation f2AEmailRequest(
        $email: String!
        $sender: String!
        $code: String!
    ) {
        f2AEmailRequest(
            email: $email
            sender: $sender,
            code: $code
        )
    }
`;


export const VALIDATE_CODE_RENTAL = gql`
    mutation f2AVerify(
        $phone: String!
        $pin: String!
    ) {
        f2AVerify(
            msisdn: $phone
            pin: $pin
        )
    }
`;

export const PREREGISTER_SHIPPING = gql`
    query preRegistration(
        $operation_id: ID!
    ){
        preRegistration(
            operation_id: $operation_id
        )
    }
`;


export const CHECK_PRODUCT_AVAILABILITY = gql`
    query availabilityProduct(
        $init_date: Date!,
        $end_date: Date!,
        $product_id: ID!
    ){
        availabilityProduct(
            init_date: $init_date,
            end_date: $end_date,
            product_id: $product_id
        )
    }
`;

export const DELETE_OPERATION = gql`
    mutation deleteOperation(
        $operation_id: ID!
    ){
        deleteOperation(
            operation_id: $operation_id
        )
    }
`;

export const GET_OPERATION_ID = gql`
    mutation getOperationID(
        $paymentIntent: String!
    ) {
        getOperationID(
            paymentIntent: $paymentIntent
        ) {
            operation {
                id,
                amount,
                shipping_code
            },
            payment {
                id,
                amount,
                status,
                transaction_id
            }
        }
    }
`;

export const GET_PRODUCT_RESERVED_DATES = gql`
    query getProductReservedDates($product_id: ID!) {
        productReservedDates(product_id: $product_id) {
            init_date
            end_date
        }
    }
`;

export const GET_OPERATIONS_BY_PRODUCT_STATUS = gql`
  query GetOperationsByProductAndStatus($productId: ID!, $status: OperationStatus!) {
    operationsByProductAndStatus(productId: $productId, status: $status) {
      id
      amount
      product {
        id
      }
      status
      type
      suggestion_hours
      init_date
      end_date
      shipping_address
      accepted_shipping_address
      shipping_hour
      shipping_method
      payment {
        id
        amount
        status
      }
      shipping_code
    }
  }
`;