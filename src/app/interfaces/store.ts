import { ChosenDate } from "ngx-daterangepicker-material/daterangepicker.component";
import { CalificationData } from "./user";

export interface Categorie {
    id:          string;
    name:        string;
    icon:        string;
    description: null;
    __typename:  string;
}

export enum ProductStatus {
    excellent = 'excellent',
    very_good = 'very_good',
    right = 'right',
    pending = 'pending',
    validated = "validated"
}

export enum MinimunRentalTimeFrequency {
    daily,
    weekly,
    monthly
}

export enum ProductConditions {
    excellent = "excellent",
    very_good = "very_good",
    right = "right"
}

export enum ProductAvailability {
    available = "available",
    rented = "rented",
    sold = "sold"
}
export interface ProductInfo {
    id:                                   string;
    title:                                string;
    description:                          string;
    slug:                                 string;
    status:                               ProductStatus;
    condition:                            ProductConditions;
    availability:                         ProductAvailability;
    daily_price:                          number;
    weekly_price:                         number;
    monthly_price:                        number;
    daily_minimum_rental_time:            number;
    weekly_minimum_rental_time:           number;
    monthly_minimum_rental_time:          number;
    daily_maximum_rental_time:            number;
    weekly_maximum_rental_time:           number;
    monthly_maximum_rental_time:          number;
    rent_with_option_to_buy:              boolean;
    sale_price:                           number;
    favorite_by_auth_user:                boolean;
    daily_minimum_rental_time_to_buy:     number;
    weekly_minimum_rental_time_to_buy:    number;
    monthly_minimum_rental_time_to_buy:   number;
    // minimum_rental_time_to_buy:           number;
    // minimum_rental_time_to_buy_frequency: MinimunRentalTimeFrequency;
    images:                               ImageProduct[];
    location:                             LocationProduct | null;
    user:                                 UserProduct;
    categories:                           CategoryProduct[];
    subcategories:                        CategoryProduct[];
    rating: number;
    califications:        CalificationData[];
    __typename:                           string;
}

export interface Subcategorie {
    id:          string;
    name:        string;
    description: null;
    category_id: string;
    __typename:  string;
}
export interface ImageProduct {
    id:          string;
    name:        string;
    path:        string;
    __typename:  string;
}

export interface LocationProduct {
    product_id:         string;
    country_id:         string;
    state_id:           string;
    zip_code:           string;
    delivery_address:   string;
    latitude:           number;
    longitude:          number;
    displacement_range: number;
    country:            Country;
    state:              Country;
    __typename:         string;
}

export interface Country {
    id:         string;
    name:       string;
    __typename: string;
}

export interface UserProduct {
    id:         string;
    name:       string;
    last_name:  string;
    email:      string;
    profile_photo_path: string;
    __typename: string;
}

export interface CategoryProduct {
    id:         string;
    name:       string;
    __typename: string;
}

export interface CheckoutData {
    user_id: string;
    amount: number;
    product: ProductInfo;
    type: string;
    init_date: Date;
    end_date: Date;
    rentalData: RentalInfo;
    shipping_method: string;
}


export interface RentalInfo{
    period: string;
    date: string;
    duration: number;
    cost: number;
    labelPeriod: string;
    startDate: Date;
    endDate: Date;
}

export interface PeriodRental {
    days:               number;
    weeks:              number;
    months:             number;
}

export interface PayloadCheckout{
    user_id: string;
    amount: number;
    product_id: string;
    type: string;
    init_date: string;
    end_date: string;
    shipping_address: string;
    shipping_method: string;
    shipping_code?: string;
}
export interface RangeDateSelected {
    days: ChosenDate;
    weeks: ChosenDate;
    months: ChosenDate;
}

export type PERIOD_RENTAL = 'days' | 'weeks' | 'months';



export interface ParamFilterMap {
    latitude: number;
    longitude: number;
    distance_range: number;
}


export interface ParamsFilterProducts {
    category_id?: number;
    latitude?: number;
    longitude?: number;
    min_price?: number;
    max_price?: number;
    order_price?: string;
    init_date?: string;
    end_date?: string;
    first?: number;
    page?: number;
}

export enum ORDER_PRICE {
    LOW_TO_TOP = 'LOW_TO_TOP',
    TOP_TO_LOW ='TOP_TO_LOW'
}
export interface FilterByPrice {
    minPrice?:       number;
    maxPrice?:       number;
    optionBuy:      boolean;
    orderPrice:     ORDER_PRICE | '';
    periodFilter:   'day'|'week'|'month' | '';
    limitPrice:     ValuePrice | null;
}

export interface PricesFilter {
    daily:   ValuePrice;
    weekly:  ValuePrice;
    monthly: ValuePrice;
}

export interface ValuePrice {
    min: string;
    max: string;
}


export interface AutocompleteSuggest {
    id: any;
    title: string;
}

export enum OperationShippingMethod {
    in_person = "in_person",
    my_adress = "my_adress",
    delivery_address = "delivery_address"
}

export enum OperationType {
    rental = "rental",
    purchase = "purchase",
    sale = "sale"
}

export enum OperationStatus {
    created = "created",
    confirmed = "confirmed",
    finished = "finished",
    canceled_by_locator = "canceled_by_locator",
    canceled_by_locatario = "canceled_by_locatario",
    canceled_by_admin = "canceled_by_admin",
    received = "received",
    delivered = "delivered"
}

export interface OperationData {
    id:              string;
    amount:          number;
    product:         ProductInfo;
    status:          OperationStatus;
    type:            OperationType;
    init_date:       Date;
    end_date:        Date;
    shipping_method: OperationShippingMethod;
    __typename:      string;
}


export interface AvailabilityProductParams{
    init_date: string;
    end_date: string;
    product_id: string;
}

export interface ReservedDate {
    init_date: string;
    end_date: string;
}

export interface ProductReservedDatesResponse {
    productReservedDates: ReservedDate[];
}
export interface ProductOperation {
    id: string;
    amount: number;
    product: {
      id: string;
    };
    status: OperationStatus;
    type: OperationType;
    suggestion_hours: string;
    init_date: string;
    end_date: string;
    shipping_address: string;
    accepted_shipping_address: boolean;
    shipping_hour: string | null;
    shipping_method: OperationShippingMethod;
    payment: {
      id: string;
      amount: number;
      status: string;
    };
    shipping_code: string;
  }