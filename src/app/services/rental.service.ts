import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { lastValueFrom } from 'rxjs';
import { ACCEPT_RENTAL_REQUEST, GET_OFFICES_SHIPPING, REJECT_RENTAL_REQUEST, SEND_NOTIFICATION_DELIVERED_PRODUCT, SEND_NOTIFICATION_RECEIVE_PRODUCT, SET_IN_PERSON_RENTAL_ADDRESS, TOGGLE_ACCEPT_ADDRESS, UPDATE_OPERATION_STATUS } from '../GraphQL/rental';
import { SoapResponse } from '../interfaces/shipping';
import { OperationStatus } from '../interfaces/rental';

@Injectable({
  providedIn: 'root'
})
export class RentalService {

  devCollectPoints:SoapResponse = {
    "Envelope": {
      "Header": "",
      "Body": {
        "localizadorRespuesta": {
          "arrayOficina": {
            "item": [
              {
                "unidad": 2825394,
                "nombre": "EO JUZGADOS DE PRIMERA INSTANCIA",
                "ind_ambitoCodigo": "",
                "direccion": "PL. CASTILLA, 1",
                "cp": 28046,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441501.97,
                "coorYETRS89": 4479635,
                "coorXWGS84": -410770.72,
                "coorYWGS84": 4933795,
                "telefono": 914932505,
                "horarioLV": "DE 08:30 A 14:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.465332,
                "longitudETRS89": -3.690016,
                "latitudWGS84": 40.465332,
                "longitudWGS84": -3.690016
              },
              {
                "unidad": 2828194,
                "nombre": "MADRID SUC 1. VILLANUEVA",
                "ind_ambitoCodigo": "",
                "direccion": "VILLANUEVA 30",
                "cp": 28001,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441894,
                "coorYETRS89": 4474851,
                "coorXWGS84": -410207.28,
                "coorYWGS84": 4927495,
                "telefono": 914319159,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.42226,
                "longitudETRS89": -3.6849546,
                "latitudWGS84": 40.42226,
                "longitudWGS84": -3.6849546
              },
              {
                "unidad": 2828294,
                "nombre": "MADRID SUC 2. PROSPERIDAD",
                "ind_ambitoCodigo": "",
                "direccion": "LUIS VIVES, 12",
                "cp": 28002,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 442667.22,
                "coorYETRS89": 4477288.5,
                "coorXWGS84": -409217.16,
                "coorYWGS84": 4930714.5,
                "telefono": 915633992,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.44427,
                "longitudETRS89": -3.6760604,
                "latitudWGS84": 40.44427,
                "longitudWGS84": -3.6760604
              },
              {
                "unidad": 2829694,
                "nombre": "MADRID SUC 13. AV DE AMERICA",
                "ind_ambitoCodigo": "",
                "direccion": "AV. AMERICA, 3",
                "cp": 28002,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 442558.38,
                "coorYETRS89": 4476575.5,
                "coorXWGS84": -409352.84,
                "coorYWGS84": 4929774,
                "telefono": 915633946,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.437843,
                "longitudETRS89": -3.6772792,
                "latitudWGS84": 40.437843,
                "longitudWGS84": -3.6772792
              },
              {
                "unidad": 2828394,
                "nombre": "MADRID SUC 3. MAUDES",
                "ind_ambitoCodigo": "",
                "direccion": "MAUDES, 39",
                "cp": 28003,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 440824.47,
                "coorYETRS89": 4477398.5,
                "coorXWGS84": -411637.03,
                "coorYWGS84": 4930840.5,
                "telefono": 915330250,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.445137,
                "longitudETRS89": -3.6977985,
                "latitudWGS84": 40.445137,
                "longitudWGS84": -3.6977985
              },
              {
                "unidad": 2833094,
                "nombre": "MADRID SUC 46. GUZM&#193;N EL BUENO",
                "ind_ambitoCodigo": "",
                "direccion": "CL GUZMAN EL BUENO 86",
                "cp": 28003,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 439558.5,
                "coorYETRS89": 4476833,
                "coorXWGS84": -413292.75,
                "coorYWGS84": 4930082,
                "telefono": 915536813,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.43995,
                "longitudETRS89": -3.712672,
                "latitudWGS84": 40.43995,
                "longitudWGS84": -3.712672
              },
              {
                "unidad": 2830194,
                "nombre": "MADRID SUC 18. MALASA&#209;A",
                "ind_ambitoCodigo": "",
                "direccion": "PIZARRO, 17",
                "cp": 28004,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 440126.12,
                "coorYETRS89": 4474980.5,
                "coorXWGS84": -412528.3,
                "coorYWGS84": 4927647.5,
                "telefono": 915322761,
                "horarioLV": "DE 08:30 A 14:30 Y DE 16:30 A 20:00",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.4233,
                "longitudETRS89": -3.7058048,
                "latitudWGS84": 40.4233,
                "longitudWGS84": -3.7058048
              },
              {
                "unidad": 2828694,
                "nombre": "MADRID SUC 6. CLAUDIO COELLO",
                "ind_ambitoCodigo": "",
                "direccion": "CLAUDIO COELLO, 100",
                "cp": 28006,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441849.34,
                "coorYETRS89": 4476109.5,
                "coorXWGS84": -410278.66,
                "coorYWGS84": 4929152.5,
                "telefono": 914359540,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.433594,
                "longitudETRS89": -3.6855958,
                "latitudWGS84": 40.433594,
                "longitudWGS84": -3.6855958
              },
              {
                "unidad": 2828994,
                "nombre": "MADRID SUC 9. MANUEL BECERRA",
                "ind_ambitoCodigo": "",
                "direccion": "MARTIRES CONCEPCIONISTAS, 21",
                "cp": 28006,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 443116.03,
                "coorYETRS89": 4475616.5,
                "coorXWGS84": -408611.38,
                "coorYWGS84": 4928515.5,
                "telefono": 914028150,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.42924,
                "longitudETRS89": -3.6706185,
                "latitudWGS84": 40.42924,
                "longitudWGS84": -3.6706185
              },
              {
                "unidad": 2833794,
                "nombre": "MADRID SUC 53.CONDE DE PE&#209;ALVER",
                "ind_ambitoCodigo": "",
                "direccion": "CONDE DE PE&#209;ALVER, 19",
                "cp": 28006,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 442690.34,
                "coorYETRS89": 4475325,
                "coorXWGS84": -409167.1,
                "coorYWGS84": 4928127.5,
                "telefono": 915769172,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.426582,
                "longitudETRS89": -3.6756105,
                "latitudWGS84": 40.426582,
                "longitudWGS84": -3.6756105
              },
              {
                "unidad": 2829494,
                "nombre": "MADRID SUC 10. ALBURQUERQUE",
                "ind_ambitoCodigo": "",
                "direccion": "ALBURQUERQUE, 2",
                "cp": 28010,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 440360.4,
                "coorYETRS89": 4475849.5,
                "coorXWGS84": -412230,
                "coorYWGS84": 4928795,
                "telefono": 914457767,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.43115,
                "longitudETRS89": -3.703125,
                "latitudWGS84": 40.43115,
                "longitudWGS84": -3.703125
              },
              {
                "unidad": 2832094,
                "nombre": "MADRID SUC 36. ORENSE",
                "ind_ambitoCodigo": "",
                "direccion": "JULIAN BESTEIRO S/N ESQUINA SAN GERMAN",
                "cp": 28020,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441058.3,
                "coorYETRS89": 4478627,
                "coorXWGS84": -411342.8,
                "coorYWGS84": 4932462,
                "telefono": 915568558,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.45622,
                "longitudETRS89": -3.6951554,
                "latitudWGS84": 40.45622,
                "longitudWGS84": -3.6951554
              },
              {
                "unidad": 2848594,
                "nombre": "MADRID SUC 66. TORRE PICASSO",
                "ind_ambitoCodigo": "",
                "direccion": "PL. PABLO RUIZ PICASSO 1 (TORRE PICASSO)",
                "cp": 28020,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441229.78,
                "coorYETRS89": 4477943.5,
                "coorXWGS84": -411110.62,
                "coorYWGS84": 4931563,
                "telefono": 915564040,
                "horarioLV": "DE 08:30 A 14:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.450073,
                "longitudETRS89": -3.6930697,
                "latitudWGS84": 40.450073,
                "longitudWGS84": -3.6930697
              },
              {
                "unidad": 2832894,
                "nombre": "MADRID SUC 44. LA VENTILLA",
                "ind_ambitoCodigo": "",
                "direccion": "PADRE RUBIO 43",
                "cp": 28029,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441184.03,
                "coorYETRS89": 4480268,
                "coorXWGS84": -411194.7,
                "coorYWGS84": 4934626,
                "telefono": 913231837,
                "horarioLV": "DE 08:30 A 20:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.47101,
                "longitudETRS89": -3.6938245,
                "latitudWGS84": 40.47101,
                "longitudWGS84": -3.6938245
              },
              {
                "unidad": 2831594,
                "nombre": "MADRID SUC 31. FUENCARRAL PUEBLO",
                "ind_ambitoCodigo": "",
                "direccion": "ISLAS PALAOS, 30",
                "cp": 28034,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441834.56,
                "coorYETRS89": 4483217.5,
                "coorXWGS84": -410370.6,
                "coorYWGS84": 4938521.5,
                "telefono": 913584515,
                "horarioLV": "DE 08:30 A 14:30 Y DE 16:30 A 20:00",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.497627,
                "longitudETRS89": -3.6864219,
                "latitudWGS84": 40.497627,
                "longitudWGS84": -3.6864219
              },
              {
                "unidad": 2833594,
                "nombre": "MADRID SUC 51. BEGO&#209;A",
                "ind_ambitoCodigo": "",
                "direccion": "VIRGEN DE ARANZAZU, 31",
                "cp": 28034,
                "codLocalidad": 2807900010100,
                "descLocalidad": "MADRID",
                "coorXETRS89": 441563.62,
                "coorYETRS89": 4482043.5,
                "coorXWGS84": -410714.47,
                "coorYWGS84": 4936971,
                "telefono": 917290480,
                "horarioLV": "DE 08:30 A 14:30",
                "horarioS": "SIN SERVICIO",
                "horarioF": "SIN SERVICIO",
                "latitudETRS89": 40.487034,
                "longitudETRS89": -3.6895108,
                "latitudWGS84": 40.487034,
                "longitudWGS84": -3.6895108
              }
            ]
          },
          "error": 0
        }
      }
    }
  }
  constructor(
    private apollo: Apollo
  ) { }

  async acceptRentalRequest( operation_id:string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: ACCEPT_RENTAL_REQUEST,
        variables:{
          operation_id
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async rejectRentalRequest( operation_id:string ){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: REJECT_RENTAL_REQUEST,
        variables:{
          operation_id
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async getNearOfficeShipping( zip_code:string ){
    const response:any = await lastValueFrom(
      this.apollo.query({
        query: GET_OFFICES_SHIPPING,
        variables:{
          zip_code
        }
      })
    );
    return response;
  }

  async setInPersonRentalAddress(params: {operation_id: string,shipping_address: string,suggestion_hours: string[]}){
    const { operation_id, shipping_address, suggestion_hours } = params;
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SET_IN_PERSON_RENTAL_ADDRESS,
        variables:{
          operation_id,
          shipping_address,
          suggestion_hours
        },
        errorPolicy: 'all'
      })
    );
    return response;
  }

  async toggleAcceptRentalAddress(params :{ accepted: boolean , operation_id:string, hour:string}){

    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: TOGGLE_ACCEPT_ADDRESS,
        variables:params
      })
    );

    return response;
  }

  async sendNotificationDelivered( operation_id: string ){

    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SEND_NOTIFICATION_DELIVERED_PRODUCT,
        variables:{
          operation_id
        }
      })
    );

    return response;
  }

  async sendNotificationReceive( operation_id: string ){

    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: SEND_NOTIFICATION_RECEIVE_PRODUCT,
        variables:{
          operation_id
        }
      })
    );

    return response;
  }

  async updateStatusOperation(operation_id: string , status: OperationStatus){
    const response:any = await lastValueFrom(
      this.apollo.mutate({
        mutation: UPDATE_OPERATION_STATUS,
        variables:{
          operation_id,
          status
        }
      })
    );

    return response;
  }
}
