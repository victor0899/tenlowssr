import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddProductComponent } from './add-product/add-product.component';
import { DetailProductComponent } from './detail-product/detail-product.component';
import { ManageProductsComponent } from './manage-products/manage-products.component';
import { AuthGuard } from 'src/app/guards/auth.guard';


const locale = localStorage.getItem('tenlow:lang');
const lang =  !locale || locale == 'es' ? 'es' : 'en' 

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: `${lang == "es" ? 'nuevo-producto' : 'add-product'}`,
        pathMatch: 'full'
      },
      {
        path: `${lang == "es" ? 'nuevo-producto' : 'add-product'}`,
        component: AddProductComponent,
        canActivate: [AuthGuard]
      },
      {
        path: `${lang == "es" ? 'gestionar-productos' : 'manage-products'}`,
        component: ManageProductsComponent
      },
      {
        path: ':title/:id',
        component: DetailProductComponent
      },
      {
        path: `${lang == "es" ? ':title/:id/editar' : ':title/:id/edit'}`,
        component: AddProductComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
