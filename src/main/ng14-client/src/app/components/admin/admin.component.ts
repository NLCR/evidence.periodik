import { Component } from '@angular/core';
import {AppState} from '../../app.state';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  constructor(
    public state: AppState
  ) {}



}
