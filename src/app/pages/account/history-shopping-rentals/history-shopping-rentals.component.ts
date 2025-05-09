import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OPERATIONS_TYPE } from 'src/app/interfaces/history';
import { LangService } from 'src/app/services/lang.service';

enum VIEWS_HISTORY {
  RENTALS,
  SHOPPINGS,
  SALES
}

@Component({
  selector: 'app-history-shopping-rentals',
  templateUrl: './history-shopping-rentals.component.html',
  styleUrls: ['./history-shopping-rentals.component.scss']
})
export class HistoryShoppingRentalsComponent {

  views = VIEWS_HISTORY;
  typeOperations = OPERATIONS_TYPE;
  nameComponent: VIEWS_HISTORY = VIEWS_HISTORY.RENTALS;
  selectedIndex: number = 0;

  constructor(
    private router: Router,
    private lang: LangService,
  ){}

  setViewRender(view: VIEWS_HISTORY, index:number){
    this.nameComponent = view;
    this.selectedIndex = index;
  }

  back(){
    this.router.navigate([this?.lang?._locale == 'es' ? 'cuenta/opciones' :'account/options']);
  }
}
