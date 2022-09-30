import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { AppConfiguration } from 'src/app/app-configuration';
import { Volume } from 'src/app/models/volume';
import { Utils } from 'src/app/utils';
import { Issue } from 'src/app/models/issue';
import { Router } from '@angular/router';
import { Exemplar } from 'src/app/models/exemplar';

@Component({
  selector: 'app-svazek-overview',
  templateUrl: './svazek-overview.component.html',
  styleUrls: ['./svazek-overview.component.scss']
})
export class SvazekOverviewComponent implements OnInit {

  volume: Volume;

  signatury: string[] = [];
  years: { name: string, type: string, value: number }[] = [];
  mutace: { name: string, type: string, value: number }[] = [];
  vydani: { name: string, type: string, value: number }[] = [];
  znaky: { name: string, type: string, value: number }[] = [];
  stavy: { name: string, value: number }[] = [];
  // chybejsicisla: { datum: Date, cislo: number }[] = [];
  fyzStavOk: boolean;
  stavyExt: { datum: Date, cislo: number }[] = [];
  poznamky: { datum: Date, cislo: number, note: string }[] = [];

  prvniCislo: number;
  posledniCislo: number;

  loading: boolean;

  result: any;

  constructor(
    public dialogRef: MatDialogRef<SvazekOverviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { carKod: string, idTitul: string },
    private router: Router,
    private datePipe: DatePipe,
    public state: AppState,
    private service: AppService,
    public config: AppConfiguration) { }

  ngOnInit() {
    this.loading = true;
    this.service.volumeOverview(this.data.carKod, this.data.idTitul).subscribe(res => {
      console.log(res);
      this.result = res;
      const issue: Exemplar = res.response.docs[0] as Exemplar;
      const datum_od = res.stats.stats_fields.datum_vydani_den.min;
      const datum_do = res.stats.stats_fields.datum_vydani_den.max;
      this.volume = new Volume(
        this.datePipe.transform(Utils.dateFromDay(datum_od), 'yyyy-MM-dd'),
        this.datePipe.transform(Utils.dateFromDay(datum_do), 'yyyy-MM-dd'));
      // this.volume.id = id;
      this.volume.carovy_kod = this.data.carKod;
      this.volume.id_titul = issue.id_titul;

      this.volume.signatura = issue.signatura;
      this.volume.vlastnik = issue.vlastnik;

      this.findTitul();
      const facetDatum: { name: string, type: string, value: number }[] = res.facet_counts.facet_ranges.datum_vydani.counts;
      this.years = facetDatum.filter(f => f.value > 0);
      this.mutace = res.facet_counts.facet_fields.mutace.filter(f => f.value > 0);
      this.znaky = res.facet_counts.facet_fields.znak_oznaceni_vydani.filter(f => f.value > 0);
      this.vydani = res.facet_counts.facet_fields.vydani.filter(f => f.value > 0);
      this.stavy = res.facet_counts.facet_fields.stav.filter(f => f.value > 0);
      this.fyzStavOk = !(res.facet_counts.facet_fields.stav.findIndex(f => f.name !== 'OK') > -1);
      this.prvniCislo = res.stats.stats_fields.cislo.min;
      this.posledniCislo = res.stats.stats_fields.cislo.max;
      this.loadDates(res.response.docs);
      this.processExemplars(res.response.docs);
      this.loading = false;
    });
  }

  loadDates(res) {
    const dates = this.service.getDaysArray(this.volume.datum_od, this.volume.datum_do);
    // this.chybejsicisla = [];
    let idx = 0;
    let issue: Issue = res[idx];
    // console.log(dates, issue.datum_vydani);
    // dates.forEach((dt) => {
    //   if (issue && this.datePipe.transform(issue.datum_vydani, 'yyyy-MM-dd') !== dt) {
    //     const exemplar = issue.exemplare.find(ex => ex.carovy_kod === this.data.carKod);


    //   } else {
    //     while (issue && this.datePipe.transform(issue.datum_vydani, 'yyyy-MM-dd') === dt) {
    //       idx++;
    //       issue = res[idx];


    //     }
    //   }
    // });
  }

  processExemplars(exs) {
    exs.forEach((ex: Exemplar) => {
      // issue.exemplare.forEach(ex => {
      //  if (ex.carovy_kod === this.data.carKod) {
      if (ex.stav && ex.stav.includes('PP') && ex.cislo >= 0) {
        this.stavyExt.push({ datum: ex.datum_vydani, cislo: ex.cislo });
      }

      if (ex.poznamka && ex.poznamka !== '') {
        this.poznamky.push({ datum: ex.datum_vydani, cislo: ex.cislo, note: ex.poznamka });
      }
      // if (ex.stav && ex.stav.includes('ChCC')) {
      //   this.chybejsicisla.push({ datum: ex.datum_vydani, cislo: ex.cislo });
      // }

      //  }
      // });
    });
  }


  findTitul() {
    this.service.getTitul(this.volume.id_titul).subscribe(res2 => {
      this.volume.titul = res2;
      this.volume.id_titul = this.volume.titul.id;

      // this.state.currentTitul = res2;

    });
  }

  viewSvazek() {
    this.router.navigate(['/svazek', this.data.carKod]);
  }
}
