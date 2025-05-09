import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Categorie } from 'src/app/interfaces/store';
import { PublicService } from 'src/app/services/public.service';
import { StoreService } from 'src/app/services/store.service';
import { UrlFormatterService } from 'src/app/services/url-formatter.service';
import { LangService } from 'src/app/services/lang.service';

@Component({
  selector: 'app-filter-category',
  templateUrl: './filter-category.component.html',
  styleUrls: ['./filter-category.component.scss']
})
export class FilterCategoryComponent {
  listCategories: Array<Categorie> = [];
  assetsCategory: string = "assets/images/categories/";
  defaultImg: string = "assets/images/default-img.webp";
  categorySelected!: Categorie;
  icon = "https://chrome-cors-testing.s3.eu-central-1.amazonaws.com/hacksoft.svg";

  constructor(
    public router: Router,
    private sanitizer: DomSanitizer,
    public publicService: PublicService,
    private storeService: StoreService,
    private dialogRef: MatDialogRef<FilterCategoryComponent>,
    private urlFormatter: UrlFormatterService,
    private lang: LangService,
    @Inject(MAT_DIALOG_DATA) public data: { route: ActivatedRoute }
  ){
    const { route } = this.data;
    const paramID = route.snapshot.params['id'];
    this.listCategories = this.storeService.categories;

    if(paramID){
      this.categorySelected = this.listCategories.filter(cat => cat.id == paramID)[0];
    }
  }

  // Método para generar URL de categoría
  getCategoryUrl(category: Categorie): string {
    return this.urlFormatter.formatCategoryUrl(category.name, category.id);
  }

  // Método de navegación actualizado
  navigateToCategory(category: Categorie, event?: Event) {
    // Prevenir navegación si se hace clic en un enlace
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    try {
      const categoryUrl = this.getCategoryUrl(category);
      
      // Cierra el diálogo
      this.dialogRef.close(category);
      
      // Navega a la URL
      this.router.navigateByUrl(categoryUrl, { 
        replaceUrl: true 
      });
    } catch (error) {
      console.error('Error navegando a categoría:', error);
    }
  }

  // Métodos de sanitización existentes
  sanitizeIconCategory(icon: string) {
    return this.sanitizer.bypassSecurityTrustUrl(icon);
  }

  safeUrl(icon: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(icon);
  }
}