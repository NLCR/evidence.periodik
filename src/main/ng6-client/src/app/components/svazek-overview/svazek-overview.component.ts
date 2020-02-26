import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DatePipe } from '@angular/common';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { AppConfiguration } from 'src/app/app-configuration';
import { Volume } from 'src/app/models/volume';
import { Utils } from 'src/app/utils';
import { Issue } from 'src/app/models/issue';

@Component({
  selector: 'app-svazek-overview',
  templateUrl: './svazek-overview.component.html',
  styleUrls: ['./svazek-overview.component.scss']
})
export class SvazekOverviewComponent implements OnInit {

  volume: Volume;

  years: {name: string, type: string, value: number}[] = [];
  mutace: {name: string, type: string, value: number}[] = [];
  vydani: {name: string, type: string, value: number}[] = [];
  znaky: {name: string, type: string, value: number}[] = [];
  
  loading: boolean;

  constructor(
    public dialogRef: MatDialogRef<SvazekOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { carKod: string },
    private datePipe: DatePipe,
    public state: AppState,
    private service: AppService,
    public config: AppConfiguration) { }

  ngOnInit() {
    this.loading = true;
    this.service.volumeOverview(this.data.carKod).subscribe(res => {
      console.log(res);
      const issue: Issue = res.response.docs[0] as Issue;
      const datum_od = res.stats.stats_fields.datum_vydani_den.min;
      const datum_do = res.stats.stats_fields.datum_vydani_den.max;
      this.volume = new Volume(
        this.datePipe.transform(Utils.dateFromDay(datum_od), 'yyyy-MM-dd'),
        this.datePipe.transform(Utils.dateFromDay(datum_do), 'yyyy-MM-dd'));
      // this.volume.id = id;
      this.volume.carovy_kod = this.data.carKod;
      this.volume.mutace = issue.mutace;
      this.volume.znak_oznaceni_vydani = issue.znak_oznaceni_vydani;
      this.volume.id_titul = issue.id_titul;
      // issue.exemplare.forEach(ex => {
      //   if (ex.carovy_kod === id) {
      //     this.volume.signatura = ex.signatura;
      //     this.volume.vlastnik = ex.vlastnik;
      //   }
      // });
      this.findTitul();
      const facetDatum: {name: string, type: string, value: number}[] = res.facet_counts.facet_ranges.datum_vydani.counts;
      this.years = facetDatum.filter(f => f.value > 0);
      this.mutace = res.facet_counts.facet_fields.mutace.filter(f => f.value > 0);
      this.znaky = res.facet_counts.facet_fields.znak_oznaceni_vydani.filter(f => f.value > 0);
      this.vydani = res.facet_counts.facet_fields.vydani.filter(f => f.value > 0);
      this.loading = false;
    });
  }


  findTitul() {
    this.service.getTitul(this.volume.id_titul).subscribe(res2 => {
      this.volume.titul = res2;
      this.volume.id_titul = this.volume.titul.id;

      this.state.currentTitul = res2;
      
    });
  }
}
