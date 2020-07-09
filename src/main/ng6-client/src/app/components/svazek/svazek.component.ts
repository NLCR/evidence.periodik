import { Component, OnInit, ViewContainerRef, TemplateRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { AddTitulDialogComponent } from 'src/app/components/add-titul-dialog/add-titul-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AppService } from 'src/app/app.service';
import { Titul } from 'src/app/models/titul';
import { Volume } from 'src/app/models/volume';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatPaginator, MatDialog, MatDatepickerInputEvent, MatDatepicker, PageEvent } from '@angular/material';
import { PeriodicitaSvazku } from 'src/app/models/periodicita-svazku';

import { Issue } from 'src/app/models/issue';
import { CisloSvazku } from 'src/app/models/cislo-svazku';
import { DatePipe } from '@angular/common';
import { Utils } from 'src/app/utils';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Exemplar } from 'src/app/models/exemplar';
import { isArray } from 'util';
import { AppConfiguration } from 'src/app/app-configuration';
import { SvazekOverviewComponent } from '../svazek-overview/svazek-overview.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-svazek',
  templateUrl: './svazek.component.html',
  styleUrls: ['./svazek.component.scss']
})
export class SvazekComponent implements OnInit, OnDestroy {

  private overlayRef: OverlayRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('pickerOd', { read: undefined, static: false }) pickerOd: MatDatepicker<Date>;

  dsIssues: MatTableDataSource<CisloSvazku>;
  issueColumns = [
    'edit_issue',
    'datum_vydani',
    'numExists',
    'addNextEdition',
    'cislo',
    'mutace',
    'vydani',
    'nazev',
    'podnazev',
    'pocet_stran',
    'znak_oznaceni_vydani',
    'destroyedPages',
    'degradated',
    'missingPages',
    'erroneousPaging',
    'erroneousDate',
    'erroneousNumbering',
    'wronglyBound',
    'censored',
    'poznamka'
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

  cislaVeSvazku: CisloSvazku[] = [];
  popText: string;
  popShowPages: boolean;
  pagesRange: { label: string, sel: boolean }[];
  editingProp: string;
  csEditing: CisloSvazku;

  poznText: string;

  dataChanged: boolean;
  // private dataDiffer: KeyValueDiffer<string, any>;

  loading: boolean;

  // Holds dates in calendar. Should convert to yyyyMMdd for volume
  startDate = new FormControl(new Date());
  endDate = new FormControl(new Date());
  now = new Date();

  rows: number = 25;
  page: number = 0;
  numFound: number;

  constructor(
    public dialog: MatDialog,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    public config: AppConfiguration,
    public state: AppState,
    private service: AppService) { }

  ngOnInit() {
    this.displayedColumnsLeftTableBottom.push('button');
    this.read();
    this.subscriptions.push(this.service.langSubject.subscribe((lang) => {
      this.langChanged();
    }));
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



  pageChanged(e: PageEvent) {
    this.rows = e.pageSize;
    this.page = e.pageIndex;

    // this.loadIssues();
  }

  loadIssues() {
    this.service.getIssuesOfVolume(this.state.currentVolume).subscribe(res => {
      const dates = this.getDaysArray(this.state.currentVolume.datum_od, this.state.currentVolume.datum_do);
      this.numFound = res.numFound;
      this.cislaVeSvazku = [];
      let idx = 0;
      let issue: Issue = res.docs[idx];
      let odd = true;
      dates.forEach((dt) => {
        if (issue && this.datePipe.transform(issue.datum_vydani, 'yyyy-MM-dd') !== dt) {
          const is = Object.assign({}, issue);
          is.datum_vydani = dt;
          is.datum_vydani_den = this.datePipe.transform(dt, 'yyyyMMdd');
          is.cislo = null;
          is.id = null;
          //console.log(is.datum_vydani_den, issue);
          this.cislaVeSvazku.push(new CisloSvazku(is, 'neexistujicicarovykod', odd));
        } else {
          while (issue && this.datePipe.transform(issue.datum_vydani, 'yyyy-MM-dd') === this.datePipe.transform(dt, 'yyyy-MM-dd')) {
            const cs = new CisloSvazku(issue, this.state.currentVolume.carovy_kod, odd);
            this.cislaVeSvazku.push(cs);
            // console.log(cs.exemplar);
            idx++;
            issue = res.docs[idx];
          }
        }
        odd = !odd;
      });

      this.dsIssues = new MatTableDataSource(this.cislaVeSvazku);
      // this.dsIssues.paginator = this.paginator;
      this.loading = false;
    });
  }

  findTitul() {
    this.service.getTitul(this.state.currentVolume.id_titul).subscribe(res2 => {
      this.state.currentVolume.titul = res2;
      this.state.currentVolume.id_titul = this.state.currentVolume.titul.id;

      this.state.currentTitul = res2;
      for (let i = 0; i < this.state.tituly.length; i++) {
        if (this.state.tituly[i].id === this.state.currentVolume.titul.id) {
          this.titul_idx = i;
        }
      }

      this.setVolumeFacets();

      for (let i = 0; i < this.config.owners.length; i++) {
        if (this.config.owners[i].name === this.state.currentVolume.vlastnik) {
          this.vlastnik_idx = i;
        }
      }

    });
  }

  setData(res: Volume[], id: string) {
    if (res.length > 0) {
      this.state.currentVolume = res[0];
      this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
      this.findTitul();
      this.loadIssues();
    } else {
      // Pokus o vytvoreni svazku podle existujici issue s carovy kodem

      this.service.searchByCarKod(id).subscribe(res2 => {

        if (res2.response.numFound > 0) {
          const issue: Issue = res2.response.docs[0] as Issue;
          const datum_od = res2.stats.stats_fields.datum_vydani_den.min;
          const datum_do = res2.stats.stats_fields.datum_vydani_den.max;

          this.state.currentVolume = new Volume(
            this.datePipe.transform(Utils.dateFromDay(datum_od), 'yyyy-MM-dd'),
            this.datePipe.transform(Utils.dateFromDay(datum_do), 'yyyy-MM-dd'));
          this.state.currentVolume.id = id;
          this.state.currentVolume.carovy_kod = id;
          this.state.currentVolume.mutace = issue.mutace;
          this.state.currentVolume.znak_oznaceni_vydani = issue.znak_oznaceni_vydani;
          this.state.currentVolume.id_titul = issue.id_titul;
          issue.exemplare.forEach(ex => {
            if (ex.carovy_kod === id) {
              this.state.currentVolume.signatura = ex.signatura;
              this.state.currentVolume.vlastnik = ex.vlastnik;
            }
          });
          this.findTitul();
          this.loadIssues();

        } else {
          const d = new Date().getFullYear() + '-01-01';
          this.state.currentVolume = new Volume(d, d);
          this.state.currentVolume.carovy_kod = id;
          this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
          this.loading = false;
        }
      });

    }

    if (this.state.currentVolume) {
      this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
    }
  }

  setVolumeFacets() {
    this.service.getVolumeFacets(this.state.currentVolume.id_titul).subscribe(res => {
      this.oznaceni_idx = -1;
      this.oznaceni = '';
      this.mutace_idx = -1;
      this.mutace = '';
      this.oznaceni_list = Object.assign([], res.facet_counts.facet_fields.znak_oznaceni_vydani);
      this.mutations = Object.assign([], res.facet_counts.facet_fields.mutace);

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

  readClick() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.read_svazek.caption',
        text: 'modal.read_svazek.text',
        param: {
          value: ''
        }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.read();
      }
    });
  }

  read() {
    this.loading = true;
    this.dsIssues = new MatTableDataSource([]);

    this.state.currentTitul = new Titul();

    // this.state.currentVolume = new Volume(
    //   this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
    //   this.datePipe.transform(new Date(), 'yyyy-MM-dd'));


    // setTimeout(() => {
    //   this.state.currentVolume.datum_od = this.datePipe.transform(Utils.dateFromDay('20190101'), 'yyyy-MM-dd');
    //   this.state.currentVolume.datum_do = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    //   this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
    //   this.loading = false;
    // }, 100);

    const id = this.route.snapshot.paramMap.get('id');
    // if (id) {
    this.subscriptions.push(this.service.getVolume(id).subscribe(res => {
      this.setData(res, id);
    }));

    // } else {
    // }
  }

  setLastNumber() {
    if (this.state.currentVolume.posledni_cislo) {
      return;
    }
    const dates = this.getDaysArray(this.state.currentVolume.datum_od, this.state.currentVolume.datum_do);
    let idx = this.state.currentVolume.prvni_cislo;
    dates.forEach((dt) => {
      const dayStr = this.datePipe.transform(dt, 'EEEE');
      this.state.currentVolume.periodicita.forEach(p => {

        if (p.active) {
          if (p.den === dayStr) {
            idx++;
          }
        }
      });
    });
    this.state.currentVolume.posledni_cislo = idx - 1;
  }

  save() {
    if (!this.state.logged) {
      return;
    }
    // Ulozit svazek (volume) a vsechny radky tabulky jako Issue.

    // carovy_kod je povinny, jelikoz pouzivame jako id svazku
    if (!this.state.currentVolume.carovy_kod || this.state.currentVolume.carovy_kod.trim() === '') {
      this.setLastNumber();
      this.service.showSnackBar('snackbar.barcode_is_required', '', true);
      return;
    }

    if (!this.state.currentVolume.datum_od) {
      this.service.showSnackBar('snackbar.datum_od_is_required', '', true);
      return;
    }

    if (!this.state.currentVolume.datum_do) {
      this.service.showSnackBar('snackbar.datum_do_is_required', '', true);
      return;
    }

    if (this.state.currentVolume.datum_od > this.state.currentVolume.datum_do) {
      this.service.showSnackBar('snackbar.the_date_from_is_greater_than_the_date_to', '', true);
      return;
    }

    this.setLastNumber();

    const carovy_kod = this.state.currentVolume.carovy_kod;
    this.state.currentVolume.id = carovy_kod;

    const issues: Issue[] = [];

    // console.log(this.dsIssues.data);
    this.loading = true;
    let valid = true;
    this.dsIssues.data.forEach((cs: CisloSvazku) => {
      if (cs.numExists) {
        const issue: Issue = this.cisloSvazkuToIssue(cs);
        if (!issue) {
          return;
        }
        issues.push(issue);
      }
    });

    if (!valid) {
      this.loading = false;
      return;
    }

    this.service.saveIssues(this.state.currentVolume, issues).subscribe(res => {
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('snackbar.error_saving_volume', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.the_volume_was_saved_correctly');
      }

      // console.log(res);
    });

  }

  cisloSvazkuToIssue(cs: CisloSvazku): Issue {

    const carovy_kod = this.state.currentVolume.carovy_kod;
    if (!cs.cislo) {
      this.service.showSnackBar('číslo vytisku je povinne', '', true);
      return null;
    }
    const issue: Issue = Object.assign({}, cs.issue);
    issue.cislo = cs.cislo;
    issue.mutace = cs.mutace;
    issue.nazev = cs.nazev;
    issue.podnazev = cs.podnazev;
    issue.pocet_stran = cs.pocet_stran;
    issue.vydani = cs.vydani;
    // issue.znak_oznaceni_vydani = cs.znak_oznaceni_vydani;

    // update exemplar.
    // pokud neni, pridame
    const idx = issue.exemplare.findIndex(el => el.carovy_kod === carovy_kod);
    let ex: Exemplar;
    if (idx < 0) {
      ex = new Exemplar();
      ex.vlastnik = this.state.currentVolume.vlastnik;
      ex.carovy_kod = carovy_kod;
      ex.signatura = this.state.currentVolume.signatura;
      issue.exemplare.push(ex);
    } else {
      ex = issue.exemplare[idx];
    }

    const origStav = Object.assign([], ex.stav);

    if (cs.exemplar) {
      ex.pages = Object.assign({}, cs.exemplar.pages);
      ex.stav_popis = cs.exemplar.stav_popis;
    }

    ex.oznaceni = cs.znak_oznaceni_vydani;
    ex.stav = [];

    if (cs.destroyedPages) { ex.stav.push('PP'); }
    if (cs.degradated) { ex.stav.push('Deg'); }
    if (cs.missingPages) { ex.stav.push('ChS'); }
    if (cs.erroneousPaging) { ex.stav.push('ChPag'); }
    if (cs.erroneousDate) { ex.stav.push('ChDatum'); }
    if (cs.erroneousNumbering) { ex.stav.push('ChCis'); }
    if (cs.wronglyBound) { ex.stav.push('ChSv'); }
    if (cs.censored) { ex.stav.push('Cz'); }

    if (ex.stav.length === 0 && origStav.length > 0) {
      ex.stav.push('OK');
    }

    return issue;

  }

  generateClick() {

    if (!this.state.logged) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.generate_svazek.caption',
        text: 'modal.generate_svazek.text',
        param: {
          value: ''
        }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.generate();
      }
    });
  }

  generate() {
    const dates = this.getDaysArray(this.state.currentVolume.datum_od, this.state.currentVolume.datum_do);
    this.cislaVeSvazku = [];
    let idx = this.state.currentVolume.prvni_cislo;

    let odd = true;
    dates.forEach((dt) => {

      const dayStr = this.datePipe.transform(dt, 'EEEE');
      let inserted = false;
      this.state.currentVolume.periodicita.forEach(p => {

        if (p.active) {
          if (p.den === dayStr) {
            const is = new Issue();
            is.datum_vydani = dt;
            is.datum_vydani_den = this.datePipe.transform(dt, 'yyyyMMdd');
            is.id_titul = this.state.currentVolume.id_titul;
            is.meta_nazev = this.state.currentVolume.titul.meta_nazev;
            const ex = new Exemplar();
            ex.carovy_kod = this.state.currentVolume.carovy_kod;
            ex.oznaceni = this.state.currentVolume.znak_oznaceni_vydani;
            ex.signatura = this.state.currentVolume.signatura;
            ex.vlastnik = this.state.currentVolume.vlastnik;
            is.exemplare.push(ex);
            const cvs = new CisloSvazku(is, this.state.currentVolume.carovy_kod, odd);
            cvs.mutace = this.state.currentVolume.mutace;
            cvs.numExists = true;
            cvs.pocet_stran = p.pocet_stran;
            cvs.nazev = p.nazev;
            cvs.podnazev = p.podnazev;
            cvs.vydani = p.vydani;
            cvs.cislo = idx;
            idx++;
            inserted = true;
            this.cislaVeSvazku.push(cvs);
          }
        }

      });

      if (!inserted) {
        const issue = new Issue();
        issue.datum_vydani = dt;
        issue.datum_vydani_den = this.datePipe.transform(dt, 'yyyyMMdd');
        issue.id_titul = this.state.currentVolume.id_titul;
        issue.meta_nazev = this.state.currentVolume.titul.meta_nazev;
        const ex = new Exemplar();
        ex.carovy_kod = this.state.currentVolume.carovy_kod;
        ex.oznaceni = this.state.currentVolume.znak_oznaceni_vydani;
        ex.signatura = this.state.currentVolume.signatura;
        ex.vlastnik = this.state.currentVolume.vlastnik;
        issue.exemplare.push(ex);
        const cvs2 = new CisloSvazku(issue, this.state.currentVolume.carovy_kod, odd);
        cvs2.mutace = this.state.currentVolume.mutace;
        cvs2.numExists = false;
        this.cislaVeSvazku.push(cvs2);
      }

      odd = !odd;
    });

    this.dsIssues = new MatTableDataSource(this.cislaVeSvazku);
  }

  setTitul() {
    if (this.titul_idx.toString() === '-1') {
      // New titul dialog
      const dialogRef = this.dialog.open(AddTitulDialogComponent, {
        width: '650px'
      });

    } else {
      this.state.currentVolume.titul = this.state.tituly[this.titul_idx];
      this.state.currentVolume.id_titul = this.state.currentVolume.titul.id;
      this.state.currentTitul = this.state.currentVolume.titul;
      this.setVolumeFacets();
    }
  }

  changeMutace() {
    this.state.currentVolume.mutace = this.config.mutations[this.mutace_idx];
  }

  changeOznaceni() {
    this.state.currentVolume.znak_oznaceni_vydani = this.config.znak_oznaceni_vydani[this.oznaceni_idx];

  }

  changeVlastnik() {
    this.state.currentVolume.vlastnik = this.state.owners[this.vlastnik_idx].name;
  }

  addVydani(element, idx: number) {
    const n = Object.assign([], this.state.currentVolume.periodicita);
    n.splice(idx + 1, 0, Object.assign({}, element));
    this.state.currentVolume.periodicita = Object.assign([], n);
    // this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
  }

  checkElementExists(cs: CisloSvazku) {
    this.service.searchIssueByDate(this.datePipe.transform(cs.datum_vydani, 'yyyyMMdd'), this.state.currentVolume.id_titul)
      .subscribe((docs: any[]) => {
        if (docs.length > 0) {
          let found = false;
          docs.forEach((doc: Issue) => {
            console.log(doc.exemplare);
            const exe: Exemplar = doc.exemplare.find(ex => ex.carovy_kod === this.state.currentVolume.carovy_kod);
            if (exe) {
              cs.issue = Object.assign({}, doc);
              cs.exemplar = Object.assign({}, exe);
              found = true;
            }
          });

          if (!found) {
            // Issue exists but not the exemplar
            cs.id_issue = docs[0].id;
            cs.issue = Object.assign({}, docs[0]);
            cs.exemplar = new Exemplar();
            cs.exemplar.carovy_kod = this.state.currentVolume.carovy_kod;
          }
        } else {
          cs.exemplar = new Exemplar();
          cs.exemplar.carovy_kod = this.state.currentVolume.carovy_kod;
        }
      });
    // if (!cs.exemplar) {
    //   const exe: Exemplar = cs.issue.exemplare.find(ex => ex.carovy_kod === this.state.currentVolume.carovy_kod);
    //   if (exe) {
    //     cs.exemplar = Object.assign({}, exe);
    //   } else {
    //     cs.exemplar = new Exemplar();
    //     cs.exemplar.carovy_kod = this.state.currentVolume.carovy_kod;
    //   }
    // }
  }

  addIssue(element: CisloSvazku, idx: number) {
    const newEl = Object.assign({}, element);
    newEl.vydani = '';
    newEl.destroyedPages = false;
    newEl.degradated = false;
    newEl.missingPages = false;
    newEl.erroneousPaging = false;
    newEl.erroneousDate = false;
    newEl.erroneousNumbering = false;
    newEl.wronglyBound = false;
    newEl.censored = false;
    newEl.exemplar.pages = { missing: [], damaged: [] };
    newEl.exemplar.stav = [];
    newEl.exemplar.stav_popis = '';

    this.cislaVeSvazku.splice(idx + 1, 0, newEl);
    this.dsIssues = new MatTableDataSource(this.cislaVeSvazku);
  }

  rowColor(row): string {
    if (row.isPriloha) {
      return '#fce4ec'; // #cce
    }
    return row.odd ? '#fff' : '#f5f5f5';
  }

  viewPozn(el: CisloSvazku, template: TemplateRef<any>, relative: any) {
    this.closeInfoOverlay();
    this.csEditing = el;
    this.poznText = el.exemplar.poznamka;
    setTimeout(() => {
      this.openInfoOverlay(relative._elementRef, template, 35);
    }, 100);
  }


  viewPS(el: CisloSvazku, prop: string, relative: any, template: TemplateRef<any>) {

    // Back compatibility.
    // From pages : string[] to pages: {missing: string[], damaged: string[]}
    // Assign to missing
    if (el.exemplar.pages && isArray(el.exemplar.pages)) {
      const pages = Object.assign([], el.exemplar.pages);
      el.exemplar.pages = { missing: Object.assign([], el.exemplar.pages), damaged: [] };
    }

    this.csEditing = el;

    const openPop = (el.exemplar.stav_popis && el.exemplar.stav_popis !== '') || prop === 'missingPages' || prop === 'destroyedPages';
    if (openPop) {
      this.closeInfoOverlay();
      this.editingProp = prop === 'missingPages' ? 'missing' : 'damaged';
      setTimeout(() => {
        if (el[prop]) {
          this.popText = el.exemplar.stav_popis;
          this.popShowPages = prop === 'missingPages' || prop === 'destroyedPages';
          if (this.popShowPages) {
            this.pagesRange = [];
            for (let i = 0; i < el.pocet_stran; i++) {
              const sel = el.exemplar.pages && el.exemplar.pages[this.editingProp] && el.exemplar.pages[this.editingProp].includes((i + 1) + '');
              this.pagesRange.push({ label: (i + 1) + '', sel });
            }
          }
          this.openInfoOverlay(relative._elementRef, template);
        }
      }, 500);
    }
  }

  viewIssue(issue: Issue) {
    this.state.currentTitul = new Titul();
    this.state.currentTitul.id = issue.id_titul;
    this.state.currentTitul.meta_nazev = issue.nazev;
    this.router.navigate(['/issue', issue.id]);
  }

  updatePages() {

    this.csEditing.exemplar.pages[this.editingProp] = [];
    this.pagesRange.forEach(p => {
      if (p.sel) {
        this.csEditing.exemplar.pages[this.editingProp].push(p.label);
      }
    });
    this.csEditing.exemplar.stav_popis = this.popText;
    const issue: Issue = this.cisloSvazkuToIssue(this.csEditing);
    if (!issue) {
      return;
    }
    this.service.saveIssue(issue).subscribe(res => {
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('snackbar.error_saving_volume', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.the_volume_was_saved_correctly');
      }
      this.closePop();
    });

  }

  updatePoznamka() {
    this.csEditing.exemplar.poznamka = this.poznText;
    this.csEditing.poznamka = this.poznText;
    this.closePop();
  }

  ngOnDestroy() {
    this.closeInfoOverlay();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  closePop() {
    this.closeInfoOverlay();
  }

  openInfoOverlay(relative: any, template: TemplateRef<any>, xOffset: number = 6) {
    this.closeInfoOverlay();

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().flexibleConnectedTo(relative).withPositions([{
        overlayX: 'end',
        overlayY: 'top',
        originX: 'center',
        originY: 'bottom'
      }]).withPush().withViewportMargin(30).withDefaultOffsetX(xOffset).withDefaultOffsetY(20),
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: false,
      backdropClass: 'popover-backdrop'
    });
    // this.overlayRef.backdropClick().subscribe(() => this.closeInfoOverlay());

    const portal = new TemplatePortal(template, this.viewContainerRef);
    this.overlayRef.attach(portal);
  }

  closeInfoOverlay() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  setVolumeDatum(element: string, event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.state.currentVolume[element] = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    } else if (this.state.currentVolume[element]) {
      // const d: Date = Utils.dateFromDay(e.value);
      // this.pickerOd.select(d);
    }

  }

  dateChanged(element, e) {
    console.log(element, e.target.value);
  }

  showSvazekOverview() {
    const dialogRef = this.dialog.open(SvazekOverviewComponent, {
      width: '650px',
      data: {
        carKod: this.state.currentVolume.carovy_kod
      }
    });
  }

  log(element) {
    console.log(element);
  }

}


