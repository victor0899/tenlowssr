export interface Country {
    id: string;
    name: string;
    translations: string;
    phonecode: string;
    flag: string;
    latlng: number[];
}

export interface StateData {
    country_id:string;
    id: string;
    name:string;
}

export interface CityData {
    state_id:string;
    id: string;
    name:string;
}



export interface CountryData {
    altSpellings: string[];
    area:         number;
    borders?:     string[];
    capital:      string[];
    capitalInfo:  CapitalInfo;
    car:          Car;
    cca2:         string;
    cca3:         string;
    ccn3?:        string;
    cioc?:        string;
    coatOfArms:   CoatOfArms;
    continents:   Region[];
    currencies:   Currencies;
    demonyms:     Demonyms;
    fifa?:        string;
    flag:         string;
    flags:        CoatOfArms;
    gini?:        { [key: string]: number };
    idd:          Idd;
    independent?: boolean;
    landlocked:   boolean;
    languages:    Languages;
    latlng:       number[];
    maps:         Maps;
    name:         Name;
    population:   number;
    postalCode?:  PostalCode;
    region:       Region;
    startOfWeek:  StartOfWeek;
    status:       Status;
    subregion:    Subregion;
    timezones:    string[];
    tld?:         string[];
    translations: { [key: string]: Translation };
    unMember:     boolean;
   }

   export interface CapitalInfo {
    latlng: number[];
   }

   export interface Car {
    side:  Side;
    signs: string[];
   }

   export enum Side {
    Left = "left",
    Right = "right",
   }

   export interface CoatOfArms {
    png?: string;
    svg?: string;
   }

   export enum Region {
    Europe = "Europe",
   }

   export interface Currencies {
    ALL?: All;
    BAM?: BAM;
    BGN?: All;
    BYN?: All;
    CHF?: All;
    CZK?: All;
    DKK?: All;
    EUR?: All;
    FOK?: All;
    GBP?: All;
    GGP?: All;
    GIP?: All;
    HRK?: All;
    HUF?: All;
    IMP?: All;
    ISK?: All;
    JEP?: All;
    MDL?: All;
    MKD?: All;
    NOK?: All;
    PLN?: All;
    RON?: All;
    RSD?: All;
    RUB?: All;
    SEK?: All;
    UAH?: All;
   }

   export interface All {
    name:   string;
    symbol: string;
   }

   export interface BAM {
    name: string;
   }

   export interface Demonyms {
    eng:  Eng;
    fra?: Eng;
   }

   export interface Eng {
    f: string;
    m: string;
   }

   export interface Idd {
    root:     string;
    suffixes: string[];
   }

   export interface Languages {
    bar?: string;
    bel?: string;
    bos?: string;
    bul?: string;
    cat?: string;
    ces?: string;
    cnr?: string;
    dan?: string;
    deu?: string;
    ell?: string;
    eng?: string;
    est?: string;
    fao?: string;
    fin?: string;
    fra?: string;
    gle?: string;
    glv?: string;
    gsw?: string;
    hrv?: string;
    hun?: string;
    isl?: string;
    ita?: string;
    lat?: string;
    lav?: string;
    lit?: string;
    ltz?: string;
    mkd?: string;
    mlt?: string;
    nfr?: string;
    nld?: string;
    nno?: string;
    nob?: string;
    nor?: string;
    nrf?: string;
    pol?: string;
    por?: string;
    roh?: string;
    ron?: string;
    rus?: string;
    slk?: string;
    slv?: string;
    smi?: string;
    spa?: string;
    sqi?: string;
    srp?: string;
    swe?: string;
    tur?: string;
    ukr?: string;
   }

   export interface Maps {
    googleMaps:     string;
    openStreetMaps: string;
   }

   export interface Name {
    common:     string;
    nativeName: { [key: string]: Translation };
    official:   string;
   }

   export interface Translation {
    common:   string;
    official: string;
   }

   export interface PostalCode {
    format: string;
    regex:  string;
   }

   export enum StartOfWeek {
    Monday = "monday",
   }

   export enum Status {
    OfficiallyAssigned = "officially-assigned",
    UserAssigned = "user-assigned",
   }

   export enum Subregion {
    CentralEurope = "Central Europe",
    EasternEurope = "Eastern Europe",
    NorthernEurope = "Northern Europe",
    SoutheastEurope = "Southeast Europe",
    SouthernEurope = "Southern Europe",
    WesternEurope = "Western Europe",
   }

   export interface CityData {
    data:  string[];
    error: boolean;
    msg:   string;
   }

   export interface UbicationHTTP {
    ip:                   string;
    network:              string;
    version:              string;
    city:                 string;
    region:               string;
    region_code:          string;
    country:              string;
    country_name:         string;
    country_code:         string;
    country_code_iso3:    string;
    country_capital:      string;
    country_tld:          string;
    continent_code:       string;
    in_eu:                boolean;
    postal:               null;
    latitude:             number;
    longitude:            number;
    timezone:             string;
    utc_offset:           string;
    country_calling_code: string;
    currency:             string;
    currency_name:        string;
    languages:            string;
    country_area:         number;
    country_population:   number;
    asn:                  string;
    org:                  string;
}

export interface StatesCountry {
    name:   string;
    iso3:   string;
    iso2:   string;
    states: State[];
}

export interface State {
    name:       string;
    state_code: string;
}
