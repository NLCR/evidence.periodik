import {Component, OnInit, Input} from '@angular/core';
import {AppState} from '../../../app.state';
import {AppService} from '../../../app.service';
import {Router} from '@angular/router';
import {Titul} from '../../../models/titul';
import {Issue} from '../../../models/issue';

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.scss']
})
export class ResultItemComponent implements OnInit {
  @Input() item: Issue;

  constructor(
    private router: Router,
    private service: AppService,
    public state: AppState) {}

  ngOnInit() {
    this.setTotals();
  }

  setTotals() {
    this.service.getTitulTotals(this.item['id']).subscribe(res => {

      this.item['total'] = res['response']['numFound'];
      if (res['stats']) {
        this.item['num_mutace'] = res['stats']['stats_fields']['mutace']['countDistinct'];
        this.item['num_exemplare'] = res['stats']['stats_fields']['exemplare']['count'];
        this.item['num_vlastniku'] = res['stats']['stats_fields']['vlastnik']['countDistinct'];

        this.item['den_od'] = res['stats']['stats_fields']['den']['min'];
        this.item['den_do'] = res['stats']['stats_fields']['den']['max'];
        if (this.item['den_od'] !== null) {
          if (this.item['den_od'] === this.item['den_do']) {
            this.item['date'] = this.item['den_do'].toString();
          } else {
            this.item['date'] = this.item['den_od'].toString() + ' - ' + this.item['den_do'].toString();
          }
        }
      }
    });
  }

  onClick() {
    this.addFilter(this.item['meta_nazev']);
    this.router.navigate(['/result']);
    //    if(this.item['total'] > 1){
    //      this.addFilter(this.item['nazev']);
    //    } else {
    //      this.router.navigate(['/issue', this.item['id']]);
    //    }
  }

  onCalendarClick() {
    this.state.currentTitul = new Titul();
    this.state.currentTitul.id = this.item.id_titul;
    this.state.currentTitul.meta_nazev = this.item.nazev;
    this.router.navigate(['/calendar', this.item.id_titul, this.state.calendarView, this.item['den_od']]);

  }

  addFilter(nazev: string) {
    this.state.addFilter('meta_nazev', nazev);
  }
}
