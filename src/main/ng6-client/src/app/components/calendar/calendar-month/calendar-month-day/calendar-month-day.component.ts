import { Component, OnInit, Input } from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';

import {AppState} from '../../../../app.state';
// import {AppService} from '../../../../app.service';
import { AppConfiguration } from 'src/app/app-configuration';
import {ConfirmDialogComponent} from '../../../confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-calendar-month-day',
  templateUrl: './calendar-month-day.component.html',
  styleUrls: ['./calendar-month-day.component.scss']
})

export class CalendarMonthDayComponent implements OnInit {

  @Input() day: Date;
  @Input() special: any;
  @Input() current: Date;
  @Input() issues: any[];

  isSpecial: boolean;
  id: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public state: AppState,
    // private service: AppService,
    public dialog: MatDialog,
    public config: AppConfiguration) { }

  ngOnInit() {
    const id = this.route.snapshot.parent.paramMap.get('id');
    if (id) {
      this.id = id;
    }
  }

  isOtherMonth(){
    return this.day.getMonth() !== this.current.getMonth();
  }

  showBarCodes(e){
    if (!e.exemplare) { return; }

    let barcodes = '';
    e.exemplare.map((ex, index, {length}) => {
      barcodes += ex.carovy_kod;
      if (index < length - 1) {
        barcodes += ', ';
      }
    });

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.show_barcodes_in_calendar.caption',
        text: 'modal.show_barcodes_in_calendar.text',
        param: {
          value: barcodes
        }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/issue', e.id]);
      }
    });
  }

}
