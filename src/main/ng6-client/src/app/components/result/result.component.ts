import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../app.service';
import { AppState } from '../../app.state';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private service: AppService, 
    public state: AppState) { }

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
    const idTitul = this.route.snapshot.paramMap.get('id');
    this.service.searchIssuesOfTitul(idTitul).subscribe(res => {
      this.state.setSearchResults(res);
    });
  }

}
