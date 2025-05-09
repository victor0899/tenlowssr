import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCurrency'
})
export class FormatCurrencyPipe implements PipeTransform {

  transform(input: any, args?: any): any {
    let exp:number, rounded:number,
      suffixes = ['k.', 'mill.', 'G', 'T', 'P', 'E'];

    if (Number.isNaN(input)) {
      return null;
    }

    if (input < 1000) {
      return '€' +input;
    }

    exp = Math.floor(Math.log(input) / Math.log(1000));

    return '€' + (input / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1];

  }

}