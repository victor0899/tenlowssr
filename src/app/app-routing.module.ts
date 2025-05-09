import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { OdsInfoComponent } from './pages/ods-info/ods-info.component';
import { Page404Component } from './pages/page404/page404.component';
import { HelpPageComponent } from './pages/panel-user/help-page/help-page.component';
import { LangService } from 'src/app/services/lang.service';
import { DashboardUserComponent } from './pages/panel-user/dashboard-user/dashboard-user.component';
import { GET_LANG } from './GraphQL/global';
import { lastValueFrom } from 'rxjs';
import { UrlFormatterGuard } from './guards/url-formatter.guard';
import { AdminDomainGuard } from './guards/admin-domain.guard';

const locale = localStorage.getItem('tenlow:lang');
const lang = !locale || locale == 'es' ? 'es' : 'en'

// Definir el módulo de la tienda precargado
export function loadStoreModule() {
  return import('./pages/store/store.module').then(m => m.StoreModule);
}

const routes: Routes = [
  {
    path: '',
    canActivate: [UrlFormatterGuard, AdminDomainGuard],
    children: [
      {
        path: '',
        redirectTo: `app`,
        pathMatch: 'full'
      },
      {
        path: `${lang == "es" ? "autentificacion" : 'auth'}`,
        loadChildren: () => import('./pages/auth/auth.module').then((m) => m.AuthModule),
        canActivate: [NoAuthGuard]
      },
      {
        path: `app`,
        loadChildren: () => import('./pages/home/home.module').then((m) => m.HomeModule)
      },
      {
        path: `${lang == "es" ? "producto" : 'products'}`,
        loadChildren: () => import('./pages/products/products.module').then((m) => m.ProductsModule)
      },
      {
        path: `${lang == "es" ? "compras" : "shopping"}`,
        loadChildren: loadStoreModule,
        data: { preload: true }
      },
      {
        path: `${lang == "es" ? "tablon" : 'tablon'}`,
        loadChildren: () => import('./pages/tablon/tablon.module').then((m) => m.TablonModule)
      },
      {
        path: `${lang == "es" ? "cuenta" : 'account'}`,
        loadChildren: () => import('./pages/account/account.module').then((m) => m.AccountModule),
        canActivate: [AuthGuard]
      },
      {
        path: `about`,
        loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutModule)
      },
      {
        path: `${lang == "es" ? "perfil-usuario" : 'profile-user'}`,
        loadChildren: () => import('./pages/panel-user/panel-user.module').then((m) => m.PanelUserModule),
        canActivate: [AuthGuard]
      },
      {
        path: `${lang == "es" ? "usuario/:id" : 'user/:id'}`,
        component: DashboardUserComponent
      },
      {
        path: 'faqs',
        component: HelpPageComponent
      },
      {
        path: 'sustainable-development-goals',
        component: OdsInfoComponent
      },
      // Ruta comodín que captura todo antes de mostrar página 404
      {
        path: '**',
        component: Page404Component
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    preloadingStrategy: PreloadAllModules,
    // Esto reduce el tiempo de aparición de la página 404
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always',
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }