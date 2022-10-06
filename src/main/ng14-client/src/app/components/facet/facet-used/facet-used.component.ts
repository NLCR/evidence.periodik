import {Component, OnInit, OnDestroy} from '@angular/core';
import {AppState} from '../../../app.state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-facet-used',
  templateUrl: './facet-used.component.html',
  styleUrls: ['./facet-used.component.scss']
})
export class FacetUsedComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  public start_year: string;
  public end_year: string;
  public volume_id_for_search: string;
  constructor(public state: AppState) {}

  ngOnInit() {
    this.subscriptions.push(this.state.searchChanged.subscribe(cfg => {
      this.start_year = this.state.start_year;
      this.end_year = this.state.end_year;
      this.volume_id_for_search = this.state.volume_id_for_search;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  remove(idx: number) {
    this.state.removeFilter(idx);
  }

  removeAll() {
    this.state.removeAllFilters();
  }

}
