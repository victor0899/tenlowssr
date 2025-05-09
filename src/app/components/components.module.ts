import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { AppNavbarComponent } from './app-navbar/app-navbar.component';
import { PipesModule } from '../pipes/pipes.module';
import { RouterModule } from '@angular/router';
import { FilterCategoryComponent } from './modals/filter-category/filter-category.component';
import { FilterPriceComponent } from './modals/filter-price/filter-price.component';
import { CardProductComponent } from './card-product/card-product.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SocialAuthButtonsComponent } from './social-auth-buttons/social-auth-buttons.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgChartsModule } from 'ng2-charts';
import { FilterAvailabilityComponent } from './modals/filter-availability/filter-availability.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { LoaderOverlayComponent } from './loader-overlay/loader-overlay.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalLoginComponent } from './auth/modal-login/modal-login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ModalRegisterComponent } from './auth/modal-register/modal-register.component';
import { SelectProductTablonComponent } from './modals/select-product-tablon/select-product-tablon.component';
import { ModalRecoveryPasswordComponent } from './auth/modal-recovery-password/modal-recovery-password.component';
import { ModalInfoComponent } from './modals/modal-info/modal-info.component';
import { DeleteAccountComponent } from './modals/delete-account/delete-account.component';
import { UpdatePasswordComponent } from './modals/update-password/update-password.component';
import { LoaderCardProductComponent } from './loader-card-product/loader-card-product.component';
import { FilterByMapComponent } from './filter-by-map/filter-by-map.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { EmptyViewComponent } from './empty-view/empty-view.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NoResultsComponent } from './no-results/no-results.component';
import { ModalConfirmComponent } from './modals/modal-confirm/modal-confirm.component';
import { CardFavProfileComponent } from './card-fav-profile/card-fav-profile.component';
import { TableHistoryOperationsComponent } from './table-history-operations/table-history-operations.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UpdateEmailComponent } from './modals/update-email/update-email.component';
import { UpdatePhoneComponent } from './modals/update-phone/update-phone.component';
import { CheckCodeRentalComponent } from './modals/check-code-rental/check-code-rental.component';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { NameProductActionsComponent } from './name-product-actions/name-product-actions.component';
import { ModalReportUserComponent } from './modals/modal-report-user/modal-report-user.component';
import { BadgeNotificationComponent } from './badge-notification/badge-notification.component';
import { PaymentComponent } from './stripe/stripe.component';
import { SelectCollectPointComponent } from './modals/select-collect-point/select-collect-point.component';
import { SharedContentComponent } from './modals/shared-content/shared-content.component';
import { ModalCancelRentalComponent } from './modals/modal-cancel-rental/modal-cancel-rental.component';
import { ModalRatingComponent } from './modals/modal-rating/modal-rating.component';
import { CardRatingComponent } from './card-rating/card-rating.component';
import { TermsEsComponent } from './legal/terms-es/terms-es.component';
import { PrivacyEsComponent } from './legal/privacy-es/privacy-es.component';
import { AlertCookiesComponent } from './alert-cookies/alert-cookies.component';
import { AddBankAccountModal } from './modals/modal-bank-account/modal-bank-account.component';
import { ModalConfirmStripeComponent } from './modals/modal-stripe-confirm/modal-stripe-confirm.component';
import { ModalInfoBank } from './modals/modal-info-bank/modal-info-bank.component';

@NgModule({
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ],
  imports: [
    CommonModule,
    PipesModule,
    RouterModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    MatSliderModule,
    MatCheckboxModule,
    NgChartsModule,
    NgxDaterangepickerMd,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCheckboxModule,
    FormsModule,
    GoogleMapsModule,
    GooglePlaceModule,
    MatRadioModule,
    LazyLoadImageModule,
    MatAutocompleteModule,
    MatPaginatorModule
  ],
  declarations: [
    AppFooterComponent,
    AppNavbarComponent,
    FilterCategoryComponent,
    FilterPriceComponent,
    CardProductComponent,
    SocialAuthButtonsComponent,
    FilterAvailabilityComponent,
    LoaderOverlayComponent,
    ModalLoginComponent,
    ModalRegisterComponent,
    SelectProductTablonComponent,
    ModalRecoveryPasswordComponent,
    ModalInfoComponent,
    ModalConfirmStripeComponent,
    ModalInfoBank,
    DeleteAccountComponent,
    UpdatePasswordComponent,
    LoaderCardProductComponent,
    FilterByMapComponent,
    EmptyViewComponent,
    SearchbarComponent,
    NoResultsComponent,
    ModalConfirmComponent,
    CardFavProfileComponent,
    TableHistoryOperationsComponent,
    UpdateEmailComponent,
    UpdatePhoneComponent,
    CheckCodeRentalComponent,
    ChatViewComponent,
    NameProductActionsComponent,
    ModalReportUserComponent,
    BadgeNotificationComponent,
    PaymentComponent,
    SelectCollectPointComponent,
    SharedContentComponent,
    ModalCancelRentalComponent,
    ModalRatingComponent,
    CardRatingComponent,
    TermsEsComponent,
    PrivacyEsComponent,
    AlertCookiesComponent,
    AddBankAccountModal
  ],
  exports:[
    AppFooterComponent,
    AppNavbarComponent,
    FilterCategoryComponent,
    CardProductComponent,
    FilterPriceComponent,
    SocialAuthButtonsComponent,
    FilterAvailabilityComponent,
    LoaderOverlayComponent,
    ModalLoginComponent,
    ModalRegisterComponent,
    ModalConfirmStripeComponent,
    ModalInfoBank,
    ModalInfoComponent,
    LoaderCardProductComponent,
    FilterByMapComponent,
    EmptyViewComponent,
    SearchbarComponent,
    NoResultsComponent,
    CardFavProfileComponent,
    TableHistoryOperationsComponent,
    UpdateEmailComponent,
    ChatViewComponent,
    NameProductActionsComponent,
    CardRatingComponent,
    TermsEsComponent,
    PrivacyEsComponent,
    AlertCookiesComponent,
    BadgeNotificationComponent,
    PaymentComponent,
  ]
})
export class ComponentsModule { }
