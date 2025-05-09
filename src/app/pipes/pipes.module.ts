import { NgModule } from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TimeAgoPipe } from './time-ago.pipe';
import { FormatCurrencyPipe } from './format-currency.pipe';
import { CapitalizePipe, DecryptedPipe, TextOverflowPipe } from './texts.pipe';
import { HourPipe } from './hour.pipe';

@NgModule({
    declarations: [
        TranslatePipe,
        TimeAgoPipe,
        FormatCurrencyPipe,
        DecryptedPipe,
        TextOverflowPipe,
        HourPipe,
        CapitalizePipe
    ],
    exports: [
        TranslatePipe,
        TimeAgoPipe,
        FormatCurrencyPipe,
        DecryptedPipe,
        TextOverflowPipe,
        HourPipe,
        CapitalizePipe
    ],
})
export class PipesModule { }