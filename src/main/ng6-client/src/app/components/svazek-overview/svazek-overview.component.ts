import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DatePipe } from '@angular/common';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { AppConfiguration } from 'src/app/app-configuration';
import { Volume } from 'src/app/models/volume';

@Component({
  selector: 'app-svazek-overview',
  templateUrl: './svazek-overview.component.html',
  styleUrls: ['./svazek-overview.component.scss']
})
export class SvazekOverviewComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SvazekOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { volume: Volume },
    private datePipe: DatePipe,
    public state: AppState,
    private service: AppService,
    public config: AppConfiguration) { }

  ngOnInit() {
  }

}
