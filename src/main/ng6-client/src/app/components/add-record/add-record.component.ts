import { Component, OnInit } from '@angular/core';
import {AppState} from '../../app.state';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.scss']
})
export class AddRecordComponent implements OnInit {

  constructor(public state: AppState) { }

  ngOnInit() {
  }

}
