import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';
import { LangService } from 'src/app/services/lang.service';
import { SeoService } from 'src/app/services/seo.service';
import { RedirectService } from 'src/app/services/redirect.service';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss']
})
export class Page404Component implements AfterViewInit{

  options: AnimationOptions = {
    path: '/assets/images/404.json',
  };

  constructor(
    private route: Router,
    private lang: LangService,
    private seo: SeoService,
    private redirectService: RedirectService
  ) {}

  ngOnInit() {
    this.seo.metaService.updateTag({ 
      name: 'robots', 
      content: 'noindex, nofollow' 
    });
    
    this.seo.addSeoHeader({
      title: this.lang._locale === 'es' ? 'Página no encontrada' : 'Page Not Found',
      name: 'TenLow',
      description: this.lang._locale === 'es' 
        ? 'La página que estás buscando no existe o ha sido movida' 
        : 'The page you are looking for does not exist or has been moved'
    });
  }

  ngAfterViewInit(): void {
    const linkNewSearch = document.querySelector('.new-search');
    linkNewSearch?.addEventListener('click', () => {
      this.route.navigate([this.lang._locale == 'es' ? 'compras/tienda' : '/shopping/store']);
    })
  }

  animationCreated(animationItem: AnimationItem): void {
    console.log(animationItem);
  }
}
