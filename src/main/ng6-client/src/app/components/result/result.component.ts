import { Component, OnInit } from '@angular/core';
import {AppService} from '../../app.service';
import {AppState} from '../../app.state';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  constructor(private service: AppService, public state: AppState) { }

  ngOnInit() {
    this.loadResultItems();
      this.state.searchParamsChanged.subscribe(cfg => {
        this.loadResultItems();
      });
  }
  
  loadResultItems() {
  
//  this.results = this.http.get("../../assets/results.json");
  this.service.search().subscribe(res => {
    this.state.setSearchResults(res);
   //this.docs = this.state.
  });
  }
  
}
