import { Timestamp } from "firebase/firestore";
import { TYPE_LOGIN } from "./auth";
import { ImageProduct, ProductInfo } from "./store";
import { BankAccountData, OperationInfo } from "./payments";

export interface UserFav {
    id:                string;
    name:              string;
    last_name:         string;
    email:             string;
    rating:            number;
    type_login:        TYPE_LOGIN;
    email_verified_at: Date;
    created_at:        Date;
    view_products:     ViewProducts[];
    personal_info?:     PersonalInfoFav;
    profile_photo_path:string;
    updated_at:        Date;
    __typename:        string;
}

export interface ViewProducts {
    id      :string,
    title   :string ,
    images  :ImageProduct[];
}

export interface PersonalInfoFav {
    id:                  string;
    alias:               string;
    gender:              string;
    description:         string;
}
export interface User {
    id:                     string;
    name:                   string;
    last_name:              string;
    email:                  string;
    total_charges:          number;
    tree_count:             number;
    plant_tree_percentage:  number;
    type_login:             TYPE_LOGIN;
    profile_photo_path:     string;
    email_verified_at:      Date;
    created_at:             Date;
    personal_info?:         PersonalInfo;
    updated_at:             Date;
    favorite_by_auth_user:  boolean;
    rating:                 number;
    rentals:                 number;
    califications:          CalificationData[];
    favoriteProducts:       ProductInfo[];
    favoriteUsers:          UserFav[];
    __typename:             string;
}

export interface CalificationData {
    id: string;
    comment: string;
    rating: number;
    created_at: Date;
    user: UserElement;
}

export interface UserAuth extends User {
    login_apple_id?:       string;
    login_google_id?:      string;
    login_facebook_id?:    string;
    api_token:         string;
    notificationSettings: NotificationSettings | null;
    bankaccount: BankAccountData;
    stripe_id?: string;
}

export interface DataValidStripe{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    day: string;
    month: string;
    year: string;
    line1: string;
    city: string;
    postal_code: string;
    state: string;
    country: string;
}

export interface NotificationSettings {
    user_id:                              string;
    expired_products:                     boolean;
    price_change_favorite_products:       boolean;
    rented_sold_favorites:                boolean;
    added_your_products_favorites:        boolean;
    products_published_favorite_profiles: boolean;
    promotions_and_news:                  boolean;
    tips_and_suggestions:                 boolean;
    unsubscribe:                          boolean;
}

export enum OperationsAccount {
    delete = 'delete',
    disable = 'disable'
};

export interface NotificationData {
    id:               string;
    title:            string;
    message:          string;
    user_id:          string;
    meta:             string;
    type:             NotificationType;
    user_read_at:    string;
    operation_status: null;
    created_at:       string;
    operation:        OperationInfo;
    user:             User;
    __typename:       string;
}

export enum NotificationType {
    rental = "rental",
    delivery_confirm = "delivery_confirm",
    delivery_confirmed = "delivery_confirmed",
    purchase = "purchase",
    sale = "sale",
    information = "information",
    table_request = "table_request"
}

export interface OptionDeleted {
    label: string;
    value: ReasonDeleted;
}

export enum ReasonDeleted {
    no_need = "no_need",
    bad_experience = "bad_experience",
    found_other_app = "found_other_app",
    other = "other"
}

export interface UserElement {
    id:         string;
    name:       string;
    last_name:  string;
    __typename: string;
    profile_photo_path?:      string;
    email?:     string;
}

export interface PersonalInfo {
    id:                  string;
    alias:               string;
    dni:                 string;
    birthdate:           Date;
    gender:              string;
    phone_country_code:  string;
    description:         string;
    phone:               string;
    country_id:          string;
    state_id:            string;
    city_id:             string;
    address:             string;
    zip_code:            string;
}

export interface ParamsUpdateProfile {
    user_id?:  string;
    name?: string;
    last_name?: string;
    email?: string;
    alias?: string;
    dni?: string;
    birthdate?: string;
    gender?: string;
    phone_country_code?: string;
    phone?: string;
    country_id?:  string;
    description?:  string;
    state_id?:  string;
    city_id?:  string;
    address?: string;
    zip_code?: string;
}

export enum VIEWS_SETTING_USER {
    NAME = 'name',
    DNI = 'dni',
    BIRTHDAY = 'birthdate',
    EMAIL = 'email',
    PHONE = 'phone',
    ADDRESS = 'address',
    SECURITY = 'security',
    NOTIFICATIONS = 'notifications',
    SOCIAL = "social",
    ACCOUNT = "account",
    DESCRIPTION = "description"
}

export interface ItemViewProfile {
    title: string;
    subtitle: string;
    view: VIEWS_SETTING_USER;
}

export enum FIELDS_PROFILE {
    NAME_LAST_NAME = "names_lastnames",
    email = "email",
    ALIAS = "alias",
    DNI = "dni",
    BIRTHDAY = "birthdate",
    GENDER = "gender",
    PHONE = "phone",
    COUNTRY_ID = "country_id",
    STATE_ID = "state_id",
    CITY_ID = "city_id",
    ADDRESS = "address",
    ZIP_CODE = "zip_code",
    DESCRIPTION = "description"
}


export interface ChatInfo{
    id?: string;
    userFromId: string;
    userToId: string;
    idsUsers: string[];
    userSender: UserChat;
    userReceive: UserChat;
    new_message: boolean;
    newMsgFrom: string;
    blockedUser?: string[];
    reportedUser?: string[];
    deletedBy?: string[],
    messages: MessageChat[];
    product: ProductChat;
}

export interface ProductChat {
    id: string;
    image:string;
    name: string;
    description:string;
}

export interface UserChat {
    id: string,
    name: string,
    photo: string;
}
export interface MessageChat{
    createdAt: Timestamp;
    message: string;
    sendUserId: string;
    deletedBy: string[]
}

export interface OptionMenuChat {
    label: string;
    value: OptionsChat;
}

export enum OptionsChat  {
    delete='delete',
    report_user = 'report_user',
    block_user='block_user'
}

export interface FaqQuestions {
    faqs:           FaqItem[];
    faqs_owner:     FaqItem[];
    faqs_client:    FaqItem[];
}

export interface FaqItem {
    question: string;
    answer: string;
    isOpen: boolean;
}