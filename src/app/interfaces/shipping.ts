export interface SoapResponse {
    Envelope: Envelope;
}

export interface Envelope {
    Header: string;
    Body:   Body;
}

export interface Body {
    localizadorRespuesta: LocalizadorRespuesta;
}

export interface LocalizadorRespuesta {
    arrayOficina: ArrayOficina;
    error:        number;
}

export interface ArrayOficina {
    item: ItemOffice[];
}

export interface ItemOffice {
    unidad:           number;
    nombre:           string;
    ind_ambitoCodigo: string;
    direccion:        string;
    cp:               number;
    codLocalidad:     number;
    descLocalidad:    string;
    coorXETRS89:      number;
    coorYETRS89:      number;
    coorXWGS84:       number;
    coorYWGS84:       number;
    telefono:         number;
    horarioLV:        string;
    horarioS:         string;
    horarioF:         string;
    latitudETRS89:    number;
    longitudETRS89:   number;
    latitudWGS84:     number;
    longitudWGS84:    number;
}