import { ImageProduct } from "./store";
import { User } from "./user";

export interface BoardData {
    id:                string;
    need:              string;
    status:            string;
    description:       string;
    zip_code:          string;
    province:          string;
    locatario_user_id: string;
    product_id:        string;
    locator_user_id:   string;
    responses:         ResponseRequestBoard[];
    locator?:          User;
    created_at:        Date;
    locatario:         User;
    __typename:        string;
}


export interface ResponseRequestBoard {
    id:               string;
    product_id:       string;
    product:          ProductAnswer;
    user_id:          string;
    request_board_id: string;
    user:             SmallUser;
    status:           ResponseRequestBoardStatus;
    request?:         Request;
    __typename:       string;
}

export interface ProductAnswer {
    id:         string;
    title:      string;
    images:     ImageProduct[];
    __typename: string;
}

export enum ResponseRequestBoardStatus {
    pending = "pending",
    solved = "solved",
    unsolved = "unsolved"
}

export interface Request {
    id:                string;
    need:              string;
    status:            string;
    description:       string;
    zip_code:          string;
    province:          string;
    locatario_user_id: string;
    product_id:        null;
    locator_user_id:   null;
    created_at:        Date;
    locatario:         SmallUser;
    __typename:        string;
}

export interface SmallUser {
    id:                    string;
    name:                  string;
    email:                 string;
    last_name:             string;
    profile_photo_path:    string;
    __typename:            string;
}

export interface PersonalInfo {
    id:                 string;
    alias:              string;
    dni:                string;
    birthdate:          Date;
    gender:             string;
    phone_country_code: string;
    phone:              string;
    country_id:         string;
    state_id:           string;
    description:        string;
    city_id:            string;
    address:            string;
    zip_code:           string;
    __typename:         string;
}

export type StatusResponseBoard = 'pending' | 'solved' | 'unsolved';

export interface CreateRequestBoardPayload {
    need:               string;
    description:        string;
    zip_code:           string;
    province:           string;
}

export interface ParamModalSelectProduct {
    request_id: string;
    locator_id: string;
}