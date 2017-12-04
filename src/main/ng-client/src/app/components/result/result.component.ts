import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  results: any; // temporary for facets

  constructor(private http: Http) { }

  ngOnInit() {
    this.loadResultItems(); // temporary for facets
  }

  // temporary for facets
  loadResultItems() {
    this.results = this.http.get("../../assets/results.json")
    .map(res => res.json())
    .do(data => console.log("Debug:" + data));
  }
  
}
