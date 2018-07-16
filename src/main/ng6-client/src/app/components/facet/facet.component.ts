import { Component, OnInit } from '@angular/core';
import {AppState} from '../../app.state';

@Component({
  selector: 'app-facet',
  templateUrl: './facet.component.html',
  styleUrls: ['./facet.component.scss']
})
export class FacetComponent implements OnInit {
  
    public options: Pickadate.DateOptions = {
        format: 'dd/mm/yyyy',
        formatSubmit: 'yyyymmdd',
        selectMonths: true,
        selectYears: 20
    };
    
  facets: any; // temporary for facets
  
  
  constructor(public state: AppState) { }

  ngOnInit() {
  }
  
  
  addFilter(field: string, value: string){
    let idx = this.isUsed(field, value); 
    if (idx > -1){
      this.state.removeFilter(idx);
    } else {
      this.state.addFilter(field, value);
    }
  }
  
  isUsed(field: string, value: string): number{
    for (let i = 0; i < this.state.filters.length; i++) {
      if (this.state.filters[i].field === field && this.state.filters[i].value === value) {
        return i;
      }
    }
    return -1;
  }
  
  isInResults(): boolean{
    return this.state.activePage.indexOf('/result') > -1;
  }

}
