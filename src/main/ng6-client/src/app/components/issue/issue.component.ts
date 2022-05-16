import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppState } from '../../app.state';
import { AppService } from '../../app.service';

import { Issue } from '../../models/issue';
import { Titul } from '../../models/titul';
import { Exemplar } from '../../models/exemplar';
import { AddTitulDialogComponent } from '../add-titul-dialog/add-titul-dialog.component';
import { AddVydaniDialogComponent } from '../add-vydani-dialog/add-vydani-dialog.component';
import { EditPagesComponent } from 'src/app/components/edit-pages/edit-pages.component';
import { AppConfiguration } from 'src/app/app-configuration';
import { MatDialog } from '@angular/material/dialog';
import { SvazekOverviewComponent } from '../svazek-overview/svazek-overview.component';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.scss']
})
export class IssueComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  changingLang = false;
  titul_idx: number;

  initial_pages = 0;

  loading: boolean;

  pagesRange: { label: string, index: number }[] = [];

  constructor(
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    public state: AppState,
    private service: AppService,
    public config: AppConfiguration) {
  }

  onSubmit() {
    // console.log(this.issue);
  }


  showPages(ex: Exemplar): boolean {
    return ex.pagesRange && ex.stav && !ex.stav.includes('OK');
  }

  setPagesRange() {
    // this.pagesRange = [];
    // if (this.state.currentIssue.pages.length === 0) {
    //   for (let i = 0; i < this.state.currentIssue.pocet_stran; i++) {
    //     this.pagesRange.push({ label: (i + 1) + '', index: i });
    //   }
    // } else {
    //   this.pagesRange = this.state.currentIssue.pages;
    //   if (this.state.currentIssue.pages.length < this.state.currentIssue.pocet_stran) {
    //     for (let i = this.state.currentIssue.pages.length; i < this.state.currentIssue.pocet_stran; i++) {
    //       this.pagesRange.push({ label: (i + 1) + '', index: i });
    //     }
    //   }
    // }

    this.pagesRange = [];
    for (let i = 0; i < this.state.currentIssue.pocet_stran; i++) {
      this.pagesRange.push({ label: (i + 1) + '', index: i });
    }

    if (!this.state.currentIssue.hasOwnProperty('exemplare')) {
      this.state.currentIssue.exemplare = [];
    } else {

      this.state.currentIssue.exemplare.forEach((ex: Exemplar) => {
        ex.pagesRange = { missing: [], damaged: [] };

        // Back compatibility.
        // From pages : string[] to pages: {missing: string[], damaged: string[]}
        // Assign to missing
        if (ex.pages && Array.isArray(ex.pages) || !ex.pages.missing) {
          const pages = Object.assign([], ex.pages);
          ex.pages = { missing: Object.assign([], ex.pages), damaged: Object.assign([], ex.pages) };
        }

        for (let i = 0; i < this.state.currentIssue.pocet_stran; i++) {
          const sel = ex.pages && ex.pages.missing.includes((i + 1) + '');
          ex.pagesRange.missing.push({ label: this.pagesRange[i].label, sel });
          const sel2 = ex.pages && ex.pages.damaged.includes((i + 1) + '');
          ex.pagesRange.damaged.push({ label: this.pagesRange[i].label, sel: sel2 });
        }
      });
    }
  }

  checkPagesChanged() {
    if (this.initial_pages < this.state.currentIssue.pocet_stran) {
      this.setPagesRange();
      // Pridat chybejici stranky pro vsechny exemplare
      // this.state.currentIssue.exemplare.forEach((ex: Exemplar) => {
      //   if (!ex.stav) {
      //     ex.stav = ['ChS'];
      //   } else if (!ex.stav.includes('ChS')) {
      //     ex.stav.push('ChS');
      //   }
      //   if (ex.stav.includes('OK')) {
      //     ex.stav.splice(ex.stav.indexOf('OK'), 1);
      //   }
      //   for (let i = this.initial_pages; i < this.state.currentIssue.pocet_stran; i++) {
      //     ex.pagesRange[i].sel = true;
      //   }
      // });
    }
    this.initial_pages = this.state.currentIssue.pocet_stran;
  }

  setData(res: any[]) {
    if (res.length > 0) {
      this.state.currentIssue = new Issue().fromJSON(res[0]);
      this.state.currentIssue.exemplare = Object.assign([], res);
      console.log(this.state.currentIssue);
      this.initial_pages = this.state.currentIssue.pocet_stran;

      this.setPagesRange();
      // console.log(this.state.currentIssue);
      this.service.getTitul(this.state.currentIssue.id_titul).subscribe(res2 => {
        this.state.currentIssue.titul = res2;
        this.state.currentTitul = res2;
        for (let i = 0; i < this.state.tituly.length; i++) {
          if (this.state.tituly[i].id === this.state.currentIssue.titul.id) {
            this.titul_idx = i;
          }
        }
      });
    } else {
      this.state.currentIssue = new Issue();
    }
    //  console.log(this.state.currentIssue);
  }

  setTitul() {
    if (this.titul_idx.toString() === '-1') {
      // New titul dialog
      /* this.modalService.open(AddTitulDialogComponent,
        { 'state': this.state, 'service': this.service }
      ); */
      const dialogRef = this.dialog.open(AddTitulDialogComponent, {
        width: '250px'
      });
    } else {
      this.state.currentIssue.titul = this.state.tituly[this.titul_idx];
      this.state.currentIssue.id_titul = this.state.currentIssue.titul.id;
      this.state.currentIssue.meta_nazev = this.state.currentIssue.titul.meta_nazev;
      this.state.currentTitul = this.state.currentIssue.titul;

      this.state.currentIssue.periodicita = this.state.currentIssue.titul.periodicita;

      // this.state.currentIssue.pocet_stran = this.state.currentIssue.titul.pocet_stran;
    }
  }

  langChanged() {
    //    this.cdRef.detectChanges();
    this.cdRef.detectChanges();

    this.changingLang = true;
    setTimeout(() => {
      this.cdRef.detectChanges();
      this.changingLang = false;
    }, 1);
  }


  ngOnDestroy() {
    this.subscriptions.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subscriptions = [];
  }

  ngOnInit() {
    this.loading = true;
    this.state.currentTitul = new Titul();
    this.state.currentIssue = new Issue();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.state.isNewIssue = false;

      this.service.getIssue(id).subscribe(res => {
        this.setData(res);
        this.loading = false;
      });

    } else {

      this.state.isNewIssue = true;
    }


    this.subscriptions.push(this.service.langSubject.subscribe((lang) => {
      this.langChanged();
    }));
  }

  addExemplar() {
    this.changingLang = true;
    setTimeout(() => {

      this.state.currentIssue.exemplare.push(new Exemplar());
      this.changingLang = false;
    }, 1);
  }

  removeExemplar(idx: number) {
    this.changingLang = true;
    setTimeout(() => {

      this.state.currentIssue.exemplare.splice(idx, 1);
      this.changingLang = false;
    }, 1);

  }

  addPub() {
    /*  this.modalService.open(AddVydaniDialogComponent,
       { 'issue': this.state.currentIssue, 'state': this.state, 'service': this.service }
     ); */
    const dialogRef = this.dialog.open(AddVydaniDialogComponent, {
      width: '250px',
      data: { issue: this.state.currentIssue }
    });

  }


  editPages() {

    const dialogRef = this.dialog.open(EditPagesComponent, {
      width: '250px',
      data: { issue: this.state.currentIssue }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setPagesRange();
      }
    });

    /* const a = this.modalService.open(EditPagesComponent,
      { 'issue': this.state.currentIssue, 'state': this.state, 'service': this.service }
    );
    a.onDestroy(() => {
      const mm = <EditPagesComponent>a.instance;
      if (mm.saved) {
        this.setPagesRange();
      }
    }); */
  }

  formatPages() {
    let s = '';
    this.pagesRange.forEach(p => {
      s += p.label + ', ';
    });
    return s;
  }

  filterOznaceni(e: string, ex: Exemplar) {
    ex.oznaceni = new Array(e.length + 1).join(this.state.currentIssue.znak_oznaceni_vydani);
  }

  // setDatum(element: string, event: MatDatepickerInputEvent<Date>) {
  //   if (event.value) {
  //     this.state.currentIssue.datum_vydani = this.datePipe.transform(event.value, 'yyyy-MM-dd');
  //   }

  // }

  onCalendarClick() {
    this.router.navigate([
      '/calendar',
      this.state.currentIssue.id_titul,
      this.state.calendarView,
      this.state.currentIssue.datum_vydani_den
    ]);
  }

  test() {
    console.log(this.state.currentIssue.exemplare);
    this.service.isIssueValid(this.state.currentIssue);
    console.log(this.state.currentIssue.exemplare);
  }

  openUrl(url: string) {
    console.log(url);
    window.open(url, '_blank');
  }

  viewSvazek(car_kod: string) {
    this.state.currentTitul = new Titul();
    this.router.navigate(['/svazek', car_kod]);
  }

  showSvazekOverview(carKod: string) {
    const dialogRef = this.dialog.open(SvazekOverviewComponent, {
      width: '650px',
      data: {
        carKod
      }
    });
  }
}

