import { gql } from 'apollo-angular';
import { PAGINATOR_INFO, PRODUCT_DATA } from './store';

export const USER_DATA = gql`
    fragment USER_DATA on User {
        id,
        name,
        email,
        last_name,
        profile_photo_path,
        created_at,
        updated_at,
        favorite_by_auth_user,
        rating,
        total_charges,
        tree_count,
        plant_tree_percentage,
        rentals,
        stripe_id
        califications{
            id,
            comment,
            rating,
            created_at,
            user{
                id,
                name,
                last_name,
                profile_photo_path
            }
        },
        personal_info{
            id,
            alias,
            dni,
            birthdate,
            gender,
            phone_country_code,
            phone,
            country_id,
            state_id,
            description,
            city_id,
            address,
            zip_code
        }
        favoriteProducts{
            ...PRODUCT_DATA
        },
        favoriteUsers{
            id,
            name,
            email,
            rating,
            last_name
            created_at,
            updated_at,
            view_products{
                id,
                title,
                images{
                    id,
                    name,
                    path
                },
            }
            profile_photo_path,
            personal_info{
                id,
                alias,
                gender,
                description,
            }
        }
    }
    ${PRODUCT_DATA}
`;

export const NOTIFICATIONS_SETTINGS =  gql`
    fragment NOTIFICATIONS_SETTINGS on NotificationSetting {
        user_id,
        expired_products,
        price_change_favorite_products,
        rented_sold_favorites,
        added_your_products_favorites,
        products_published_favorite_profiles,
        promotions_and_news,
        tips_and_suggestions,
        unsubscribe
    }
`;

export const USER_DATA_AUTH = gql`
    fragment USER_DATA_AUTH on User {
        ...USER_DATA,
        login_apple_id,
        email_verified_at,
        api_token,
        type_login,
        login_google_id,
        login_facebook_id,
        notificationSettings {
            ...NOTIFICATIONS_SETTINGS
        },
        bankaccount{
            name,
            iban,
            address,
            zip_code,
            country
        }
    }
    ${USER_DATA}
    ${NOTIFICATIONS_SETTINGS}
`;

export const OPERATION_DATA = gql`
    fragment OPERATION_DATA on Operation {
        id,
        user{
            id,
            name,
            last_name,
            email,
            profile_photo_path
        },
        amount,
        product{
            ...PRODUCT_DATA
        },
        payment{
            id,
            payment_method_id,
            status,
            amount,
            shipping_method,
            order_id,
            transaction_id
        },
        status,
        type,
        init_date,
        end_date,
        shipping_method,
        suggestion_hours,
        shipping_address,
        shipping_hour,
        accepted_shipping_address
    }
    ${PRODUCT_DATA}
`;

export const NOTIFICATION_DATA = gql`
    fragment NOTIFICATION_DATA on Notification {
        id,
        title,
        message,
        user_id,
        user_read_at,
        operation_status,
        created_at,
        type,
        meta,
        operation{
            ...OPERATION_DATA
        }
        user{
            ...USER_DATA
        }
    }
    ${USER_DATA}
    ${OPERATION_DATA}
`;

export const GET_NOTIFICATIONS = gql`
    query getNotifications($page: Int!){
        notifications(
            first: 10,
            page: $page
        ){
            paginatorInfo{
                ...PAGINATOR_INFO
            }
            data{
                ...NOTIFICATION_DATA
            }
        }
    }
    ${PAGINATOR_INFO}
    ${NOTIFICATION_DATA}
`;

export const UPDATE_PROFILE = gql`
    mutation updateProfile(
        $name: String,
        $last_name: String,
        $email: String,
        $alias: String,
        $dni: String,
        $birthdate: Date,
        $gender: String,
        $description: String,
        $phone_country_code: String,
        $phone: String,
        $country_id: ID,
        $state_id: ID,
        $city_id: ID,
        $address: String,
        $zip_code: String
    ){
        updatePersonalInfo(
            name: $name,
            last_name: $last_name,
            email: $email,
            alias: $alias,
            dni: $dni,
            birthdate: $birthdate,
            gender: $gender,
            description: $description,
            phone_country_code: $phone_country_code,
            phone: $phone,
            country_id: $country_id,
            state_id: $state_id,
            city_id: $city_id,
            address: $address,
            zip_code: $zip_code
        ){
            ...USER_DATA
        }
    }
    ${USER_DATA}
`;

export const GET_USER_AUTH = gql`
    query me{
        me{
            ...USER_DATA_AUTH
        }
    }
    ${USER_DATA_AUTH}
`;


export const GET_USER_BY_ID = gql`
    query getUserById($id: ID!){
        user(id: $id){
            ...USER_DATA
        }
    }
    ${USER_DATA}
`;


export const SET_PROFILE_FAVORITE = gql`
    mutation favoriteUser($id: ID!){
        favoriteUser(user_id: $id)
    }
`;

export const REMOVE_PROFILE_FAVORITE = gql`
    mutation notFavoriteUser($id: ID!){
        notFavoriteUser(user_id: $id)
    }
`;

export const UPDATE_PROFILE_IMG = gql`
    mutation changeProfileImg($image: Upload!){
        uploadImageUser(
            file: $image
        )
    }
`;

export const SEND_CODE_CHANGE_EMAIL = gql`
    query ($email: String) {
        getChangeEmail(
            email: $email
        )
    }
`;
export const VERIFY_EMAIL_USER = gql`
    mutation ($code: String) {
        verifyCode(
            code: $code
        )
    }
`;

export const CHANGE_EMAIL = gql`
    mutation changeEmail($code:String!, $email: String!){
        changeEmail(
            code: $code,
            new_email: $email
        )
    }
`;

export const UPDATE_PASSWORD = gql`
    mutation changePassword($oldPassword:String!, $newPassword: String!){
        changePassword(
            current_password: $oldPassword
            password: $newPassword
        )
    }
`;

export const NOTIFICATIONS_SETTINGS_UPDATE = gql`
    mutation updateSettingsNotification(
        $expired_products: Boolean!,
        $price_change_favorite_products: Boolean!,
        $rented_sold_favorites: Boolean!,
        $added_your_products_favorites: Boolean!,
        $products_published_favorite_profiles: Boolean!,
        $promotions_and_news: Boolean!,
        $tips_and_suggestions: Boolean!,
        $unsubscribe: Boolean!
    ){
        setNotificationSettings(
            expired_products: $expired_products,
            price_change_favorite_products: $price_change_favorite_products,
            rented_sold_favorites: $rented_sold_favorites,
            added_your_products_favorites: $added_your_products_favorites,
            products_published_favorite_profiles: $products_published_favorite_profiles,
            promotions_and_news: $promotions_and_news,
            tips_and_suggestions: $tips_and_suggestions,
            unsubscribe: $unsubscribe
        )
    }
`;

export const MARK_READ_NOTIFICATION = gql`
    mutation markReadNotification($id: ID!){
        setNotificationAsRead(
            id: $id
        )
    }
`;


export const GET_UNREAD_NOTIFICATIONS = gql`
    query {
        unreadNotifications{
            id
        }
    }
`;

export const DISABLED_ACCOUNT= gql`
    mutation disableAccount(
        $password: String!
    ){
        disableAccount(
            password: $password
        )
    }
`;

export const DELETE_ACCOUNT= gql`
    mutation deleteAccount(
        $password: String!
    ){
        deleteAccount(
            password: $password
        )
    }
`;

export const REQUEST_CODE_PHONE_CHANGE = gql`
    query {
        getChangePhone
    }
`;

export const CHANGE_PHONE = gql`
    mutation changePhone($phone: String!, $phone_country_code: String!){
        changePhone(
            new_phone: $phone
            phone_country_code: $phone_country_code
        )
    }
`;

export const TREE_NATION_STATS = gql`
    query{
        treeNationStats{
            stats
        }
    }
`;