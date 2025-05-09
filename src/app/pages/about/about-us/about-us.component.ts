import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent {
  logo: string = "";
  constructor(
    private router: Router,
    public publicService: PublicService
  ){
    this.logo = publicService.logo;
  }

  async navigate(route:string){
    this.router.navigateByUrl(route);
  }
}
