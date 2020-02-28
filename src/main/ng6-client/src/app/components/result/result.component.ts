import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../app.service';
import { AppState } from '../../app.state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  constructor(private service: AppService, public state: AppState) { }

  ngOnInit() {
    this.loadResultItems();
    this.subscriptions.push(this.state.searchParamsChanged.subscribe(cfg => {
      this.loadResultItems();
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  loadResultItems() {

    //  this.results = this.http.get("../../assets/results.json");
    this.service.search().subscribe(res => {
      this.state.setSearchResults(res);
      //this.docs = this.state.
    });
  }

}
