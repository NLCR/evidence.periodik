import { Component, OnInit } from '@angular/core';
import {AppState} from '../../../app.state';

@Component({
  selector: 'app-facet-used',
  templateUrl: './facet-used.component.html',
  styleUrls: ['./facet-used.component.scss']
})
export class FacetUsedComponent implements OnInit {

  constructor(public state: AppState) { }

  ngOnInit() {
  }
  
  remove(idx: number){
    this.state.removeFilter(idx);
  }
  
  removeAll(){
    this.state.removeAllFilters();
  }

}
