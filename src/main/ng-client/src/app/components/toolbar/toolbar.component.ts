import { Component, OnInit } from '@angular/core';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(
    public state: AppState) { }

  ngOnInit() {
  }
  
  showCalendar(){
      return this.state.activePage.indexOf('/calendar') > -1;
  }
  
  showResult(){
      return this.state.activePage.indexOf('/result') > -1;
  }

}
