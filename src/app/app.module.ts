import { DEFAULT_CURRENCY_CODE, NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Page404Component } from './pages/page404/page404.component';
import { ComponentsModule } from './components/components.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgChartsModule } from 'ng2-charts';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { GraphQLModule } from './graphql.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PipesModule } from './pipes/pipes.module';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getEnPaginatorIntl, getEspPaginatorIntl } from './esp-paginator-intl';
import { FormsModule } from '@angular/forms';
import { OdsInfoComponent } from './pages/ods-info/ods-info.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { RedirectService } from './services/redirect.service';
import { UrlFormatterService } from './services/url-formatter.service';
import { UrlFormatterGuard } from './guards/url-formatter.guard';

function configureGoogleAnalytics() {
  return () => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        'link_attribution': {
          'cookie_flags': 'SameSite=None;Secure',
          'cookie_domain': 'tenlow.es',
          'cookie_expires': 0
        },
        'page_path': window.location.pathname,
        'linker': {
          'domains': ['tenlow.es', 'app.tenlow.es'],
          'accept_incoming': true,
          'decorate_forms': true
        }
      });
    }
  };
}

const locale = localStorage.getItem('tenlow:lang');

const getMatLocale = () => {
  if (!locale || locale == 'es') {
    return 'es-ES';
  }
  return 'en-US';
};

const getPaginatorLocale = () => {
  if (!locale || locale == 'es') {
    return getEspPaginatorIntl();
  }
  return getEnPaginatorIntl();
};

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent,
    Page404Component,
    OdsInfoComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgChartsModule,
    NgxDaterangepickerMd.forRoot(),
    GraphQLModule,
    MatSidenavModule,
    PipesModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    LottieModule.forRoot({ player: playerFactory }),
    LazyLoadImageModule,
    ComponentsModule
  ],
  providers: [
    UrlFormatterService,
    UrlFormatterGuard,
    { provide: MAT_DATE_LOCALE, useFactory: getMatLocale },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
    { provide: MatPaginatorIntl, useFactory: getPaginatorLocale },
    RedirectService,
    // Configura Google Analytics correctamente
    {
      provide: APP_INITIALIZER,
      useFactory: () => configureGoogleAnalytics(),
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }