import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { MzModalService } from 'ngx-materialize';
import { AddTitulDialogComponent } from 'src/app/components/add-titul-dialog/add-titul-dialog.component';
import { AppService } from 'src/app/app.service';
import { Titul } from 'src/app/models/titul';
import { Volume } from 'src/app/models/volume';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material';
import { PeriodicitaSvazku } from 'src/app/models/periodicita-svazku';

import { Issue } from 'src/app/models/issue';
import { CisloSvazku } from 'src/app/models/cislo-svazku';
import { DatePipe } from '@angular/common';
import { Utils } from 'src/app/utils';

@Component({
  selector: 'app-svazek',
  templateUrl: './svazek.component.html',
  styleUrls: ['./svazek.component.scss']
})
export class SvazekComponent implements OnInit {

  dsIssues: MatTableDataSource<CisloSvazku>;
  issueColumns = [
    'datum_vydani',
    'numExists',
    'addNextEdition',
    'cislo',
    'mutace',
    'vydani',
    'isPriloha',
    'nazev_prilohy',
    'pocet_stran',
    'znak_oznaceni_vydani',
    'destroyedPages',
    'degradated',
    'missingPages',
    'erroneousPaging',
    'erroneousDate',
    'erroneousNumbering',
    'wronglyBound',
    'censored'
  ];

  svazekColumns = [
    'attribute',
    'value'
  ];

  dsSvazek = [
    'titul',
    'mutace',
    'znak_oznaceni_vydani',
    'carovy_kod',
    'signatura',
    'datum_od',
    'prvni_cislo',
    'datum_do',
    'posledni_cislo',
    'vlastnik',
    'poznamka'
  ];

  displayedColumnsLeftTableBottom = Object.keys(new PeriodicitaSvazku());
  dsPeriodicita: MatTableDataSource<PeriodicitaSvazku>;

  subscriptions: Subscription[] = [];
  titul_idx: number;
  mutace_idx: number;
  mutace: string;
  oznaceni_idx: number;
  oznaceni: string;
  vlastnik_idx: number;

  mutations: { name: string, type: string, value: number }[];
  oznaceni_list: { name: string, type: string, value: number }[];

  cislaVeSvazku: CisloSvazku[];

  constructor(
    private modalService: MzModalService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    public state: AppState,
    private service: AppService) { }

  ngOnInit() {
    this.displayedColumnsLeftTableBottom.push('button');
    // this.issueColumns = Object.keys(new CisloSvazku());
    // this.issueColumns.push(...['numExist', 'addNextEdition']);
    this.read();
    this.subscriptions.push(this.service.langSubject.subscribe((lang) => {
      this.langChanged();
    }));
  }

  getDaysArray(start, end) {
    const arr = [];
    const dtend = new Date(end);
    for (let dt = new Date(start); dt <= dtend; dt.setDate(dt.getDate() + 1)) {
      arr.push(this.datePipe.transform(new Date(dt), 'yyyy-MM-dd'));
    }
    return arr;
  }

  loadIssues() {
    this.service.getIssuesOfVolume(this.state.currentVolume).subscribe(res => {
      const dates = this.getDaysArray(this.state.currentVolume.datum_od, this.state.currentVolume.datum_do);
      this.cislaVeSvazku = [];
      let idx = 0;
      let issue: Issue = res[idx];
      let odd = true;
      dates.forEach((dt) => {
        if (issue && this.datePipe.transform(issue.datum_vydani, 'yyyy-MM-dd') !== dt) {
          const is = Object.assign({}, issue);
          is.datum_vydani = dt;
          is.datum_vydani_den = this.datePipe.transform(dt, 'yyyyMMdd');
          this.cislaVeSvazku.push(new CisloSvazku(is, 'neexistujicicarovykod', odd));
        } else {
          while (issue && this.datePipe.transform(issue.datum_vydani, 'yyyy-MM-dd') === this.datePipe.transform(dt, 'yyyy-MM-dd')) {
            const cs = new CisloSvazku(issue, this.state.currentVolume.carovy_kod, odd);
            this.cislaVeSvazku.push(cs);
            idx++;
            issue = res[idx];
          }
        }
        odd = !odd;
      });

      this.dsIssues = new MatTableDataSource(this.cislaVeSvazku);
    });
  }

  findTitul() {
    this.service.getTitul(this.state.currentVolume.id_titul).subscribe(res2 => {
      this.state.currentVolume.titul = res2;
      this.state.currentTitul = res2;
      for (let i = 0; i < this.state.tituly.length; i++) {
        if (this.state.tituly[i].id === this.state.currentVolume.titul.id) {
          this.titul_idx = i;
        }
      }

      this.setVolumeFacets();

      for (let i = 0; i < this.state.config.owners.length; i++) {
        if (this.state.config.owners[i].name === this.state.currentVolume.vlastnik) {
          this.vlastnik_idx = i;
        }
      }

    });
  }

  setData(res: Volume[], id: string) {
    if (res.length > 0) {
      this.state.currentVolume = res[0];
      this.findTitul();
      this.loadIssues();
    } else {
      // Pokus o vytvoreni svazku podle existujici issue s carovy kodem

      this.service.searchByCarKod(id).subscribe(res2 => {

        if (res2['response']['numFound'] > 0) {
          const issue: Issue = <Issue>res2['response']['docs'][0];
          const datum_od = res2['stats']['stats_fields']['datum_vydani_den']['min'];
          const datum_do = res2['stats']['stats_fields']['datum_vydani_den']['max'];

          this.state.currentVolume = new Volume(
            this.datePipe.transform(Utils.dateFromDay(datum_od), 'yyyy-MM-dd'),
            this.datePipe.transform(Utils.dateFromDay(datum_do), 'yyyy-MM-dd'));
          this.state.currentVolume.carovy_kod = id;
          this.state.currentVolume.mutace = issue.mutace;
          this.state.currentVolume.znak_oznaceni_vydani = issue.znak_oznaceni_vydani;
          this.state.currentVolume.id_titul = issue.id_titul;
          issue.exemplare.forEach(ex => {
            this.state.currentVolume.signatura = ex.signatura;
            this.state.currentVolume.vlastnik = ex.vlastnik;
          });
          this.findTitul();
          this.loadIssues();
          
        } else {
          this.state.currentVolume = new Volume(this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
            this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
          this.state.currentVolume.carovy_kod = id;
        }
      });

    }

    this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);

  }

  setVolumeFacets() {
    this.service.getVolumeFacets(this.state.currentVolume.id_titul).subscribe(res => {
      this.oznaceni_idx = -1;
      this.oznaceni = '';
      this.mutace_idx = -1;
      this.mutace = '';
      this.oznaceni_list = Object.assign([], res['facet_counts']['facet_fields']['znak_oznaceni_vydani']);
      this.mutations = Object.assign([], res['facet_counts']['facet_fields']['mutace']);

      for (let i = 0; i < this.mutations.length; i++) {
        if (this.mutations[i].name === this.state.currentVolume.mutace) {
          this.mutace_idx = i;
          this.mutace = this.mutations[i].name;
        }
      }

      if (this.mutace_idx === -1) {
        // Udaj ve svazku neni mezi facety
        // Pridame
        this.mutations.push({ name: this.state.currentVolume.mutace, type: 'int', value: 0 });
        this.mutace_idx = this.mutations.length - 1;
        this.mutace = this.state.currentVolume.mutace;
      }


      for (let i = 0; i < this.oznaceni_list.length; i++) {
        if (this.oznaceni_list[i].name === this.state.currentVolume.znak_oznaceni_vydani) {
          this.oznaceni_idx = i;
          this.oznaceni = this.oznaceni_list[i].name;
        }
      }
      if (this.oznaceni_idx === -1) {
        // Udaj ve svazku neni mezi facety
        // Pridame
        this.oznaceni_list.push({ name: this.state.currentVolume.znak_oznaceni_vydani, type: 'int', value: 0 });
        this.oznaceni_idx = this.oznaceni_list.length - 1;
        this.oznaceni = this.state.currentVolume.znak_oznaceni_vydani;
      }


    });
  }

  langChanged() {

  }

  read() {

    this.dsIssues = new MatTableDataSource([]);

    this.state.currentTitul = new Titul();

    this.state.currentVolume = new Volume(this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      this.datePipe.transform(new Date(), 'yyyy-MM-dd'));

    this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      if (this.state.config) {
        this.service.getVolume(id).subscribe(res => {
          this.setData(res, id);
        });
      } else {
        this.subscriptions.push(this.state.configSubject.subscribe((state) => {
          this.service.getVolume(id).subscribe(res => {
            this.setData(res, id);
          });
        }));
      }
    }
  }

  save() {
    console.log(JSON.stringify(JSON.stringify(this.state.currentVolume)));
  }

  generateVolume() {

  }

  setTitul() {
    if (this.titul_idx.toString() === '-1') {
      // New titul dialog
      this.modalService.open(AddTitulDialogComponent,
        { 'state': this.state, 'service': this.service }
      );
    } else {
      this.state.currentVolume.titul = this.state.tituly[this.titul_idx];
      this.state.currentVolume.id_titul = this.state.currentVolume.titul.id;
      this.state.currentTitul = this.state.currentVolume.titul;
      this.setVolumeFacets();
    }
  }

  changeMutace() {
    this.state.currentVolume.mutace = this.state.config.mutations[this.mutace_idx];
  }

  changeOznaceni() {
    this.state.currentVolume.znak_oznaceni_vydani = this.state.config.znak_oznaceni_vydani[this.oznaceni_idx];

  }

  changeVlastnik() {
    this.state.currentVolume.vlastnik = this.state.config.owners[this.vlastnik_idx].name;
  }

  addVydani(element, idx) {
    this.state.currentVolume.periodicita.splice(idx, 0, Object.assign({}, element));
    this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
  }

  addIssue(element: CisloSvazku, idx: number) {
    this.cislaVeSvazku.splice(idx, 0, Object.assign({}, element));
    this.dsIssues = new MatTableDataSource(this.cislaVeSvazku);
  }

  rowColor(row): string {
    if (row.isPriloha) {
      return '#cce';
    }
    return row.odd ? '#fff' : '#eee';

  }

}


