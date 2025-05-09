export interface SignupParams {
    name:           string;
    last_name:      string;
    email:          string;
    password:       string;
    phone:          string;
    phone_country_code?: string; 
}

export type TYPE_LOGIN = 'facebook' | 'google' | 'apple' | "email";
export type TYPE_ROLE = 'client';

export interface SocialLoginParams {
    name:               string;
    last_name:           string;
    email:              string;
    phone?:              string;
    login_apple_id?:       string;
    login_google_id?:      string;
    login_facebook_id?:    string;
    photo?:             string;
    type_login:          TYPE_LOGIN;
    role:               TYPE_ROLE;
}

export interface UserFacebook {
    first_name: string;
    last_name:  string;
    email:      string;
    picture:    Picture;
    id:         string;
}

export interface Picture {
    data: Data;
}

export interface Data {
    height:        number;
    is_silhouette: boolean;
    url:           string;
    width:         number;
}