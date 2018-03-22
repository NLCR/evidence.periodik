import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-facet',
  templateUrl: './facet.component.html',
  styleUrls: ['./facet.component.scss']
})
export class FacetComponent implements OnInit {
  facets: any; // temporary for facets
  
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadFacetItems(); // temporary for facets
  }
  
  // temporary for facets
  loadFacetItems() {
    this.facets = this.http.get("../../assets/facets.json");
    //.do(data => console.log("Debug facet component:" + data));
  }

}
