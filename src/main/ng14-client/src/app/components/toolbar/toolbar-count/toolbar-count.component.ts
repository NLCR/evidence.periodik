import { Component } from '@angular/core';
import { AppState } from '../../../app.state';

@Component({
  selector: 'app-toolbar-count',
  templateUrl: './toolbar-count.component.html',
  styleUrls: ['./toolbar-count.component.scss']
})
export class ToolbarCountComponent {

  constructor(public state: AppState) { }


}
