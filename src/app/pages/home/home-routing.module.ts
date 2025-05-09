import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAppComponent } from './home-app/home-app.component';

const locale = localStorage.getItem('tenlow:lang');
const lang =  !locale || locale == 'es' ? 'es' : 'en' 

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: `${lang == 'es' ? 'inicio' : 'home'}`,
        pathMatch: 'full'
      },
      {
        path: `${lang == 'es' ? 'inicio' : 'home'}`,
        component: HomeAppComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
