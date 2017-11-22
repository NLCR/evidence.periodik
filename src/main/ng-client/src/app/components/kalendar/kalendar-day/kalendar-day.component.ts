import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-kalendar-day',
  templateUrl: './kalendar-day.component.html',
  styleUrls: ['./kalendar-day.component.scss']
})
export class KalendarDayComponent implements OnInit {
  
  @Input('day') day: Date;
  @Input('current') current: Date;
  @Input('issues') issues: any[];
  

  constructor() { }

  ngOnInit() {
  }
  
  isOtherMonth(){
    return this.day.getMonth() !== this.current.getMonth();
  }

}
