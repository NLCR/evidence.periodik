import { Component, OnInit } from '@angular/core';
import { AppState } from '../../app.state';
// import { AppService } from '../../app.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    public state: AppState,
    // private service: AppService
  ) {}

  ngOnInit() {
    this.state.reset();
    if (this.state.logginChanged){
      this.state.logginChanged = false;
      this.state.tituly = [];
      location.reload();
      // this.service.getTituly().subscribe();
    }
  }




}
