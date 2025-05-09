import { Component, Input } from '@angular/core';

@Component({
  selector: 'empty-view',
  templateUrl: './empty-view.component.html',
  styleUrls: ['./empty-view.component.scss']
})
export class EmptyViewComponent {
  /**
   * Param to show a custom message, need a key translate. Ex: 'label.email', default value is 'components.empty_view.default_txt'
   */
  @Input() message: string = 'components.empty_view.default_txt';
}
