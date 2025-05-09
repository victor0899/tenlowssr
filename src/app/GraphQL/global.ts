import { gql } from "apollo-angular";

export const GET_COUNTRIES = gql`
    query {
        countries{
            id,
            name,
            phonecode,
            translations
        }
    }
`;

export const GET_STATES_BY_COUNTRY = gql`
    query getStates($country_id: ID!){
        getStateByCountry(
            country_id: $country_id
        ){
            id,
            name,
            country_id
        }
    }
`;


export const GET_CITIES_BY_STATE = gql`
    query getCities($state_id: ID!){
        getCityByState(
            state_id: $state_id
        ){
            id,
            name,
            state_id
        }
    }
`;

export const GET_LANG =  gql`
    query getLang{
        language
    }
`;
