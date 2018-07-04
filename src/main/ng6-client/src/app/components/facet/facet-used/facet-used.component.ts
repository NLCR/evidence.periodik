import {Component, OnInit} from '@angular/core';
import {AppState} from '../../../app.state';

@Component({
  selector: 'app-facet-used',
  templateUrl: './facet-used.component.html',
  styleUrls: ['./facet-used.component.scss']
})
export class FacetUsedComponent implements OnInit {

  public start_year: string;
  public end_year: string;
  constructor(public state: AppState) {}

  ngOnInit() {
    this.state.searchChanged.subscribe(cfg => {
      this.start_year = this.state.start_year;
      this.end_year = this.state.end_year;
    });
  }

  remove(idx: number) {
    this.state.removeFilter(idx);
  }

  removeAll() {
    this.state.removeAllFilters();
  }

}
