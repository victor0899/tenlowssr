import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardUserComponent } from './dashboard-user/dashboard-user.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { AuthGuard } from 'src/app/guards/auth.guard';


const locale = localStorage.getItem('tenlow:lang');
const lang =  !locale || locale == 'es' ? 'es' : 'en' 

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: `${lang == 'es' ? 'panel' : 'dashboard'}`,
        pathMatch: 'full'
      },
      {
        path: `${lang == 'es' ? 'panel' : 'dashboard'}`,
        component: DashboardUserComponent,
        canActivate: [AuthGuard]
      },
      {
        path:  `${lang == 'es' ? 'ayuda' : 'help'}`,
        component: HelpPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelUserRoutingModule { }
