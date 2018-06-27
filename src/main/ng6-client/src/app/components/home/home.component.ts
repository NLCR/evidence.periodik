import {Component, OnInit} from '@angular/core';
import {AppState} from '../../app.state';
import {AppService} from '../../app.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    public state: AppState,
    private service: AppService) {
  }

  ngOnInit() {
    if (this.state.config) {
      this.loadResultItems();
    } else {
      this.state.configSubject.subscribe(cfg => {
        this.loadResultItems();
      });
    }
//    this.state.searchParamsChanged.subscribe(cfg => {
//      this.loadResultItems();
//    });
  }

  loadResultItems() {
    this.service.getTituly().subscribe(res => {
      
    });
  }

}
