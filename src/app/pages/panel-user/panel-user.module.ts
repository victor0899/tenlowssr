import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelUserRoutingModule } from './panel-user-routing.module';
import { DashboardUserComponent } from './dashboard-user/dashboard-user.component';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { MatTabsModule } from '@angular/material/tabs';
import { HelpPageComponent } from './help-page/help-page.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    DashboardUserComponent,
    HelpPageComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    PanelUserRoutingModule,
    MatProgressSpinnerModule,
    PipesModule,
    MatTabsModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    LazyLoadImageModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class PanelUserModule { }
