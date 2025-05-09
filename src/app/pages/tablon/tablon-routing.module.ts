import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableRequestsComponent } from './table-requests/table-requests.component';

const locale = localStorage.getItem('tenlow:lang');
const lang =  !locale || locale == 'es' ? 'es' : 'en' 

const routes: Routes = [
  {
    path: '',
    children:[
      {
        path:'',
        pathMatch:  'full',
        redirectTo: `${lang == 'es' ? 'tablon-solicitudes' : 'table-requests'}`
      },
      {
        path: `${lang == 'es' ? 'tablon-solicitudes' : 'table-requests'}`,
        component: TableRequestsComponent
      },
      {
        path:  `${lang == 'es' ? 'mi-peticion/:id' : 'my-petition/:id'}`,
        component: TableRequestsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TablonRoutingModule { }
