import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { HowWorksTenlowComponent } from './how-works-tenlow/how-works-tenlow.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AboutUsComponent } from './about-us/about-us.component';
import { MatIconModule } from '@angular/material/icon';
import { TermsUseComponent } from './terms-use/terms-use.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { ManageCookiesComponent } from './manage-cookies/manage-cookies.component';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    HowWorksTenlowComponent,
    AboutUsComponent,
    TermsUseComponent,
    PrivacyPolicyComponent,
    ManageCookiesComponent
  ],
  imports: [
    CommonModule,
    AboutRoutingModule,
    PipesModule,
    MatIconModule,
    ComponentsModule,
    MatCheckboxModule
  ]
})
export class AboutModule { }
