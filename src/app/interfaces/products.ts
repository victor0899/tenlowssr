import { Photo } from "./public";

export interface ImageFileProduct {
    index: number;
    image?: Photo
}

export interface FieldInputPrice {
    label:string;
    var:string
    period: 'day' | 'week' | 'month';
}

export interface AddProductPayload {
    title:                               string;
    subcategory_id:                      string;
    description:                         string;
    category_id:                         string;
    condition:                           string;
    daily_price:                         number;
    weekly_price:                        number;
    monthly_price:                       number;
    daily_minimum_rental_time:           number;
    weekly_minimum_rental_time:          number;
    monthly_minimum_rental_time:         number;
    daily_maximum_rental_time:           number;
    weekly_maximum_rental_time:          number;
    monthly_maximum_rental_time:         number;
    rent_with_option_to_buy:             boolean;
    sale_price:                          number;
    country:                             string;
    state:                               string;
    zip_code:                            string;
    address:                             string;
    daily_minimum_rental_time_to_buy:    number;
    weekly_minimum_rental_time_to_buy:   number;
    monthly_minimum_rental_time_to_buy:  number;
    latitud: number,
    longitud: number,
    displacement_range: number
}