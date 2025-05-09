import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomePaq } from 'src/app/interfaces/rental';
import { RentalService } from 'src/app/services/rental.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-select-collect-point',
  templateUrl: './select-collect-point.component.html',
  styleUrls: ['./select-collect-point.component.scss']
})
export class SelectCollectPointComponent implements OnInit {

  collectPoints:HomePaq[] = [];
  pointSelected!:HomePaq;

  constructor(
    private storeService: StoreService,
    private rentalService: RentalService,
    private dialogRef: MatDialogRef<SelectCollectPointComponent>,
    @Inject(MAT_DIALOG_DATA) public params: {offices: HomePaq[],selected:HomePaq}
  ){
    console.log("🚀 ~ params:", params)
    this.collectPoints = this.params.offices;
    this.pointSelected = this.params.selected;
  }

  ngOnInit(): void {
    // this.storeService.getNearPostOffices();
  }

  selectPoint( item: HomePaq ){
    this.pointSelected = item;
  }

  confirmSelection(){
    this.dialogRef.close(this.pointSelected);
  }
}
