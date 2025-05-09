import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { LocaleConfig } from 'ngx-daterangepicker-material';
import { ChosenDate } from 'ngx-daterangepicker-material/daterangepicker.component';
import { PERIOD_RENTAL, RangeDateSelected, OperationStatus, ProductOperation } from 'src/app/interfaces/store';
import { DaterangepickerComponent } from 'ngx-daterangepicker-material';
import { LangService } from 'src/app/services/lang.service';
import { StoreService } from 'src/app/services/store.service';
import { GlobalService } from 'src/app/services/global.service';
import * as moment from 'moment';

@Component({
  selector: 'app-filter-availability',
  templateUrl: './filter-availability.component.html',
  styleUrls: ['./filter-availability.component.scss']
})
export class FilterAvailabilityComponent implements OnInit {
  @ViewChild('materialSelect') materialSelect!: DaterangepickerComponent;

  minDate = dayjs().format('MM/DD/YYYY');
  maxDate = dayjs().add(1, 'year').format('MM/DD/YYYY');
  isLoading = true;
  unavailableDates: Set<string> = new Set();

  locale: LocaleConfig = {
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.months(),
    firstDay: moment.localeData().firstDayOfWeek(),
    format: 'DD/MM/YYYY',
    displayFormat: 'DD/MM/YYYY',
    separator: ' - ',
    applyLabel: 'Aplicar',
    cancelLabel: 'Cancelar',
    customRangeLabel: 'Personalizado'
  }

  dateRangeSelected: ChosenDate = {
    chosenLabel: '',
    startDate: dayjs(),
    endDate: dayjs()
  };

  startDay = dayjs();
  endDay = dayjs();
  isShowCalendar: boolean = false;

  constructor(
    private lang: LangService,
    private storeService: StoreService,
    private globalService: GlobalService,
    public dialogRef: MatDialogRef<FilterAvailabilityComponent>,
    @Inject(MAT_DIALOG_DATA) public params: {
      dateParams: ChosenDate, 
      dateSelected: RangeDateSelected, 
      period: PERIOD_RENTAL,
      productId: string
    }
  ) {
    this.setRangeParams();
  }

  async ngOnInit() {
    await this.loadReservedDates();
    setTimeout(() => {
      this.isLoading = false;
      this.isShowCalendar = true;
    }, 300);
  }

  async loadReservedDates() {
    try {
      const response = await this.storeService.getOperationsByProductAndStatus(
        this.params.productId,
        OperationStatus.confirmed
      );

      const operations: ProductOperation[] = response.data?.operationsByProductAndStatus || [];
      
      operations.forEach((operation: ProductOperation) => {
        let currentDate = dayjs(operation.init_date);
        const endDate = dayjs(operation.end_date);

        while (!currentDate.isAfter(endDate)) {
          this.unavailableDates.add(currentDate.format('YYYY-MM-DD'));
          currentDate = currentDate.add(1, 'day');
        }
      });

    } catch (error) {
      console.error('Error loading reserved dates:', error);
      this.globalService.showToast(
        this.lang._('messages.error_loading_dates'),
        'Error',
        'top'
      );
    }
  }

  isDateDisabled = (date: Dayjs): boolean => {
    if (date.isBefore(dayjs(), 'day')) return true;
    return this.unavailableDates.has(date.format('YYYY-MM-DD'));
  }

  async onRangeClicked(event: ChosenDate) {
    if (!event.startDate || !event.endDate) return;

    let currentDate = event.startDate;
    const endDate = event.endDate;
    let isRangeAvailable = true;

    while (!currentDate.isAfter(endDate)) {
      if (this.unavailableDates.has(currentDate.format('YYYY-MM-DD'))) {
        isRangeAvailable = false;
        break;
      }
      currentDate = currentDate.add(1, 'day');
    }

    if (isRangeAvailable) {
      this.dateRangeSelected = event;
    } else {
      this.globalService.showToast(
        this.lang._('messages.dates_not_available'),
        'Error',
        'top'
      );
      this.dateRangeSelected = {
        chosenLabel: '',
        startDate: dayjs(),
        endDate: dayjs()
      };
    }
  }

  setRangeParams() {
    if (!this.params) return;

    if (Boolean(this.params.dateParams)) {
      const { dateParams } = this.params;
      this.startDay = dateParams.startDate;
      this.endDay = dateParams.endDate;
      this.dateRangeSelected = dateParams;
    }

    if (Boolean(this.params.dateSelected)) {
      const { period, dateSelected } = this.params;
      if (!dateSelected[period]) return;
      const { startDate, endDate } = dateSelected[period];

      this.startDay = startDate;
      this.endDay = endDate;
      this.dateRangeSelected = dateSelected[period];
    }
  }

  close() {
    this.dateRangeSelected = {
      chosenLabel: '',
      startDate: dayjs(),
      endDate: dayjs()
    };
    this.startDay = dayjs();
    this.endDay = dayjs();
    this.dialogRef.close();
  }

  onSelectRange() {
    if (this.dateRangeSelected.chosenLabel == '') {
      this.close();
      return;
    }
    this.dialogRef.close(this.dateRangeSelected);
  }
}