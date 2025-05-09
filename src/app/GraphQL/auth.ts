import { gql } from "apollo-angular";
import { USER_DATA_AUTH } from "./user";

export const AUTH_USER = gql`
    mutation login($email: String!, $password: String!){
        login(
            email: $email,
            password: $password
        ){
            ...USER_DATA_AUTH
        }
    }
    ${USER_DATA_AUTH}
`;

export const SIGNUP_USER = gql`
    mutation registerUser(
        $email: String!, 
        $password: String!, 
        $name: String!, 
        $last_name: String!, 
        $phone: String!,
        $phone_country_code: String!
    ){
        registerUser(
            email: $email,
            password: $password,
            name: $name,
            last_name: $last_name,
            phone: $phone,
            phone_country_code: $phone_country_code,
            role: client
        ){
            ...USER_DATA_AUTH
        }
    }
    ${USER_DATA_AUTH}
`;

export const SEND_EMAIL_RECOVERY = gql`
    mutation forgotPassword($email: String!){
        forgotPassword(
            email: $email
        )
    }
`;

export const PASSWORD_CODE_CHECK = gql`
    mutation passwordCodeCheck($code: String!){
        passwordCodeCheck(
            code: $code
        )
    }
`;

export const RESET_RECOVERY_PASSWORD = gql`
    mutation resetPassword(
        $password: String!,
        $code: String!
    ){
        resetPassword(
            password: $password,
            code: $code
        )
    }
`;


export const SOCIAL_LOGIN = gql`
  mutation socialLogin(
    $name: String!,
    $last_name: String!,
    $email: String!,
    $login_apple_id: String,
    $login_google_id: String,
    $login_facebook_id: String,
    $type_login: String!,
    $role: UserRole!,
    $photo: String,
  ){
    socialLogin(
      name: $name
      last_name: $last_name
      email: $email
      login_apple_id: $login_apple_id
      login_google_id: $login_google_id
      login_facebook_id: $login_facebook_id
      type_login: $type_login
      role: $role
      profile_photo_path: $photo
    ){
      ...USER_DATA_AUTH
    }
  }
  ${USER_DATA_AUTH}
`;


export const LINK_SOCIAL_ACCOUNT = gql`
    mutation setSocial(
        $id: String!
        $type: TypeSocial!
    ){
        setSocial(
            id: $id,
            type: $type
        )
    }
`;