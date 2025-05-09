import { AfterViewInit, Component, Inject, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { GraphResponse } from 'src/app/interfaces/graph';
import { AutocompleteSuggest } from 'src/app/interfaces/store';
import { User } from 'src/app/interfaces/user';
import { LangService } from 'src/app/services/lang.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements AfterViewInit {
  /**
   * Show placeholder in input, need a translation key. Default: 'pages.home.search_txt'
   */
  @Input() placeholder: string = 'pages.home.text_search';

  @ViewChild('searchAutocomplete') searchAutocomplete!: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  textSearch: string = '';
  myControl = new FormControl('');
  options: AutocompleteSuggest[] = [];
  filteredOptions!: Observable<AutocompleteSuggest[]>;
  userQuestionUpdate = new Subject<string>();
  isSearch: boolean = false;
  isModal: boolean = false;
  selectedOption: any = null;
  user?: User;
  construction:boolean = environment.construction;
  emails:string[] = environment.emails;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private userService: UserService,
    private storeService: StoreService,
    private lang: LangService,
    // public dialogRef: MatDialogRef<SearchbarComponent>,

  ) {
    const urls = ['/about/', '/app/home','/sustainable-development-goals','/faqs']
    // this.construction = urls.some(e => this.router.url.startsWith(e))
    this.userQuestionUpdate.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value == '') return;
      console.log("🚀 ~ value:", value);
      this.options = [];
      this.getAutocomplete(value);
    });

    this.observerInput();
  }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
  }

  ngAfterViewInit(): void {
    const modalRef = document.querySelector('.search-dialog')
    if (modalRef) {
      this.isModal = true;
    }
  }

  observerInput() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  

  searchProduct() {

    if (this.textSearch.trim() == '') return;

    this.matDialog.closeAll();
  
    if (this.router.url.includes(this.lang._locale == 'es' ? 'compras/buscar' : 'shopping/search')) {
      this.storeService.eventSearch.next(this.textSearch);
    }

    this.autocompleteTrigger.closePanel();
    this.router.navigate([this.lang._locale == 'es' ? 'compras/buscar/' : 'shopping/search/', this.textSearch?.replace(/\s+/g, '-')?.replace(/[,"\(\)]/g, '')]);
    this.textSearch = "";
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.title.toLowerCase().includes(filterValue));
  }

  async getAutocomplete(query: any) {
    this.isSearch = true;
    try {
      const response: GraphResponse = await this.storeService.getAutocompleteSearch(query.title || query);
      if (response.errors) throw (response.errors);
      const { autocompleteProduct } = response.data;
      autocompleteProduct.forEach(item => this.options.push(JSON.parse(item)));
      console.log("🚀 ~ getAutocomplete ~ autocomplete:", this.options);
      const obs$ = new Observable<AutocompleteSuggest[]>(
        (observer: any) => {
          observer.next(this.options);
          observer.complete();
        }
      );

      this.filteredOptions = obs$;

      this.searchAutocomplete.showPanel;

      this.observerInput();

    } catch (error) {
      console.log("🚀 ~ getSuggest ~ error:", error)
    } finally {
      this.isSearch = false;
    }
  }

  isOptionSelected(option: any): boolean {
    return this.selectedOption && this.selectedOption.title === option.title;
  }

  onSelectSuggest(ev: MatAutocompleteSelectedEvent) {
    const selected = ev.option.value;
    this.textSearch = ev.option.value.title;

    if (this.isOptionSelected(selected)) {
      return;
    }
    this.selectedOption = selected;
    // this.searchProduct();
    this.router.navigate([`producto/${ev.option.value.title.replace(/\s+/g, '-').replace(/[,"\(\)]/g, '')}/${ev.option.value.id}` ] );
    this.autocompleteTrigger.closePanel();
  }

  onEnterKey(event?: KeyboardEvent) {
    // if( event.code == 'Enter' ){
    this.searchProduct();
    // }
  }
}
