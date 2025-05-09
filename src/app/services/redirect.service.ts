import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { LangService } from './lang.service';
import { UrlFormatterService } from './url-formatter.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private routesEn: string = '/assets/lang/routesEn.json';
  private routesEs: string = '/assets/lang/routesEs.json';
  
  private externalRedirects: Record<string, string> = {
    'about/how-works': 'https://tenlow.es/como-funciona/',
    'app/home': 'https://tenlow.es/',
    'app/inicio': 'https://tenlow.es/',
    'about': 'https://tenlow.es/nosotros/',
    'about/privacy-policy': 'https://tenlow.es/privacidad',
    'about/legal': 'https://tenlow.es/aviso-legal',
    'about/cookies': 'https://tenlow.es/cookies/',
    'about/terms-and-conditions': 'https://tenlow.es/terminos-condiciones/',
    'faqs': 'https://tenlow.es/preguntas_frecuentes/',
    'sustainable-development-goals': 'https://tenlow.es/eco_fiendly/',
    'quienes-somos': 'https://tenlow.es/nosotros/',
  };

  constructor(
    private router: Router,
    private lang: LangService,
    private urlFormatter: UrlFormatterService,
    private http: HttpClient,
    private productService: ProductService
  ) {}

  /**
   * Método general para manejar cualquier tipo de navegación en la aplicación
   */
  async navigateTo(route: string, options: {
    closeDrawer?: () => void,
    currentUrl?: string,
    replaceUrl?: boolean
  } = {}): Promise<void> {
    // Si es una URL externa completa
    if (route.includes('https://')) {
      window.location.href = route;
      if (options.closeDrawer) options.closeDrawer();
      return;
    }
    
    const url = route.startsWith('/') ? route.slice(1) : route;
    
    // Caso especial para añadir productos
    if (route === 'products/add-product') {
      const basePath = this.lang._locale === 'es' ? '/producto/nuevo-producto' : '/products/add-product';
      await this.router.navigate([basePath], { skipLocationChange: false });
      if (options.closeDrawer) options.closeDrawer();
      return;
    }

    // Si ya estamos en la misma URL
    if (options.currentUrl === route) {
      this.productService.eventAddOtherProduct.next(true);
      if (options.closeDrawer) options.closeDrawer();
      return;
    }
    
    // Obtener traducciones de rutas
    const response: any = await lastValueFrom(
      this.http.get(this.lang._locale === 'es' ? this.routesEs : this.routesEn)
    );
    
    let segments = url.split('/');
    let translatedSegments = segments.map(segment => {
      return response[segment] || segment;
    });
    let translatedString = translatedSegments.join('/');
    
    // Manejar redirecciones externas
    if (this.externalRedirects[translatedString]) {
      window.location.href = this.externalRedirects[translatedString];
      if (options.closeDrawer) options.closeDrawer();
      return;
    }
    
    const formattedUrl = this.urlFormatter.formatPath(translatedString);
    const localizedUrl = this.urlFormatter.getLocalizedPath(formattedUrl);
    
    console.log('Navegando a:', localizedUrl);
    
    const navigationExtras: NavigationExtras = {
      skipLocationChange: false // Asegurarse de que la navegación se muestre en la historia
    };
    
    if (options.replaceUrl) {
      navigationExtras.replaceUrl = true;
    }
    
    // Usar el Router para la navegación interna (evita los parámetros de GA)
    await this.router.navigate(['/' + localizedUrl], navigationExtras);
    
    if (options.closeDrawer) options.closeDrawer();
  }

  redirectToStore(error?: string) {
    const basePath = this.lang._locale == 'es' ? '/compras/tienda' : '/shopping/store';
    const formattedPath = this.urlFormatter.formatPath(basePath);
    this.router.navigate([formattedPath], {
      replaceUrl: true,
      skipLocationChange: false,
      queryParams: error ? { error } : undefined
    });
  }

  redirectToCategory(categoryId: string, categoryName: string) {
    const categoryUrl = this.urlFormatter.formatCategoryUrl(categoryName, categoryId);
    this.router.navigate([categoryUrl], {
      replaceUrl: true,
      skipLocationChange: false
    });
  }

  redirectWithReplace(path: string, queryParams?: any) {
    const formattedPath = this.urlFormatter.formatPath(path);
    const localizedPath = this.urlFormatter.getLocalizedPath(formattedPath);
    
    const navigationExtras: NavigationExtras = {
      replaceUrl: true,
      skipLocationChange: false
    };
    
    if (queryParams) {
      navigationExtras.queryParams = queryParams;
    }
    
    setTimeout(() => {
      this.router.navigate([localizedPath], navigationExtras);
    }, 10);
  }
}