import { Component } from '@angular/core';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { LanguageData, NavbarItems, SocialItem } from 'src/app/interfaces/public';
import { LangService } from 'src/app/services/lang.service';
import { PublicService } from 'src/app/services/public.service';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss']
})
export class AppFooterComponent {

  footerItems: Array<NavbarItems> = [];
  linksSocial: Array<SocialItem> = [];
  selectedLang: string = "";
  locale: string = "";
  year!: number;

  existEng: boolean = true;
  existSpa: boolean = true;

  langs: LanguageData[] = [];

  constructor(
    private router: Router,
    public publicService: PublicService,
    private lang: LangService
  ) {
    const stored = this.lang.getInformationLang();
    this.locale = this.lang.getLocale;
    this.selectedLang = stored ? stored.name : this.locale == 'es' ? 'labels.spanish' : 'labels.english'
    this.footerItems = this.publicService.footerItems;
    this.linksSocial = this.publicService.socialLinks;
    this.year = dayjs().get('year');
    this.existEng = Boolean(this.lang.getLang.en)
    this.existSpa = Boolean(this.lang.getLang.es)
    console.log("🚀 ~ this.existEnglish:", this.existEng)
    this.langs = this.lang.listLangs;
  }

  // Nuevo getter para filtrar la opción "¡Participa!"
  get filteredFooterItems(): Array<NavbarItems> {
    return this.footerItems.filter(item => item.label !== 'components.footer.participate');
  }

  // Getter actualizado para mostrar solo Instagram con la URL correcta
  get filteredSocialLinks(): Array<SocialItem> {
    // Primero, busca el ítem de Instagram en la lista
    const instagramItem = this.linksSocial.find(social => social.url.includes('instagram.com'));
    
    // Si existe, asegúrate de que tenga la URL correcta
    if (instagramItem) {
      // Crea una copia para no modificar el original directamente
      const updatedInstagram = {...instagramItem, url: 'https://www.instagram.com/tenlow.es/'};
      return [updatedInstagram];
    }
    
    // Filtra para mostrar solo Instagram (como respaldo)
    return this.linksSocial.filter(social => social.url.includes('instagram.com'));
  }

  openExternalUrl(url:string){
    window.open(url, "_blank");
  }

  navigate(url:string){
    if(url.includes('https')){
      return this.openExternalUrl(url);
    }

    this.router.navigateByUrl(url);
  }

  selectLang( lang: LanguageData ){

    console.log("🚀 ~this.locale:", lang.code == this.locale)
    if(lang.code == this.locale) return;

    this.lang.setLocale = lang.code;
    this.locale = lang.code;
    this.selectedLang = lang.name;
    this.lang.setInStorage( lang.code );
    this.lang.setInformationLang( lang );

    location.reload();
  }

  getFlag(){

    if(this.locale == 'es') return "assets/images/spain.jpeg";

    if(this.locale == 'en') return "assets/images/eeuu.png";

    return "assets/images/word.svg";
    // return `https://flagcdn.com/w80/${this.locale}.png`
  }

  getFlagOp(code:string){
    // return "assets/images/world.png";
    return `https://flagcdn.com/w80/${code}.svg`
  }
}