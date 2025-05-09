import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ChatNotificationsComponent } from './chat-notifications/chat-notifications.component';
import { ConfigurationAccountComponent } from './configuration-account/configuration-account.component';
import { HistoryShoppingRentalsComponent } from './history-shopping-rentals/history-shopping-rentals.component';
import { ManageFavoritesComponent } from './manage-favorites/manage-favorites.component';
import { ManageProfileComponent } from './manage-profile/manage-profile.component';
import { MenuOptionsComponent } from './menu-options/menu-options.component';
import { PaymentsPanelComponent } from './payments-panel/payments-panel.component';

const locale = localStorage.getItem('tenlow:lang');
const lang =  !locale || locale == 'es' ? 'es' : 'en' 

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: `${lang == 'es' ? 'opciones' : 'options'}`,
        pathMatch: 'full',
      },
      {
        path: `${lang == 'es' ? 'opciones' : 'options'}`,
        component: MenuOptionsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: `${lang == 'es' ? 'panel-usuario' : 'panel-user'}`,
        component: ManageProfileComponent
      },
      {
        path: `${lang == 'es' ? 'panel-usuario/editar/:option' : 'panel-user/edit/:option'}`,
        component: ManageProfileComponent
      },
      {
        path: `${lang == 'es' ? 'panel-pagos' : 'payments-panel'}`,
        component: PaymentsPanelComponent
      },
      {
        path: `${lang == 'es' ? 'panel-notificaciones' : 'notifications-panel'}`,
        component: ChatNotificationsComponent
      },
      {
        path: `${lang == 'es' ? 'panel-historial' : 'history-panel'}`,
        component: HistoryShoppingRentalsComponent
      },
      {
        path: `${lang == 'es' ? 'panel-favoritos' : 'favorites-panel'}`,
        component: ManageFavoritesComponent
      },
      {
        path: `${lang == 'es' ? 'panel-configuracion' : 'configuration-panel'}`,
        component: ConfigurationAccountComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
