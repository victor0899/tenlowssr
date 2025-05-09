import { Component, Input } from '@angular/core';
import { TypePrivacy } from 'src/app/interfaces/public';

@Component({
  selector: 'app-privacy-es',
  templateUrl: './privacy-es.component.html',
  styleUrls: ['./privacy-es.component.scss']
})
export class PrivacyEsComponent {
  @Input() type!: TypePrivacy;
}
