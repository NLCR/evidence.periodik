import { Component, OnInit, Input } from '@angular/core';
import { AppState } from '../../../app.state';
import { AppService } from '../../../app.service';
import { Router } from '@angular/router';
import { Titul } from '../../../models/titul';
import { Issue } from '../../../models/issue';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.scss']
})
export class ResultItemComponent implements OnInit {
  @Input() item: any;

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private service: AppService,
    public state: AppState) { }

  ngOnInit() {
    this.setTotals();
  }

  dayToDate(d: string): string {
    const date = Date.UTC(parseInt(d.substr(0, 4)), parseInt(d.substr(4, 2)), parseInt(d.substr(6, 2)));
    return this.datePipe.transform(date, 'dd.MM.yyyy');

  }

  setTotals() {
    this.service.getTitulTotals(this.item.id).subscribe((res: any) => {


      this.item.total = res.response ?  res.response.numFound : res.grouped.id_issue.ngroups;
      if (res.stats) {
        this.item.num_mutace = res.stats.stats_fields.mutace.countDistinct;
        // this.item.num_exemplare = res.stats.stats_fields.exemplare.count;
        this.item.num_exemplare = res.grouped.id_issue.matches;
        this.item.num_vlastniku = res.stats.stats_fields.vlastnik.countDistinct;

        this.item.den_od = res.stats.stats_fields.den.min;
        this.item.den_do = res.stats.stats_fields.den.max;
        if (this.item.den_od !== null) {
          if (this.item.den_od === this.item.den_do) {
            this.item.date = this.dayToDate(this.item.den_od);
          } else {
            this.item.date = this.dayToDate(this.item.den_od) + ' - ' + this.dayToDate(this.item.den_do);
          }
        }
      }
    });
  }

  setTitul() {

    // this.addFilter(this.item['meta_nazev']);
    this.state.setCurrentTitul(this.item);

    this.router.navigate(['/result', this.item.id]);
    //        if(this.item['num_exemplare'] > 1){
    //          this.addFilter(this.item['meta_nazev']);
    //        } else {
    //          this.router.navigate(['/issue', this.item['id']]);
    //        }
  }

  // onCalendarClick() {
  //   this.state.currentTitul = new Titul();
  //   this.state.currentTitul.id = this.item.id;
  //   this.state.currentTitul.meta_nazev = this.item.nazev;
  //   this.router.navigate(['/calendar', this.item.id, this.state.calendarView, this.item['den_od']]);

  // }

  addFilter(nazev: string) {
    this.state.addFilter('meta_nazev', nazev);
  }
}
