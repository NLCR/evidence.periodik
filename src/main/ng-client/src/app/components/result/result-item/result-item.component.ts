import {Component, OnInit, Input} from '@angular/core';
import {AppState} from '../../../app.state';
import {AppService} from '../../../app.service';

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.scss']
})
export class ResultItemComponent implements OnInit {
  @Input() item: any;

  constructor(private service: AppService, public state: AppState) {}

  ngOnInit() {
    this.setTotals();
  }

  setTotals() {
    this.service.getIssueTotals(this.item['id_titul'], this.item['datum_vydani']).subscribe(res => {
      if(res['stats']){
      this.item['mutace'] = res['stats']['stats_fields']['mutace']['countDistinct'];
      this.item['num_exemplare'] = res['stats']['stats_fields']['exemplare']['count'];
      this.item['num_vlastniku'] = res['stats']['stats_fields']['vlastnik']['count'];
      
      this.item['den_od'] = res['stats']['stats_fields']['den']['min'];
      this.item['den_do'] = res['stats']['stats_fields']['den']['max'];
//      this.item['date'] =
      }
    });
  }
  
  addFilter(nazev: string){
    this.state.addFilter('nazev', nazev);
  }
}
