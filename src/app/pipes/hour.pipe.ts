import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hour'
})
export class HourPipe implements PipeTransform {

  /**
   * Receive hour with format `hh:mm:ss` and return in formar `hh:ss`
   *
   * @param {string} value - the input string to be transformed
   * @return {string} the transformed string
   */
  transform(value:string): string {
    const arr = value.split(':');
    return arr[0] + ':' + arr[1];
  }

}
