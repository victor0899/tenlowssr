import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    public metaService: Meta,
    public titleService: Title,
  ) { }

  setHomePageTitle() {
    this.titleService.setTitle('Plataforma de alquiler entre usuarios - Tenlow');
  }

public setCanonicalLink(url?: string) {
  const canURL = url || window.location.href;
  const link: HTMLLinkElement = document.createElement('link');
  link.setAttribute('rel', 'canonical');
  link.setAttribute('href', canURL);
  
  const existing = document.head.querySelector('link[rel="canonical"]');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(link);
}

public addSeoHeader(options:{title:string, name:string, description:string}) {
  if (options.name && !options.title.includes(options.name)) {
    this.titleService.setTitle(`${options.title} - ${options.name}`);
  } else {
    this.titleService.setTitle(options.title);
  }
  if (this.metaService.getTag('name="description"')) {
    this.metaService.updateTag({ name: 'description', content: options.description });
  } else {
    this.metaService.addTag({ name: 'description', content: options.description });
  }
  if (this.metaService.getTag('name="facebook-domain-verification"')) {
    this.metaService.updateTag({ name: 'facebook-domain-verification', content: '53lsholgzhlf2gcif7d2i0fz341puu'});
  } else {
    this.metaService.addTag({ name: 'facebook-domain-verification', content: '53lsholgzhlf2gcif7d2i0fz341puu'});
  }
  this.updateMetaTags(options.title);
}

  public updateMetaTags( title: string) {
    this.metaService.updateTag({property:'og:title', content: title});
  }

  public addBrowsersBots(url: string){
    this.metaService.updateTag({name:'dc.source', content: location.origin});
    this.metaService.updateTag({name:'dc.language', content: 'es'});
    this.metaService.addTag({name:'dc.relation', content: url});
    this.metaService.addTag({name:'robots', content: 'index, follow'});
    this.metaService.addTag({name:'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'});
    this.metaService.addTag({name:'bingbot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'});
  }

  public addFacebookSeoTags(url: string, title: string, description: string, image:string){
    this.metaService.addTag({property:'og:locale', content: 'es'});
    this.metaService.addTag({property:'og:title', content: title});
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
  }

  public addTwitterSeoTags(url: string, title: string, description: string, image:string){
    this.metaService.addTag({ property: 'twitter:card', content: 'summary_large_image'});
    this.metaService.addTag({ property: 'twitter:url', content: url});
    this.metaService.addTag({ property: 'twitter:title', content:  title });
    this.metaService.updateTag({ property: 'twitter:description', content: description });
    this.metaService.updateTag({ property: 'twitter:image', content: image});
  }

  public setNoIndex(): void {
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.metaService.updateTag({ name: 'googlebot', content: 'noindex, nofollow' });
    this.metaService.updateTag({ name: 'bingbot', content: 'noindex, nofollow' });
  }
}
