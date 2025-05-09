import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { MenuOptionsComponent } from './menu-options/menu-options.component';
import { ManageProfileComponent } from './manage-profile/manage-profile.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { PaymentsPanelComponent } from './payments-panel/payments-panel.component';
import { ChatNotificationsComponent } from './chat-notifications/chat-notifications.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { HistoryShoppingRentalsComponent } from './history-shopping-rentals/history-shopping-rentals.component';
import { ManageFavoritesComponent } from './manage-favorites/manage-favorites.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { ConfigurationAccountComponent } from './configuration-account/configuration-account.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleMapsModule } from '@angular/google-maps';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
      MenuOptionsComponent,
      ManageProfileComponent,
      PaymentsPanelComponent,
      ChatNotificationsComponent,
      HistoryShoppingRentalsComponent,
      ManageFavoritesComponent,
      ConfigurationAccountComponent,
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    PipesModule,
    MatMenuModule,
    MatIconModule,
    ComponentsModule,
    MatRippleModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    GoogleMapsModule,
    GooglePlaceModule,
    LazyLoadImageModule,
    MatTabsModule,
    MatExpansionModule,
    FormsModule,
    MatTooltipModule
  ]
})
export class AccountModule { }
