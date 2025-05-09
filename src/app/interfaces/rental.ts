export type OperationStatus = "created" | "confirmed" | "finished" | "canceled_by_locator" | "canceled_by_locatario" | "canceled_by_admin" | "received" | "delivered";

export interface SoapResponse {
    soapenv_Header: SoapenvHeader;
    soapenv_Body:   SoapenvBody;
}

export interface SoapenvBody {
    homePaqRespuesta1: HomePaqRespuesta1;
}

export interface HomePaqRespuesta1 {
    listaHomePaq: ListaHomePaq;
}

export interface ListaHomePaq {
    homePaq: HomePaq[];
    error:   string;
}

export interface HomePaq {
    cod_homepaq:          string;
    id_fabricante:        string;
    nom_fabricante:       NomFabricante;
    modelo:               string;
    fec_instalacion:      Date;
    fec_alta:             Date;
    tipo_homepaq:         TipoHomepaq;
    cod_estado:           string;
    des_via:              DESVia;
    direccion:            string;
    numero:               string;
    portal:               SoapenvHeader;
    bloque:               SoapenvHeader | string;
    escalera:             SoapenvHeader;
    cod_localidad:        string;
    desc_localidad:       DescLocalidad;
    cod_provincia:        string;
    cod_postal:           string;
    num_modulos:          string;
    num_ubi__muy_pequeno: string;
    num_ubi_pequeno:      string;
    num_ubi_mediano:      string;
    num_ubi_grande:       string;
    num_ubi_egrande:      string;
    des_canal:            string;
    det_canal:            string;
    observaciones:        SoapenvHeader | string;
    ind_admision:         SoapenvHeader | IndAdmisionEnum;
    ind_horario:          string;
    coorXETRS89:          string;
    coorYETRS89:          string;
    coorXWGS84:           string;
    coorYWGS84:           string;
    latitudETRS89:        string;
    longitudETRS89:       string;
    latitudWGS84:         string;
    longitudWGS84:        string;
    alias:                string;
}

export interface SoapenvHeader {
}

export enum DESVia {
    Calle = "CALLE",
    Paseo = "PASEO",
    Plaza = "PLAZA",
}

export enum DescLocalidad {
    Madrid = "MADRID",
}

export enum IndAdmisionEnum {
    N = "N",
    S = "S",
}

export enum NomFabricante {
    Azkoyen = "Azkoyen",
    Keba = "Keba",
    Sermicro = "Sermicro",
}

export enum TipoHomepaq {
    D = "D",
    P = "P",
}
