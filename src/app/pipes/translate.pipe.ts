import { Pipe, PipeTransform } from '@angular/core';
import { LangService } from '../services/lang.service';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  constructor(private langService: LangService) {}

  transform(key: string, replace?: Object): string {
    return this.langService._(key, replace);
  }
}
