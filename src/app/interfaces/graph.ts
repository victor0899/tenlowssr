import { ResponseRequestBoard } from "./board";
import { CityData } from "./countries";
import { BlockedUser } from "./moderation";
import { ChargeData, PaymentMethod, Payments } from "./payments";
import { PaginatorInfo } from "./public";
import { OperationData, ProductInfo } from "./store";
import { NotificationData, User, UserAuth } from "./user";

export interface GraphResponse {
    data:   ApiResponses;
    errors?:   any;
    loading: boolean;
    networkStatus?: number;
}

export interface ApiResponses {
    countries: any;
    f2AEmailRequest?: any;
    login:UserAuth;
    me:UserAuth;
    getPrices:string[];
    getOffices:string;
    language:string;
    f2AVerify:string;
    f2ARequest:string;
    availabilityProduct:boolean;
    setCalificationProduct:string;
    setCalificationOwner:string;
    setExperience:string;
    getBlockeds:BlockedUser[];
    unreadNotifications:any[];
    changePassword:string[];
    disableAccount:string[];
    preRegistration:string[];
    updateAccountBank:string[];
    changePhone:string[];
    deleteAccount:string[];
    getChangePhone:string[];
    changeEmail:string[];
    registerUser:any;
    forgotPassword:any;
    authorizationPayment:string;
    cancelOperation: any;
    createOperation: OperationData;
    resetPassword:any;
    record:{
        paginatorInfo: PaginatorInfo;
        data: [];
    };
    autocompleteProduct: string[];
    updatePersonalInfo: UserAuth;
    user: User;
    socialLogin: UserAuth;
    uploadImageUser: any;
    updateProduct: ProductInfo;
    payments: {
        paginatorInfo: PaginatorInfo;
        data: Payments[];
    };
    productsByUser: {
        paginatorInfo: PaginatorInfo;
        data: ProductInfo[];
    };
    getDeleteProducts: {
        paginatorInfo: PaginatorInfo;
        data: ProductInfo[];
    };
    charges:{
        paginatorInfo: PaginatorInfo;
        data: ChargeData[];
    };
    notifications:{
        paginatorInfo: PaginatorInfo;
        data: NotificationData[];
    };
    filterByProduct:{
        paginatorInfo: PaginatorInfo;
        data: ProductInfo[];
    };
    getSendResponseRequestBoard:{
        paginatorInfo: PaginatorInfo;
        data: ResponseRequestBoard[];
    };
    categories:any;
    getStateByCountry:any;
    subCategories:any;
    createProduct:any;
    getProduct:any;
    searchProduct:any;
    productsByCategory:any;
    getProductBySubCategory:any;
    products:any;
    requestsBoard:any;
    createRequestBoard:any;
    getUserRequestBoard:any;
    getCityByState: CityData[],
    paymentMethods: PaymentMethod[]
}