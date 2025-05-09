import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { AddProductComponent } from './add-product/add-product.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule} from '@angular/material/slider';
import { DetailProductComponent } from './detail-product/detail-product.component';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GoogleMapsModule } from '@angular/google-maps';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';


@NgModule({
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [
    AddProductComponent,
    DetailProductComponent,
    ManageProductsComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    PipesModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    ComponentsModule,
    MatRadioModule,
    MatInputModule,
    MatAutocompleteModule,
    GoogleMapsModule,
    GooglePlaceModule,
    DirectivesModule,
    LazyLoadImageModule
  ]
})
export class ProductsModule { }
