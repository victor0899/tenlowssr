import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HowWorksTenlowComponent } from './how-works-tenlow/how-works-tenlow.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { TermsUseComponent } from './terms-use/terms-use.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ManageCookiesComponent } from 'src/app/pages/about/manage-cookies/manage-cookies.component';


const locale = localStorage.getItem('tenlow:lang');
const lang =  !locale || locale == 'es' ? 'es' : 'en' 

const routes: Routes = [
  {
    path:'',
    component: AboutUsComponent
  },
  {
    path: `how-works`,
    component: HowWorksTenlowComponent
  },
  {
    path: `terms-and-conditions`,
    component: TermsUseComponent
  },
  {
    path: `privacy-policy`,
    component: PrivacyPolicyComponent
  },
  {
    path: "legal",
    component: PrivacyPolicyComponent
  },
  {
    path: "cookies",
    component: PrivacyPolicyComponent
  },
  {
    path: `${lang == 'es' ? 'manejo-de-cookies' : "cookies-manage"}`,
    component: ManageCookiesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutRoutingModule { }
