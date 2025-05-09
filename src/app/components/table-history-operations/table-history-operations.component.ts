import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { GraphResponse } from 'src/app/interfaces/graph';
import { HistoryInfo, OPERATIONS_TYPE } from 'src/app/interfaces/history';
import { PaginatorInfo } from 'src/app/interfaces/public';
import { OperationStatus } from 'src/app/interfaces/store';
import { OperationType } from 'src/app/interfaces/store';
import { OperationShippingMethod } from 'src/app/interfaces/store';
import { GlobalService } from 'src/app/services/global.service';
import { HistoryService } from 'src/app/services/history.service';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'table-history-operations',
  templateUrl: './table-history-operations.component.html',
  styleUrls: ['./table-history-operations.component.scss']
})
export class TableHistoryOperationsComponent implements OnInit{
  @ViewChild('matPaginator') matPaginator!: MatPaginator;
  @Input() type!: OPERATIONS_TYPE;

  paginator!: PaginatorInfo;
  currentPage: number = 1;
  pageEvent!: PageEvent;
  pagesIndex: Array<number> = [];
  isLoad: boolean = true;
  data: Array<HistoryInfo> = [];

  msgEmpty:string = "";

  constructor(
    private historyService: HistoryService,
    private globalService: GlobalService,
    public publicService: PublicService
  ) {}

  ngOnInit(){

    const keyMessages = {
      rental: "pages.history.msg_rental_table_empty",
      purchase: "pages.history.msg_purchase_table_empty",
      sale: "pages.history.msg_sales_table_empty"
    }

    this.msgEmpty = keyMessages[this.type];

    if (!this.data.length) {
      this.getPaginatedData();
    }
  }

  async getPaginatedData(){
    try {
      const response: GraphResponse = await this.historyService.getHistoryOperations(this.currentPage, this.type);
      console.log("🚀 ~ getPaginatedData ~ response:", response.data.record);
      if(response.errors) throw(response.errors);
      const { record } = response.data;
      this.paginator = record.paginatorInfo;
      this.pagesIndex = [...Array(this.paginator.lastPage).keys()];
      this.data = record.data;
      this.isLoad = false;
    } catch (error) {
      this.isLoad = false;
      console.log("🚀 ~ getPaginatedData ~ error:", error)
    }
  }

  selectPage(indexPage:number){
    this.isLoad = true;
    this.currentPage = indexPage;
    // this.getPaginatedProducts();
  }

  getTextShippingType( shipping: OperationShippingMethod ){
    const texts = {
      in_person: "labels.in_person",
      my_adress: "labels.my_adress",
      delivery_address: "labels.delivery_address"
    };

    return texts[shipping] ?? shipping;
  }

  getTextOperationType( operation: OperationType ){
    const texts = {
      rental: "labels.rental",
      purchase: "labels.purchase",
      sale: "labels.sale"
    };

    return texts[operation] ?? operation;
  }

  getTextState( status: OperationStatus ){
    const texts = {
      created: "labels.created",
      confirmed: "labels.confirmed",
      finished: "labels.finished",
      canceled_by_locator: "labels.canceled_by_locator",
      canceled_by_locatario: "labels.canceled_by_locatario",
      canceled_by_admin: "labels.canceled_by_admin",
      received: "received",
      delivered: "delivered"
    };
    return texts[status] ?? status;
  }

  handlePageEvent(e: PageEvent) {

    if(e.previousPageIndex == undefined) return;

    this.isLoad = true;
    this.pageEvent = e;

    const isGoingBack = e.previousPageIndex > this.matPaginator.pageIndex;
    this.currentPage += isGoingBack ? -1 : 1;


    if(this.currentPage > this.paginator.lastPage) return;

    // this.getPaginatedProducts();
  }

}
