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
    
//    this.subscriptions.push(this.state.configSubject.subscribe((state) => {
//        this.setDays();
//      }));
    this.loadFacetItems(); // temporary for facets
  }
  
  // temporary for facets
  loadFacetItems() {
  }
  
  addFilter(field: string, value: string){
    this.state.addFilter(field, value);
  }

}
