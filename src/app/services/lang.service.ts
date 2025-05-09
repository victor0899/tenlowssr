import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { GlobalService } from './global.service';
import { Apollo } from 'apollo-angular';
import { GET_LANG } from '../GraphQL/global';
import { LanguageData } from '../interfaces/public';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  // Stores locales languages key
  public _locales: Array<any> = [
    {
      lang: 'English',
      locale: 'en'
    },
    {
      lang: 'Español',
      locale: 'es'
    }
  ];
  // Stores languages keys
  public _lang: any = null;
  // Stores language local application
  public _locale: string = 'es';
  public STORAGE_LANG: string = 'tenlow:lang';
  public STORAGE_LANG_INFO: string = 'tenlow-info:lang';

  private _listLangs: LanguageData[] = [];
  public get listLangs(): LanguageData[] {
    return this._listLangs;
  }
  public set listLangs(value: LanguageData[]) {
    this._listLangs = value;
  }

  // **************
  constructor(
    private http: HttpClient,
    private apollo: Apollo
  ) { }

  /**
   * Get locales languages key
   */
  get getLocales(): any {
    return this._locales;
  }

  /**
   * Set locales languages key
   */
  set setLocales(value: any) {
    this._locales = value;
  }

  /**
   * Get languages keys
   */
  get getLang(): any {
    return this._lang;
  }

  /**
   * Set languages keys
   */
  set setLang(value: any) {
    this._lang = value;
  }

  /**
   * Get locale language
   */
  get getLocale(): any {
    return this._locale;
  }

  /**
   * Set locale language
   */
  set setLocale(value: any) {
    this._locale = value;
  }

  /**
   * @description
   * Returns the translation keys for the application components
   * @param key
   * @param replace
   * @returns {String} TRANSLATION KEY
   */
  _component(key:any, replace = null) {
    return this._('components.' + key, replace);
  }

  /**
   * @description
   * Returns the translation keys for the application pages
   * @param key
   * @param replace
   * @returns {String} TRANSLATION KEY
   */
  _page(key:any, replace = null) {
    return this._('pages.' + key, replace);
  }

  /**
   * @description
   * Returns application global translation keys
   * @param key
   * @param replace
   * @returns {String} TRANSLATION KEY
   */
  _global(key:any, replace = null) {
    return this._('global.' + key, replace);
  }

  /**
   * @description
   * Returns the translation keys for the attributes
   * @param key
   * @param replace
   * @returns {String} TRANSLATION KEY
   */
  _attr(key:any, replace = null) {
    return this._('validation.attributes.' + key, replace);
  }

  /**
   * @description
   * Returns the translation keys for the validations
   * @param key
   * @param replace
   * @returns {String} TRANSLATION KEY
   */
  _valdn(key:any, replace = null) {
    return this._('validation.' + key, replace);
  }

  /**
   * @description
   * Returns the translation keys of the database states
   * @param key
   * @param replace
   * @returns {String} TRANSLATION KEY
   */
  _db(key:any, replace = null) {
    return this._('db_display.' + key, replace);
  }

  _msg(key:any, replace?:any) {
    return this._('messages.' + key, replace);
  }

  /**
   * @description
   * Returns the translation keys of any element
   * @param key
   * @param replace
   * @returns {String} TRANSLATION KEY
   */
  _(key:string, replace?:any) {

    if(!key) return '';

    if(key == 'components.update_email.change_you_email'){
      if(this._locale == 'es') return 'Cambia tu email';
      return 'Change your email';
    }

    if (!key.match(/^[\w-]+(?:\.[\w-]+)+$/)) {
      // return "Invalid key";
      return key;
    }
    if (!this._lang) {
      this.getLocaleLang();
      return key;
    }
    let segments = key.split('.');
    if (this._lang) {
      let translation = this.search(segments, this._lang[this._locale]);
      if (translation !== false) {
        return this.replaceKeys(translation, replace);
      } else {
        // comentando
        // default en
        // if (this._locale !== 'en') {
        //   segments = key.split('.');
        //   let translation = this.search(segments, this._lang['en']);
        //   if (translation !== false) {
        //     return this.replaceKeys(translation, replace);
        //   }
        // }
      }

      const keyArr = key.split('.');
      return keyArr[keyArr.length - 1];

    } else {
      // (t) amisael update lang reload app
      // alert('update lang reload app');
    }
  }

  /**
   * @description
   * Returns the translation keys of any element
   * @param key
   * @param replace
   * @returns {String|NULL} TRANSLATION KEY
  */
  _x(key:any, replace = null) {
    let val = this._(key, replace);
    if (val == key) {
      return null;
    }
    return val;
}

  /**
   * @description
   * Find the keys to the translations
   * @param {Array} segments
   * @param {Array} data
   * @returns {Boolean | Array} Key
   */
  private search(segments:Array<any>, data:Array<any>): boolean | Array<any> {
    let segment = segments[0];

    if (!data) {
      return segments.at(-1);
    }

    if (typeof data[segment] == "undefined") {
      return false;
    }
    if (segments.length > 1) {
      segments.shift();
      return this.search(segments, data[segment]);
    }
    return data[segment];
  }

  private replaceKeys(translation:any, replace:any) {
    if (replace) {
      for (const key in replace) {
        if (replace[key]) {
          translation = translation.replace(':' + key, replace[key]);
        } else {
          translation = translation.replace(':' + key, '');
        }
      }
    }
    return translation;
  }

  async getLocaleLang() {
    try {
      const timestamp = new Date().getTime();
      const response: any = await lastValueFrom(
        this.http.get(`/assets/lang/lang.json?t=${timestamp}`)
      );
      
      this._lang = response;
      
      return response;
    } catch(error) {
      console.error('Error loading translations:', error);
      return null;
    }
  }

  setInStorage( locale:string ){
    localStorage.setItem( this.STORAGE_LANG , locale );
  }

  setInformationLang( locale:LanguageData ){
    localStorage.setItem( this.STORAGE_LANG_INFO , JSON.stringify(locale) );
  }

  getInformationLang( ) : LanguageData | null {
    const data = localStorage.getItem( this.STORAGE_LANG_INFO );
    if(!data) return null;
    return JSON.parse(data);
  }

  getTranslations(){
    const response:any = lastValueFrom(
      this.apollo.query({
        query: GET_LANG
      })
    );

    return response;
  }
}