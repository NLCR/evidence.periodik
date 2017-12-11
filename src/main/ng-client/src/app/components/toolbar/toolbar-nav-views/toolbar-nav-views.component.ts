import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AppState} from '../../../app.state';

@Component({
  selector: 'app-toolbar-nav-views',
  templateUrl: './toolbar-nav-views.component.html',
  styleUrls: ['./toolbar-nav-views.component.scss']
})
export class ToolbarNavViewsComponent implements OnInit {

  constructor(public state: AppState,
  private router: Router) { }

  ngOnInit() {
  }
  
  changeView(view: string){
      this.state.calendarView = view;
      this.router.navigate(['/calendar', this.state.currentTitul.id, view]);
  }

}
