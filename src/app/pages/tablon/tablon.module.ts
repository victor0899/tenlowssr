import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablonRoutingModule } from './tablon-routing.module';
import { TableRequestsComponent } from './table-requests/table-requests.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LazyLoadImageModule } from 'ng-lazyload-image';


@NgModule({
  declarations: [
    TableRequestsComponent
  ],
  imports: [
    CommonModule,
    TablonRoutingModule,
    PipesModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    ReactiveFormsModule,
    ComponentsModule,
    MatTooltipModule,
    LazyLoadImageModule
  ]
})
export class TablonModule { }
