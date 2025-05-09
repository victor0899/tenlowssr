import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { ChekoutComponent } from './chekout/chekout.component';
import { StoreComponent } from './store/store.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ConfirmComponent } from './confirm/confirm.component';

const locale = localStorage.getItem('tenlow:lang');
const lang = !locale || locale == 'es' ? 'es' : 'en';

const routes: Routes = [
  {
    path: '',
    redirectTo: `${lang == "es" ? 'tienda' : 'store'}`,
    pathMatch: 'full'
  },
  {
    path: `${lang == "es" ? 'tienda' : 'store'}`,
    component: StoreComponent
  },
  {
    path: `${lang == "es" ? 'confirmar' : 'confirm'}`,
    component: ConfirmComponent
  },
  {
    path: `${lang == "es" ? 'tienda/categoria/:categoria/:id' : 'store/category/:category/:id'}`,
    component: StoreComponent
  },
  {
    path: `${lang == "es" ? 'buscar/:query' : 'search/:query'}`,
    component: StoreComponent
  },
  {
    path: `${lang == "es" ? 'verificar' : 'checkout'}`,
    component: ChekoutComponent,
    canActivate: [AuthGuard],
    data: { preload: true }
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class StoreRoutingModule { }