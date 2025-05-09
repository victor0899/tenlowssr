import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { ChartConfiguration } from 'chart.js';
import { GraphResponse } from 'src/app/interfaces/graph';
import { ValuePrice } from 'src/app/interfaces/store';
import { FilterByPrice, ORDER_PRICE, PricesFilter } from 'src/app/interfaces/store';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-filter-price',
  templateUrl: './filter-price.component.html',
  styleUrls: ['./filter-price.component.scss']
})
export class FilterPriceComponent implements OnInit{

  cssInputTxt:string ="";
  cssFloatLabel:string ="";
  cssSpanValidation:string ="";
  cssInputToggle:string ="";
  cssMoneyIconInput:string = "absolute inset-y-0 right-1 top-1 bottom-0.5 bg-white flex items-center pr-3 text-2xl";

  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: Array.from({length: 14}, (_, i) => 'Precio'),
    datasets: [
      { data: [],categoryPercentage: 1, barPercentage: .87},
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: false,
    aspectRatio: 2.5,
    scales: {
      x: {
        display:false,
        grid:{
          color: 'transparent'
        }
      },
      y: {
        display:false,
        min: 1,
        grid: {
          color: '#ffffff',
          drawBorder: false,
          borderDash:() => [9]
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  //**************************************
  minPrice?:number = 0;
  maxPrice?:number = 100;
  withOptionBuy:boolean = false;
  orderSelect!:string;
  ORDER_PRICE = ORDER_PRICE;

  payloadOrderPrice:FilterByPrice = {
    minPrice: undefined,
    maxPrice: undefined,
    optionBuy: false,
    orderPrice: '',
    periodFilter: '',
    limitPrice: null
  };

  periodFilter: string;
  pricesFilter!:PricesFilter;
  pricesLimitFilter: ValuePrice | null;

  constructor(
    public publicService: PublicService,
    public dialog: MatDialog,
    private storeService: StoreService,
    private dialogRef: MatDialogRef<FilterPriceComponent>,
    @Inject(MAT_DIALOG_DATA) public params: FilterByPrice
  ){
    const { maxPrice,minPrice,optionBuy,orderPrice, periodFilter, limitPrice} = this.params
    console.log("🚀 ~ this.params:", this.params);
    this.payloadOrderPrice = this.params;
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
    this.withOptionBuy = optionBuy;
    this.orderSelect = orderPrice;
    this.periodFilter = periodFilter;
    this.pricesLimitFilter = limitPrice;
    this.cssInputTxt = this.publicService.cssInputBase;
    this.cssFloatLabel = this.publicService.cssFloatLabelBase;
    this.cssInputToggle = this.publicService.cssInputToggle;
    this.cssSpanValidation = this.publicService.cssSpanValidationBase + ' text-tl-dark-medium';
  }

  ngOnInit(): void {
    this.getPriceToFilter();
  }

  async getPriceToFilter(){
    try {
      const response:GraphResponse = await this.storeService.getPricesToFilter();
      if(response.errors) throw(response.errors);
      const  { 0:prices } = response.data.getPrices;
      this.pricesFilter = JSON.parse(prices);
      console.log("🚀 ~ getPriceToFilter ~ pricesFilter:", this.pricesFilter);
    } catch (error) {
      console.log("🚀 ~ getPriceToFilter ~ error:", error)
    }
  }

  formatLabel(value: number): string {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}`;
    }

    return `${value}`;
  }

  close(){
    this.dialog.closeAll();
  }

  filterByPrice(){
    this.payloadOrderPrice.maxPrice = this.maxPrice;
    this.payloadOrderPrice.minPrice = this.minPrice;

    if(typeof this.maxPrice == 'string'){
      this.payloadOrderPrice.maxPrice = parseFloat(this.maxPrice);
    }

    if(typeof this.minPrice == 'string'){
      this.payloadOrderPrice.minPrice = parseFloat(this.minPrice);
    }

    this.dialogRef.close(this.payloadOrderPrice)
  }

  onSlideRange( value:number, type: 'min' | 'max'){
    if(type == 'max') {
      this.maxPrice = value;
    } else {
      this.minPrice = value;
    }
  }

  onChangeOrderFilterPrice(event:MatRadioChange){
    const op = event.value as ORDER_PRICE;
    this.payloadOrderPrice.orderPrice = op;
  }

  onToggleBuyOp(event:any){
    const {checked} = event.target;
    this.payloadOrderPrice.optionBuy = checked;
  }

  onChangePeriod(event:MatRadioChange){

    if(event.value == 'day') this.pricesLimitFilter = this.pricesFilter.daily;
    if(event.value == 'week') this.pricesLimitFilter = this.pricesFilter.weekly;
    if(event.value == 'month') this.pricesLimitFilter = this.pricesFilter.monthly;

    this.payloadOrderPrice.periodFilter = event.value;
    this.payloadOrderPrice.limitPrice = this.pricesLimitFilter;

    // this.barChartData.datasets = [{
    //   data: Array.from({length: 14}, (_, i) => parseFloat(this.pricesLimitFilter.max) / 15 ),
    //   backgroundColor: ["#E0EBF3"]
    // }]
  }
}
