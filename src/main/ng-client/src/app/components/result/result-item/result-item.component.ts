import { Component, OnInit, Input } from '@angular/core';
import {AppState} from '../../../app.state';

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.scss']
})
export class ResultItemComponent implements OnInit {
  @Input() item: any;

  constructor(public state : AppState) { }

  ngOnInit() {
  }

}
