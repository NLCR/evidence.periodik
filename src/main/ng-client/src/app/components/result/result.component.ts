import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  results: any; // temporary for facets

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadResultItems(); // temporary for facets
  }

  // temporary for facets
  loadResultItems() {
  
  this.results = this.http.get("../../assets/results.json");
//    .do(data => console.log("Debug result comonent:" + data));
  }
  
}
