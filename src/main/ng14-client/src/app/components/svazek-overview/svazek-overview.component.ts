import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { AppConfiguration } from 'src/app/app-configuration';
import { Volume } from 'src/app/models/volume';
import { Utils } from 'src/app/utils';
import { Router } from '@angular/router';
import { Exemplar } from 'src/app/models/exemplar';
import {combineLatestWith, ReplaySubject, takeUntil} from "rxjs";

@Component({
  selector: 'app-svazek-overview',
  templateUrl: './svazek-overview.component.html',
  styleUrls: ['./svazek-overview.component.scss']
})
export class SvazekOverviewComponent implements OnInit, OnDestroy {

  volume: Volume;

  signatury: string[] = [];
  years: { name: string, type: string, value: number }[] = [];
  mutace: { name: string, type: string, value: number }[] = [];
  vydani: { name: string, type: string, value: number }[] = [];
  znaky: { name: string, type: string, value: number }[] = [];
  stavy: { name: string, value: number }[] = [];
  ok: {yes: number, no: number} = {yes: 0, no: 0}
  // missingNumbers: { date: string, day: string }[] = [];
  missingNumbers: { date: string, number: number }[] = [];
  fyzStavOk: boolean;
  stavyExt: { datum: Date, cislo: number }[] = [];
  poznamky: { datum: Date, cislo: number, note: string }[] = [];

  prvniCislo: number;
  posledniCislo: number;
  pageCount: number

  loading: boolean;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

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

    const exemplars$ = this.service.volumeOverview(this.data.carKod, this.data.idTitul)
    const periodicals$ = this.service.getPeriodicals(this.data.carKod)

    exemplars$.pipe(combineLatestWith(periodicals$), takeUntil(this.destroyed$)).subscribe(([exemplars, periodicals]) => {
      const facets = exemplars.facet_counts.facet_fields
      const stats = exemplars.stats.stats_fields
      const exRes = exemplars.response.docs

      const issue: Exemplar = exRes[0] as Exemplar;
      const datum_od = stats.datum_vydani_den.min;
      const datum_do = stats.datum_vydani_den.max;
      this.volume = new Volume(
        this.datePipe.transform(Utils.dateFromDay(datum_od), 'yyyy-MM-dd'),
        this.datePipe.transform(Utils.dateFromDay(datum_do), 'yyyy-MM-dd'));
      this.volume.carovy_kod = this.data.carKod;
      this.volume.id_titul = issue.id_titul;

      this.volume.signatura = issue.signatura;
      this.volume.vlastnik = issue.vlastnik;

      this.findTitul();
      const facetDatum: { name: string, type: string, value: number }[] = exemplars.facet_counts.facet_ranges.datum_vydani.counts;
      this.years = facetDatum.filter(f => f.value > 0);
      this.mutace = facets.mutace.filter(f => f.value > 0);
      this.znaky = facets.znak_oznaceni_vydani.filter(f => f.value > 0);
      this.vydani = facets.vydani.filter(f => f.value > 0);
      this.stavy = facets.stav.filter(f => f.value > 0 && f.name !== "OK");
      this.fyzStavOk = !(facets.stav.findIndex(f => f.name !== 'OK') > -1);
      this.ok.yes = exRes.filter(ex => ex.numExists && ex.stav.find(s => s === "OK")).length
      this.ok.no = exRes.filter(ex => ex.numExists && !ex.stav.find(s => s === "OK")).length

      const numbers = exRes.map(e => parseInt(e.cislo)).filter(n => !isNaN(n))
      this.prvniCislo = Math.min(...numbers)
      this.posledniCislo = Math.max(...numbers)

      //bug fix -- solr returns bad numbers because property is string instead of number
      // this.prvniCislo = res.stats.stats_fields.cislo.min;
      // this.posledniCislo = res.stats.stats_fields.cislo.max;
      this.pageCount = stats.pocet_stran.sum
      this.setMissingPeriodicals(periodicals[0].periodicita, exRes)
      this.processExemplars(exRes);
      this.loading = false;

    })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getDaysArray(start, end) {
    const arr = [];
    const dtend = this.datePipe.transform(new Date(end), 'yyyy-MM-dd');
    const dt = new Date(start);

    while (this.datePipe.transform(dt, 'yyyy-MM-dd') <= dtend) {
      arr.push(this.datePipe.transform(new Date(dt), 'yyyy-MM-dd'));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }

  setMissingPeriodicals(periodicals, exemplars){
    const dates = this.getDaysArray(this.volume.datum_od, this.volume.datum_do);
    const datesWithExemplars = dates.map((d) => {
      return {date: d, exemplar: exemplars.find(ex => ex.datum_vydani === d && !ex.isPriloha)}
    })

    // let missingExemplars = []
    datesWithExemplars.forEach((dx) => {
    // exemplars.forEach((dx) => {
    //   const dayStr = this.datePipe.transform(dx.date, 'EEEE')
      // const foundedPeriodic = periodicals.find(ap => ap.den === dayStr && ap.active)
      // if(foundedPeriodic && !dx.exemplar.length){
      if(dx.exemplar?.missing_number){
        this.missingNumbers.push({date: dx.exemplar.datum_vydani, number: dx.exemplar.cislo})
      }
    })
  }

  processExemplars(exs) {
    exs.forEach((ex: Exemplar) => {
      if (ex.stav && ex.stav.includes('PP') && ex.cislo >= 0) {
        this.stavyExt.push({ datum: ex.datum_vydani, cislo: ex.cislo });
      }

      if (ex.poznamka && ex.poznamka !== '') {
        this.poznamky.push({ datum: ex.datum_vydani, cislo: ex.cislo, note: ex.poznamka });
      }
    });
  }


  findTitul() {
    this.service.getTitul(this.volume.id_titul).subscribe(res2 => {
      this.volume.titul = res2;
      this.volume.id_titul = this.volume.titul.id;
    });
  }

  viewSvazek() {
    return this.router.navigate(['/svazek', this.data.carKod]);
  }
}
