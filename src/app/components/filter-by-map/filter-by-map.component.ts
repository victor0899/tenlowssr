import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ParamFilterMap } from 'src/app/interfaces/store';
import { GlobalService } from 'src/app/services/global.service';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: 'filter-by-map',
  templateUrl: './filter-by-map.component.html',
  styleUrls: ['./filter-by-map.component.scss']
})
export class FilterByMapComponent implements OnInit {

  @Output() onApplyfilter = new EventEmitter<ParamFilterMap>();
  @Output() onCancelFilter = new EventEmitter<boolean>();
  @Input() filterParams!:ParamFilterMap | null;

  mapOptions: google.maps.MapOptions = {
    fullscreenControl: false,
    streetViewControl: false,
    clickableIcons: false,
    mapTypeControl: false,
    controlSize: 25
  };

  center: google.maps.LatLngLiteral = {lat: 40, lng: -3};
  zoom = 6;
  markerOptions: google.maps.MarkerOptions = { draggable: true };
  markerPosition!: google.maps.LatLngLiteral;
  radiusMarker:number =  0;
  optionsCircle: google.maps.CircleLiteral = {
    draggable: false,
    fillColor: '#8BE8E5',
    strokeColor: '#31B7BC',
    center: this.center,
    radius: 0
  };
  optionsAutocomplete: any = {
    bounds: null
  }
  latitude: number =  0;
  longitude:number =  0;

  constructor(
    private globalService: GlobalService,
    private lang: LangService
  ) {}

  ngOnInit(): void {
    console.log("🚀 ~ this.filterParams:", this.filterParams);
    if(!this.filterParams) return;

    const { latitude, longitude, distance_range } = this.filterParams;

    if( latitude != 0 && longitude != 0 && distance_range != 0){
      const latLng: google.maps.LatLngLiteral = {
        lat: latitude,
        lng: longitude
      };
      console.log("🚀 ~ ngOnInit ~ latLng:", latLng)
      this.center = latLng;
      this.latitude = latitude;
      this.longitude = longitude;
      this.markerPosition = latLng;
      this.optionsCircle.center = latLng;
      this.radiusMarker = distance_range * 1000;
      this.zoom = 9;
    }
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if(event.latLng){
      const { lat, lng } =  event.latLng;
      this.center = event.latLng.toJSON();
      this.markerPosition= event.latLng.toJSON();
      this.latitude = lat();
      this.longitude = lng();
      this.zoom = 9;
    }
  }

  dragMarker(event:google.maps.MapMouseEvent){
    console.log("🚀 ~ dragMarker ~ event:", event);
    if(event.latLng){
      const { lat, lng } =  event.latLng;
      this.markerPosition = event.latLng.toJSON();
      this.center = event.latLng.toJSON();
      this.latitude = lat();
      this.longitude = lng();
    }
  }

  handleAddressChange(address: Address) {
    if(!address.geometry) return;
    const { lat,lng } = address.geometry.location;
    console.log(address.formatted_address);
    // this.addressMeet?.setValue(address.formatted_address);
    this.center =  address.geometry.location.toJSON();
    this.markerPosition = address.geometry.location.toJSON();
    this.latitude = lat();
    this.longitude = lng();
  }

  onSlideRange(value:number){
    this.radiusMarker = value * 1000;
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }

  closeMap(){
    this.onCancelFilter.emit(true);
  }

  applyFilter(){

    const isInvalidLatLng = this.latitude == 0 && this.longitude == 0;

    if(isInvalidLatLng){
      return this.globalService.showToast(
        this.lang._('components.filter_map.err_lat_lng'),
        'Ok',
        'top'
      );
    }

    if(this.radiusMarker == 0){
      return this.globalService.showToast(
        this.lang._('components.filter_map.err_distance'),
        'Ok',
        'top'
      );
    }

    this.onApplyfilter.emit({
      latitude: this.latitude,
      longitude: this.longitude,
      distance_range: this.radiusMarker / 1000
    })
  }
}
