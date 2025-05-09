import { Injectable } from '@angular/core';
import { LangService } from './lang.service';

@Injectable({
  providedIn: 'root'
})
export class UrlFormatterService {
  constructor(private langService: LangService) {}

  formatUrlString(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase() 
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/[^\w\s-]/g, '') 
      .replace(/\s+/g, '-') 
      .replace(/-+/g, '-') 
      .trim() 
      .replace(/^-+|-+$/g, ''); 
  }

  formatPath(path: string): string {
    if (!path) return '';
    return path.split('/').map(segment => this.formatUrlString(segment)).join('/');
  }

  getLocalizedPath(path: string): string {
    const pathMappings: Record<string, { es: string; en: string }> = {
      'product': { es: 'producto', en: 'products' },
      'products': { es: 'producto', en: 'products' },
      'shopping': { es: 'compras', en: 'shopping' },
      'store': { es: 'tienda', en: 'store' },
      'category': { es: 'categoria', en: 'category' },
      'search': { es: 'buscar', en: 'search' },
      'account': { es: 'cuenta', en: 'account' },
      'options': { es: 'opciones', en: 'options' },
      'favorites': { es: 'favoritos', en: 'favorites' },
      'edit': { es: 'editar', en: 'edit' },
      'checkout': { es: 'verificar', en: 'checkout' },
      'confirm': { es: 'confirmar', en: 'confirm' },
      'payments': { es: 'pagos', en: 'payments' },
      'history': { es: 'historial', en: 'history' },
      'notifications': { es: 'notificaciones', en: 'notifications' },
      'configuration': { es: 'configuracion', en: 'configuration' },
      'user': { es: 'usuario', en: 'user' }
    };

    return path.split('/').map(segment => {
      const mapping = pathMappings[segment.toLowerCase()];
      if (mapping) {
        return mapping[this.langService._locale as 'es' | 'en'];
      }
      return this.formatUrlString(segment);
    }).join('/');
  }

  formatProductUrl(title: string, id: string): string {
    const basePath = this.langService._locale === 'es' ? 'producto' : 'products';
    const formattedTitle = this.formatUrlString(title);
    return `/${basePath}/${formattedTitle}/${id}`;
  }

  formatCategoryUrl(name: string, id: string): string {
    const basePath = this.langService._locale === 'es' ? 'compras/tienda/categoria' : 'shopping/store/category';
    const formattedName = this.formatUrlString(name);
    return `/${basePath}/${formattedName}/${id}`;
  }

  formatSearchUrl(query: string): string {
    const basePath = this.langService._locale === 'es' ? 'compras/buscar' : 'shopping/search';
    const formattedQuery = this.formatUrlString(query);
    return `/${basePath}/${formattedQuery}`;
  }
  
  formatAddProductPath(): string {
    return this.langService._locale === 'es' ? '/producto/nuevo-producto' : '/products/add-product';
  }
}