import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreRoutingModule } from './store-routing.module';
import { ChekoutComponent } from './chekout/chekout.component';
import { StoreComponent } from './store/store.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ComponentsModule } from 'src/app/components/components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmComponent } from './confirm/confirm.component';

@NgModule({
  declarations: [
    ChekoutComponent,
    StoreComponent,
    ConfirmComponent,
  ],
  imports: [
    CommonModule,
    StoreRoutingModule,
    PipesModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    ComponentsModule,
    MatPaginatorModule,
    MatIconModule,
    GoogleMapsModule,
    GooglePlaceModule,
    DirectivesModule,
    MatProgressSpinnerModule
  ]
})
export class StoreModule { }
