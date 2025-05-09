import { Pipe, PipeTransform } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Pipe({
  name: 'decrypted'
})
export class DecryptedPipe implements PipeTransform {

  constructor(private firebase: FirebaseService) {}
  /**
   * Decrypts an encrypted string using AES256.
   *
   * @param {string} encryptString - the string to be decrypted
   * @return {string} the decrypted string
   */
  transform(encryptString: string ): string {
    return this.firebase.decryptUsingAES256(encryptString);
  }

}


@Pipe({
  name: 'textOverflow'
})
export class TextOverflowPipe implements PipeTransform {

  /**
   * Returns a shortened version of the input text if it exceeds the specified limit,
   * with an ellipsis appended to the end.
   *
   * @param {string} text - the input text to be transformed
   * @param {number} [limit=15] - the maximum length of the output text
   * @return {string} - the transformed text
   */
  transform(text: string, limit:number = 15 ): string {

    if(text.length > limit){
      return text.substring(0, limit) + '...';
    }

    return text;
  }

}

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {


  /**
   * Capitalize the first letter in the text
   *
   * @param {string} text - the input text to transform
   * @param {number} limit - the maximum length of the transformed text (default: 15)
   * @return {string} the transformed text
   */
  transform(text: string ): string {
    const firstLetter = text.charAt(0)
    const firstLetterCap = firstLetter.toUpperCase()
    const remainingLetters = text.slice(1)
    const capitalizedWord = firstLetterCap + remainingLetters
    return capitalizedWord;
  }

}
