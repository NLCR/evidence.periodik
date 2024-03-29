import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  Renderer2
} from '@angular/core';
import {AppState} from 'src/app/app.state';
import {AddTitulDialogComponent} from 'src/app/components/add-titul-dialog/add-titul-dialog.component';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {AppService} from 'src/app/app.service';
import {Titul} from 'src/app/models/titul';
import {BaseInfo, Volume} from 'src/app/models/volume';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatestWith, ReplaySubject, takeUntil} from 'rxjs';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {PeriodicitaSvazku} from 'src/app/models/periodicita-svazku';
import {Issue} from 'src/app/models/issue';
import {DatePipe, Location} from '@angular/common';
import {Utils} from 'src/app/utils';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {Exemplar, ExemplarStates} from 'src/app/models/exemplar';
import {AppConfiguration} from 'src/app/app-configuration';
import {SvazekOverviewComponent} from '../svazek-overview/svazek-overview.component';
// import {FormControl} from '@angular/forms';
import moment from 'moment'
import {SplitAreaDirective, SplitComponent} from 'angular-split'
import {ComponentCanDeactivate} from "../can-deactivate/component-can-deactivate";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-svazek',
  templateUrl: './svazek.component.html',
  styleUrls: ['./svazek.component.scss']
})
export class SvazekComponent extends ComponentCanDeactivate implements OnInit, OnDestroy {

  private overlayRef: OverlayRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('pickerOd', { read: undefined }) pickerOd: MatDatepicker<Date>;
  @ViewChild('split') split: SplitComponent
  @ViewChild('area1') area1: SplitAreaDirective
  @ViewChild('area2') area2: SplitAreaDirective

  sizes = {
    percent: {
      area1: 30,
      area2: 70,
    }
  }

  dsExemplars: MatTableDataSource<Exemplar>;
  issueColumns = [
    // 'edit_issue',
    'datum_vydani',
    'numExists',
    "missing_number",
    'addNextEdition',
    'cislo',
    "cislo_prilohy",
    'mutace',
    'vydani',
    'nazev',
    'podnazev',
    'pocet_stran',
    'znak_oznaceni_vydani',
    'complete',
    // 'chybiCislo',
    'destroyedPages',
    'degradated',
    'missingPages',
    'erroneousPaging',
    'erroneousDate',
    'erroneousNumbering',
    'wronglyBound',
    'necitelneSvazano',
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
    "year",
    'datum_od',
    'prvni_cislo',
    'datum_do',
    'posledni_cislo',
    'vlastnik',
    'poznamka'
  ];

  // volume_znak_oznaceni_vydani_defaults = [
  //   { value: "", name: "desc.without_name"},
  //   { value: "•"},
  //   { value: "•••"},
  //   { value: "●●"},
  //   { value: "●●●●"},
  //   { value: "*"},
  //   { value: "**"},
  //   { value: "***"},
  //   { value: "****"},
  //   { value: "******"},
  //   { value: "■"},
  //   { value: "■■"}
  // ]

  volume_znak_oznaceni_vydani_defaults = [
    { value: "●"},
    { value: "○"},
    { value: "■"},
    { value: "□"},
    { value: "★"},
    { value: "☆"},
    { value: "△"},
    { value: "▲"},
    { value: "✶"},
  ]

  znak_oznaceni_vydani_select_open = {
    open: false,
    id: ""
  }
  znak_oznaceni_vydani_select_click = false


  displayedColumnsLeftTableBottom = Object.keys(new PeriodicitaSvazku());
  dsPeriodicita: MatTableDataSource<PeriodicitaSvazku>;

  // subscriptions: Subscription[] = [];
  titul_idx: number;
  mutace_idx: number;
  mutace: string;
  oznaceni_idx: number;
  oznaceni: string;
  // vlastnik_idx: number;

  // mutations: { name: string, type: string, value: number }[];
  oznaceni_list: { name: string, type: string, value: number }[];

  // cislaVeSvazku: CisloSvazku[] = [];
  exemplars: Exemplar[] = [];
  popText: string;
  popShowPages: boolean;
  pagesRange: { label: string, sel: boolean }[];
  editingProp: string;
  csEditing: Exemplar;

  poznText: string;

  dataChanged = false;
  // private dataDiffer: KeyValueDiffer<string, any>;

  loading: boolean;

  isOwner = false

  // Holds dates in calendar. Should convert to yyyyMMdd for volume
  // startDate = new FormControl(new Date());
  // endDate = new FormControl(new Date());
  // now = new Date();

  // rows = 25;
  // page = 0;
  numFound: number;

  minDate: Date;
  maxDate: Date;
  newVolumeID = null
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  exemplarsAutocomplete = {
    name: [],
    subName: []
  }
  periodicalsAutocomplete = {
    name: [],
    subName: []
  }
  attachmentsAutocomplete = {
    name: [],
    subName: []
  }

  canDeactivate(): boolean {
    return !this.dataChanged
  }

  constructor(
    public dialog: MatDialog,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    public config: AppConfiguration,
    public state: AppState,
    private location: Location,
    private service: AppService,
    private renderer: Renderer2
  ) {
    super();
    this.renderer.listen('window', 'click', (e: Event) => {
      if (!this.znak_oznaceni_vydani_select_click) {
        this.znak_oznaceni_vydani_select_open.open = false;
        this.znak_oznaceni_vydani_select_open.id = ""
      }
      this.znak_oznaceni_vydani_select_click = false;
    });
  }

  ngOnInit() {
    this.displayedColumnsLeftTableBottom.push('button');
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(1600, 0, 1);
    this.maxDate = new Date(currentYear, 11, 31);
    this.read();
    // this.subscriptions.push(this.service.langSubject.subscribe((lang) => {
    //   this.langChanged();
    // }));
  }

  openDropdownTable(id: string){
    if(!this.znak_oznaceni_vydani_select_open.open) {
      this.znak_oznaceni_vydani_select_open.open = true
      this.znak_oznaceni_vydani_select_open.id = id
    }
    if(this.znak_oznaceni_vydani_select_open.open && this.znak_oznaceni_vydani_select_open.id !== id){
      this.znak_oznaceni_vydani_select_open.id = id
    }
  }

  preventDropdownTableClose(){
    this.znak_oznaceni_vydani_select_click = true
  }

  selectZnakOznaceniVydani(value: string, exemplar: Exemplar = null){
    if(exemplar){
      const currentValue = exemplar.znak_oznaceni_vydani
      if(currentValue === "" || currentValue.includes(value)){
        exemplar.znak_oznaceni_vydani += value
        this.setDataChanged()
      }
    }else{
      const currentValue = this.state.currentVolume.znak_oznaceni_vydani
      if(currentValue === "" || currentValue.includes(value)){
        this.state.currentVolume.znak_oznaceni_vydani += value
        this.updateExemplars(this.state.currentVolume.znak_oznaceni_vydani, 'znak_oznaceni_vydani')
      }
    }
  }

  dragEnd({ sizes }) {
    this.sizes.percent.area1 = sizes[0]
    this.sizes.percent.area2 = sizes[1]
  }

  read() {
    this.loading = true;
    this.dsExemplars = new MatTableDataSource([]);
    this.state.currentTitul = new Titul();
    const id = this.newVolumeID || this.route.snapshot.paramMap.get('id');
    this.setData(id);
  }

  setData(id: string) {
    this.service.getVolume(id).subscribe(res => {
      if (res.length > 0) {
        this.state.currentVolume = res[0];

        //vydani migration fix to ids
        const permPeriodicals = Object.assign([], this.state.currentVolume.periodicita)
        const editedPeriodicals = []
        permPeriodicals.forEach(p => {
          const found = this.state.vydani.find(v => v.name === p.vydani)
          if(found){
            editedPeriodicals.push({...p, vydani: found.id.toString()})
          } else{
            editedPeriodicals.push(p)
          }
        })
        this.state.currentVolume.periodicita = editedPeriodicals

        this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
        const dateRange = 'datum_vydani:[' + res[0].datum_od + ' TO ' + res[0].datum_do + ']';
        this.findTitul();
        this.getExemplars(id, dateRange, false, this.state.currentVolume.show_attachments_at_the_end);
      } else {
        this.getExemplars(id, '*', true, false);
        // this.vlastnik_idx = -1;
      }
    });
  }

  setExemplarsAutocomplete(){
    const periodicals = this.state.currentVolume.periodicita.filter(p => p.active)
    const exemplars = this.exemplars.filter(e => e.numExists && !e.isPriloha)
    const texts = {
      name: [],
      subName: []
    }

    periodicals.forEach(p => {
      if(p.nazev !== "") texts.name.push(p.nazev)
      if(p.podnazev !== "") texts.subName.push(p.podnazev)
    })

    exemplars.forEach(e => {
      if(e.nazev !== "") texts.name.push(e.nazev)
      if(e.podnazev !== "") texts.subName.push(e.podnazev)
    })

    this.exemplarsAutocomplete.name = [...new Set([...texts.name])]
    this.exemplarsAutocomplete.subName = [...new Set([...texts.subName])]

  }

  setAutocompletes(){
    const attachments$ = this.service.getDistinctValuesOfMetaTitleForAttachments(this.state.currentVolume.id_titul)
    const periodicals$ = this.service.getMetaTitlePeriodicals(this.state.currentVolume.id_titul)

    attachments$.pipe(combineLatestWith(periodicals$), takeUntil(this.destroyed$)).subscribe(([attachments, periodicals]) => {

      // @ts-ignore
      const attachmentsName = attachments?.nazev.distinctValues.filter(a => a !== "")
      // @ts-ignore
      const attachmentsSubName = attachments?.podnazev.distinctValues.filter(a => a !== "")

      this.attachmentsAutocomplete.name = [...new Set([...attachmentsName])]
      this.attachmentsAutocomplete.subName = [...new Set([...attachmentsSubName])]

      const texts = {
        name: [],
        subName: []
      }

      periodicals.forEach(p => {
       p.periodicita.forEach(p => {
          if(p.active && p.nazev !== "") texts.name.push(p.nazev)
          if(p.active && p.podnazev !== "") texts.subName.push(p.podnazev)
        })
      })

      this.periodicalsAutocomplete.name = [...new Set([...texts.name])]
      this.periodicalsAutocomplete.subName = [...new Set([...texts.subName])]

    })
  }

  getExemplars(id: string, dateRange: string, setVolume: boolean, sortAttachments) {
    this.service.getExemplarsByCarKod(id, dateRange).subscribe(res2 => {
      if (res2.response.numFound > 0) {
        const ex: Exemplar = res2.response.docs[0] as Exemplar;
        const datum_od = res2.stats.stats_fields.datum_vydani_den.min;
        const datum_do = res2.stats.stats_fields.datum_vydani_den.max;
        if (setVolume) {

          this.state.currentVolume = new Volume(
            this.datePipe.transform(Utils.dateFromDay(datum_od), 'yyyy-MM-dd'),
            this.datePipe.transform(Utils.dateFromDay(datum_do), 'yyyy-MM-dd'));
          this.state.currentVolume.id = id;
          this.state.currentVolume.carovy_kod = id;
          this.state.currentVolume.mutace = ex.mutace;
          this.state.currentVolume.znak_oznaceni_vydani = ex.znak_oznaceni_vydani;
          this.state.currentVolume.id_titul = ex.id_titul;
          this.state.currentVolume.signatura = ex.signatura;
          this.state.currentVolume.vlastnik = ex.vlastnik;
        }
        // this.findTitul();
        this.loadExemplars(res2.response, sortAttachments);
        this.loading = false;
      } else {
        if (setVolume) {
          const d = new Date().getFullYear() + '-01-01';
          this.state.currentVolume = new Volume(d, d);
          this.state.currentVolume.carovy_kod = id;
          this.state.currentVolume.vlastnik = this.state.user.owner
          this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
        }
        this.loading = false;
      }
      this.isOwner = this.state.user?.owner && (this.state.user.owner === this.state.currentVolume.vlastnik)
      this.setExemplarsAutocomplete()
    });

    if (this.state.currentVolume) {
      this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
    }
  }

  loadExemplars(res, sortAttachments) {
    const dates = this.getDaysArray(this.state.currentVolume.datum_od, this.state.currentVolume.datum_do);
    this.numFound = res.numFound;
    this.exemplars = [];
    let idx = 0;
    let exemplar: Exemplar = res.docs[idx];
    let odd = true;
    let attachmentsAtTheEnd = []

    dates.forEach((dt) => {
      if (exemplar && this.datePipe.transform(exemplar.datum_vydani, 'yyyy-MM-dd') !== dt) {
        const ex = Object.assign({}, exemplar);
        ex.datum_vydani = dt;
        ex.datum_vydani_den = this.datePipe.transform(dt, 'yyyyMMdd');
        ex.cislo = null;
        ex.id = null;
        ex.id_issue = null;
        ex.numExists = false;
        ex.odd = odd;
        this.exemplars.push(ex);
      } else {
        while (exemplar && this.datePipe.transform(exemplar.datum_vydani, 'yyyy-MM-dd') === this.datePipe.transform(dt, 'yyyy-MM-dd')) {
          exemplar.numExists = exemplar.numExists !== null ? exemplar.numExists : true;
          exemplar.odd = odd;
          if (exemplar.stav) {
            exemplar.complete = exemplar.stav.includes('OK');
            // exemplar.chybiCislo = exemplar.stav.includes('ChCC');
            exemplar.destroyedPages = exemplar.stav.includes('PP');
            exemplar.degradated = exemplar.stav.includes('Deg');
            exemplar.missingPages = exemplar.stav.includes('ChS');
            exemplar.erroneousPaging = exemplar.stav.includes('ChPag');
            exemplar.erroneousDate = exemplar.stav.includes('ChDatum');
            exemplar.erroneousNumbering = exemplar.stav.includes('ChCis');
            exemplar.wronglyBound = exemplar.stav.includes('ChSv');
            exemplar.necitelneSvazano = exemplar.stav.includes('NS');
            exemplar.censored = exemplar.stav.includes('Cz');
          }
          if(sortAttachments && exemplar.isPriloha){
            attachmentsAtTheEnd.push(exemplar)
          }else{
            this.exemplars.push(exemplar)
          }
          idx++;
          exemplar = res.docs[idx];
        }
      }
      odd = !odd;
    });

    this.exemplars = [...this.exemplars, ...attachmentsAtTheEnd]

    this.dsExemplars = new MatTableDataSource(this.exemplars);
  }

  setVolumeFacets() {
    this.service.getVolumeFacets(this.state.currentVolume.id_titul).subscribe(res => {
      this.oznaceni_idx = -1;
      this.oznaceni = '';
      this.mutace_idx = -1;
      this.mutace = '';
      this.oznaceni_list = Object.assign([], res.facet_counts.facet_fields.znak_oznaceni_vydani);
      // this.mutations = Object.assign([], res.facet_counts.facet_fields.mutace);

      // for (let i = 0; i < this.mutations.length; i++) {
      //   if (this.mutations[i].name === this.state.currentVolume.mutace) {
      //     this.mutace_idx = i;
      //     this.mutace = this.mutations[i].name;
      //   }
      // }

      if (this.mutace_idx === -1) {
        // Udaj ve svazku neni mezi facety
        // Pridame
        // this.mutations.push({ name: this.state.currentVolume.mutace, type: 'int', value: 0 });
        // this.mutace_idx = this.mutations.length - 1;
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

  // langChanged() {
  //
  // }


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

  // pageChanged(e: PageEvent) {
  //   this.rows = e.pageSize;
  //   this.page = e.pageIndex;
  //
    // this.loadIssues();
  // }

  attachmentSelected(newValue: string, exemplar: Exemplar){
    exemplar.isPriloha = newValue === "6" || newValue === "7"
    this.setDataChanged()
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
      // console.log(this.state.currentTitul)
      this.setAutocompletes()
      this.setVolumeFacets();

      // for (let i = 0; i < this.config.owners.length; i++) {
      //   if (this.config.owners[i].name === this.state.currentVolume.vlastnik) {
      //     this.vlastnik_idx = i;
      //   }
      // }

    });
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
    if (!this.state.logged || !this.isOwner) {
      return;
    }
    // Ulozit svazek (volume) a vsechny radky tabulky jako Issue.
    // carovy_kod je povinny, jelikoz pouzivame jako id svazku
    const barCode = this.state.currentVolume.carovy_kod;
    const reg = new RegExp('^[0-9]*$');
    if (!barCode || barCode.trim() === '') {
      // this.setLastNumber();
      this.service.showSnackBar('snackbar.barcode_is_required', '', true);
      return;
    }

    //only informative popup
    if(!reg.test(barCode)){
      this.service.showSnackBar('snackbar.barcode_has_text');
    }

    if (!this.state.currentVolume.titul) {
      this.service.showSnackBar('snackbar.metatitul_is_required', '', true);
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

    if (!this.state.currentVolume.vlastnik || this.state.currentVolume.vlastnik.trim() === '') {
      this.service.showSnackBar('snackbar.vlastnik_is_required', '', true);
      return;
    }

    this.setLastNumber();

    this.state.currentVolume.id = this.state.currentVolume.carovy_kod;

    // console.log(this.dsIssues.data);
    this.loading = true;

    this.exemplars.forEach(e => (
      Object.keys(e).forEach(k => e[k] = typeof e[k] == 'string' ? e[k].trim() : e[k])
    ))

    this.service.saveExemplars(this.state.currentVolume, this.exemplars).subscribe(res => {
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('snackbar.error_saving_volume', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.the_volume_was_saved_correctly')
        this.dataChanged = false
        setTimeout(() => {
          this.read()
        }, 500);
      }
    });

  }

  deleteClick(){
    if (!this.state.logged || !this.isOwner) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.delete_volume.caption',
        text: 'modal.delete_volume.text',
        param: {
          value: ''
        },
        customConfirmButton: 'modal.delete_volume.decline',
        customDeclineButton: 'modal.delete_volume.accept'
      }
    });
    dialogRef.afterClosed().subscribe(result => {

      if (!result && result !== undefined) {

        const dialogRef2 = this.dialog.open(ConfirmDialogComponent, {
          width: '650px',
          data: {
            caption: 'modal.delete_volume.caption2',
            text: 'modal.delete_volume.text2',
            param: {
              value: ''
            },
            customConfirmButton: 'modal.delete_volume.accept',
            customDeclineButton: 'modal.delete_volume.decline'
          }
        });
        dialogRef2.afterClosed().subscribe(result2 => {
          if (!result2 && result2 !== undefined) {
            this.delete();
          }
        });
      }
    });

  }

  delete(){

    if (!this.state.currentVolume.carovy_kod || this.state.currentVolume.carovy_kod.trim() === '') {
      this.service.showSnackBar('snackbar.barcode_is_required', '', true);
      return;
    }

    // if (!this.state.currentVolume.datum_od) {
    //   this.service.showSnackBar('snackbar.datum_od_is_required', '', true);
    //   return;
    // }
    //
    // if (!this.state.currentVolume.datum_do) {
    //   this.service.showSnackBar('snackbar.datum_do_is_required', '', true);
    //   return;
    // }

    const request = {
      id_svazek: this.state.currentVolume.carovy_kod,
      exemplars: this.exemplars.filter(e => !!e?.id).map((exemplar) => {
          return exemplar.id;
        })
    };

    this.loading = true;

    this.service.deleteSvazekAndExemplars(request).subscribe(res => {
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('snackbar.error_deleting_volume', res.error, true);
      } else {
        this.service.showSnackBar('snackbar.delete_success');
        setTimeout(() => {
          return this.router.navigate(['/result', this.state.currentVolume.id_titul]);
        }, 500);
      }
    });


  }

  duplicateClick(){
    if (!this.state.logged || !this.isOwner) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.duplicate_volume.caption',
        text: 'modal.duplicate_volume.text',
        param: {
          value: ''
        }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.duplicateExemplars();
      }
    });
  }

  generateClick() {

    if (!this.state.logged || !this.isOwner) {
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


  updateExemplars(value: string, type: BaseInfo){
    const clonedExemplars = Object.assign([], this.exemplars)
    let newExemplars

    switch (type){
      case "id_titul":
        this.setTitul()
        this.setAutocompletes()
        const newTitul = this.state.currentVolume.titul
        newExemplars = clonedExemplars.map(e => {
          e.meta_nazev = newTitul.meta_nazev
          e.id_titul = newTitul.id
          return e
        })
        break
      case "vlastnik":
        // this.changeVlastnik()
        // newExemplars = clonedExemplars.map(e => {
        //   e[type] = this.state.owners[value].name
        //   return e
        // })
        break
      default:
        newExemplars = clonedExemplars.map(e => {
          e[type] = value
          return e
        })
    }

    if(type === "carovy_kod") {
      this.location.replaceState(`/svazek/${value}`)
      this.newVolumeID = value
    }

    // console.log(newExemplars[0])
    this.setDataChanged()
    if(this.exemplars.length > 0) this.service.showSnackBar('snackbar.data_changed', '', true, "", 3000)
    this.dsExemplars = new MatTableDataSource(newExemplars)
    // console.log(value, type)
  }

  duplicateExemplars(){
    // this.vlastnik_idx = -1
    this.state.currentVolume.vlastnik = this.state.user.owner
    this.state.currentVolume.id = ""
    this.state.currentVolume.carovy_kod =""
    this.state.currentVolume.signatura = ""
    this.state.currentVolume.znak_oznaceni_vydani = ""
    this.location.replaceState("/svazek")
    this.isOwner = true

    const currentVolume = this.state.currentVolume
    const clonedExemplars = Object.assign([], this.exemplars)

    clonedExemplars.map(e => {
      e.id = ""
      e.id_issue = ""
      e.znak_oznaceni_vydani = currentVolume.znak_oznaceni_vydani;
      e.carovy_kod = currentVolume.carovy_kod;
      e.oznaceni = currentVolume.znak_oznaceni_vydani;
      e.signatura = currentVolume.signatura;
      e.vlastnik = currentVolume.vlastnik;
      return e
    })

    this.exemplars = clonedExemplars
    this.dsExemplars = new MatTableDataSource(this.exemplars)
  }


  generate() {
      const currentVolume = this.state.currentVolume
      if (!currentVolume.titul) {
        this.service.showSnackBar('snackbar.metatitul_is_required', '', true)
        return
      }

      if (!currentVolume.carovy_kod || currentVolume.carovy_kod.trim() === '') {
        this.service.showSnackBar('snackbar.barcode_is_required', '', true);
        return
      }

      if (!currentVolume.vlastnik || currentVolume.vlastnik.trim() === '') {
        this.service.showSnackBar('snackbar.vlastnik_is_required', '', true)
        return
      }

    // console.log(currentVolume)
    const dates = this.getDaysArray(currentVolume.datum_od, currentVolume.datum_do);
    this.exemplars = [];
    let idx = currentVolume.prvni_cislo;
    let attachmentNumber = 1
    let periodicAttachmentNumber = 1
    let attachmentsAtTheEnd = []

    let odd = true;
    dates.forEach((dt) => {

      const dayStr = this.datePipe.transform(dt, 'EEEE');
      let inserted = false;
      currentVolume.periodicita.forEach(p => {
        if (p.active) {
          if (p.den === dayStr) {
            const generateAttachment = p.vydani === "6" || p.vydani === "7"
            const ex = new Exemplar();
            ex.datum_vydani = dt;
            ex.datum_vydani_den = this.datePipe.transform(dt, 'yyyyMMdd');
            ex.id_titul = currentVolume.id_titul;
            ex.meta_nazev = currentVolume.titul.meta_nazev;
            ex.znak_oznaceni_vydani = currentVolume.znak_oznaceni_vydani;
            ex.carovy_kod = currentVolume.carovy_kod;
            ex.oznaceni = currentVolume.znak_oznaceni_vydani;
            ex.signatura = currentVolume.signatura;
            ex.vlastnik = currentVolume.vlastnik;
            ex.mutace = currentVolume.mutace;
            ex.numExists = true;
            ex.vydaniExists = true;
            ex.pocet_stran = p.pocet_stran;
            ex.nazev = p.nazev;
            ex.podnazev = p.podnazev;
            ex.vydani = p.vydani;
            ex.isPriloha = generateAttachment
            ex.cislo = p.vydani === "6" ? attachmentNumber :  p.vydani === "7" ? periodicAttachmentNumber : idx
            ex.odd = odd;
            generateAttachment ? p.vydani === "6" ? attachmentNumber++ : periodicAttachmentNumber++ : idx++
            inserted = true;

            if(generateAttachment && currentVolume.show_attachments_at_the_end){
              attachmentsAtTheEnd.push(ex)
            }else{
              this.exemplars.push(ex)
            }

          }
        }

      });

      if (!inserted) {
        const exemplar = new Exemplar();
        exemplar.datum_vydani = dt;
        exemplar.datum_vydani_den = this.datePipe.transform(dt, 'yyyyMMdd');
        exemplar.id_titul = currentVolume.id_titul;
        exemplar.meta_nazev = currentVolume.titul.meta_nazev;
        exemplar.znak_oznaceni_vydani = currentVolume.znak_oznaceni_vydani;
        exemplar.carovy_kod = currentVolume.carovy_kod;
        exemplar.oznaceni = currentVolume.znak_oznaceni_vydani;
        exemplar.signatura = currentVolume.signatura;
        exemplar.vlastnik = currentVolume.vlastnik;

        exemplar.mutace = currentVolume.mutace;
        exemplar.numExists = false;
        exemplar.vydaniExists = false;
        exemplar.odd = odd;
        this.exemplars.push(exemplar);
      }

      odd = !odd;
    });

    this.exemplars = [...this.exemplars, ...attachmentsAtTheEnd]
    // console.log(this.exemplars)

    this.dsExemplars = new MatTableDataSource(this.exemplars);
    this.setExemplarsAutocomplete()
    this.setDataChanged()
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

  // changeMutace() {
  //   this.state.currentVolume.mutace = this.config.mutations[this.mutace_idx];
  // }

  // changeOznaceni() {
  //   this.state.currentVolume.znak_oznaceni_vydani = this.config.znak_oznaceni_vydani[this.oznaceni_idx];
  //
  // }

  // changeVlastnik() {
  //   if (this.vlastnik_idx < 0) {
  //     this.state.currentVolume.vlastnik = '';
  //   }else{
  //     this.state.currentVolume.vlastnik = this.state.owners[this.vlastnik_idx].name;
  //   }
  // }

  addVydani(element, idx: number) {
    const n = Object.assign([], this.state.currentVolume.periodicita);
    n.splice(idx + 1, 0, Object.assign({}, element));
    this.state.currentVolume.periodicita = Object.assign([], n);
    this.setDataChanged()
    // this.dsPeriodicita = new MatTableDataSource(this.state.currentVolume.periodicita);
  }

  checkElementExists(cs: Exemplar) {
    this.setDataChanged()
  }

  reNumber(element: Exemplar, idx: number, down: boolean) {
    // console.log(idx);
    const min = down ? idx : 0;
    const max = down ? this.dsExemplars.data.length : idx;
    let curCislo = this.dsExemplars.data[min].cislo;
    let willBeRenumbered = 0;
    let firstNumber = -1;
    console.log(min, max, curCislo, idx, down)
    // const maxCislo = this.dsIssues.data[min].cislo;

    for (let i = min; i < max; i++) {
      const ex: Exemplar = this.dsExemplars.data[i];
      if ((ex.numExists || ex.missing_number) && !ex.isPriloha) {
        willBeRenumbered++;
      }
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '650px',
      data: {
        caption: 'modal.renumber.caption',
        text: 'modal.renumber.text',
        param: {
          value: willBeRenumbered
        }
      }
    });
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if (result) {
        for (let i = min; i < max; i++) {
          const ex: Exemplar = this.dsExemplars.data[i];
          if ((ex.numExists || ex.missing_number) && !ex.isPriloha) {
            if (firstNumber < 0) {
              firstNumber = curCislo;
            }
            ex.cislo = curCislo;
            curCislo++;
            console.log(i)
          }
        }
        const additionalInfo = this.state.currentLang === 'cs' ? ` čísel: ${willBeRenumbered} (v rozsahu od ${firstNumber} po ${curCislo - 1})` : ` numbers: ${willBeRenumbered} (in range from ${firstNumber} to ${curCislo - 1})`;
        this.service.showSnackBar('snackbar.renumbered_correctly', '', false, additionalInfo, 3000, true);
        this.setDataChanged()
      }
    });

  }

  addExemplar(element: Exemplar, idx: number) {
    const newEl = Object.assign({}, element);
    newEl.vydani = '';
    newEl.id_issue = null;
    newEl.id = null;
    newEl.complete = false;
    // newEl.chybiCislo = false;
    newEl.destroyedPages = false;
    newEl.degradated = false;
    newEl.missingPages = false;
    newEl.erroneousPaging = false;
    newEl.erroneousDate = false;
    newEl.erroneousNumbering = false;
    newEl.wronglyBound = false;
    newEl.necitelneSvazano = false;
    newEl.censored = false;
    newEl.pages = { missing: [], damaged: [] };
    newEl.stav = [];
    newEl.stav_popis = '';
    newEl.numExists = true;
    newEl.poznamka = '';

    this.exemplars.splice(idx + 1, 0, newEl);
    this.dsExemplars = new MatTableDataSource(this.exemplars);
    this.setDataChanged()
  }

  rowColor(row): string {
    if (row.isPriloha) {
      return '#fce4ec'; // #cce
    }
    return row.odd ? '#fff' : '#f5f5f5';
  }

  viewPozn(el: Exemplar, template: TemplateRef<any>, relative: any) {
    this.closeInfoOverlay();
    this.csEditing = el;
    this.poznText = el.poznamka;
    setTimeout(() => {
      this.openInfoOverlay(relative._elementRef, template, 35);
    }, 50);
  }


  viewPS(el: Exemplar, prop: string, relative: any, template: TemplateRef<any>) {

    // Back compatibility.
    // From pages : string[] to pages: {missing: string[], damaged: string[]}
    // Assign to missing
    if (el.pages && Array.isArray(el.pages)) {
      // const pages = Object.assign([], el.pages);
      el.pages = { missing: Object.assign([], el.pages), damaged: [] };
    }

    this.csEditing = el;

    const openPop = (el.stav_popis && el.stav_popis !== '') || prop === 'missingPages' || prop === 'destroyedPages';
    if (openPop) {
      this.closeInfoOverlay();
      this.editingProp = prop === 'missingPages' ? 'missing' : 'damaged';
      setTimeout(() => {
        if (el[prop]) {
          this.popText = el.stav_popis;
          this.popShowPages = prop === 'missingPages' || prop === 'destroyedPages';
          if (this.popShowPages) {
            this.pagesRange = [];
            for (let i = 0; i < el.pocet_stran; i++) {
              const sel = el.pages && el.pages[this.editingProp] && el.pages[this.editingProp].includes((i + 1) + '');
              this.pagesRange.push({ label: (i + 1) + '', sel });
            }
          }
          this.openInfoOverlay(relative._elementRef, template);
        }
      }, 50);
    }
  }

  viewIssue(issue: Issue) {
    this.state.currentTitul = new Titul();
    this.state.currentTitul.id = issue.id_titul;
    this.state.currentTitul.meta_nazev = issue.nazev;
    this.router.navigate(['/issue', issue.id]);
  }

  updatePages() {

    this.csEditing.pages[this.editingProp] = [];
    this.pagesRange.forEach(p => {
      if (p.sel) {
        this.csEditing.pages[this.editingProp].push(p.label);
      }
    });
    this.csEditing.stav_popis = this.popText;

    this.service.saveExemplar(this.csEditing).subscribe(res => {
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('snackbar.error_saving_volume', res.error, true);
      } else {
        this.dataChanged = false
        this.service.showSnackBar('snackbar.the_volume_was_saved_correctly');
      }
      this.closePop();
    });

  }

  updateStav(ex: Exemplar, specificUpdate: ExemplarStates = "", flip = false) {
    ex.stav = [];

    if(ex.numExists){
      switch (specificUpdate){
        case "complete":
          ex.complete = true
          break
        case "degradated":
          ex.degradated = flip ? !ex.degradated : true
          break
        case "necitelneSvazano":
          ex.necitelneSvazano = flip ? !ex.necitelneSvazano : true
          break
        default:

      }
    }

    if (ex.complete) { ex.stav.push('OK'); }
    // if (ex.chybiCislo) { ex.stav.push('ChCC'); }
    if (ex.destroyedPages) { ex.stav.push('PP'); }
    if (ex.degradated) { ex.stav.push('Deg'); }
    if (ex.missingPages) { ex.stav.push('ChS'); }
    if (ex.erroneousPaging) { ex.stav.push('ChPag'); }
    if (ex.erroneousDate) { ex.stav.push('ChDatum'); }
    if (ex.erroneousNumbering) { ex.stav.push('ChCis'); }
    if (ex.wronglyBound) { ex.stav.push('ChSv'); }
    if (ex.necitelneSvazano) { ex.stav.push('NS'); }
    if (ex.censored) { ex.stav.push('Cz'); }
    this.setDataChanged()
  }

  updatePoznamka() {
    this.csEditing.poznamka = this.poznText;
    // this.csEditing.poznamka = this.poznText;
    this.setDataChanged()
    this.closePop();
  }

  setAllInColumn(type: ExemplarStates, autoSave = false, flip = false){
    if(!this.state.logged || !this.isOwner) return

    const statesAlreadySelected = this.exemplars.filter(e => e[type] && e.numExists).length
    if(statesAlreadySelected === this.exemplars.filter(e => e.numExists).length && type !== "complete"){
      this.exemplars.map(exemplar => {
        this.updateStav(exemplar, type, flip);
        })
      this.service.showSnackBar(statesAlreadySelected > 0 ? 'snackbar.unselected_all' : "snackbar.selected_all");
    } else{
      this.exemplars.map(exemplar => {
        this.updateStav(exemplar, type, false);
      })
      if(type !== "complete") this.service.showSnackBar("snackbar.selected_all");
    }

    this.setDataChanged()

    if(autoSave){
      this.save()
    }
  }

  ngOnDestroy() {
    this.closeInfoOverlay();
    this.destroyed$.next(true);
    this.destroyed$.complete();
    // this.subscriptions.forEach(s => s.unsubscribe());
  }

  closePop() {
    this.closeInfoOverlay();
  }

  openInfoOverlay(relative: any, template: TemplateRef<any>, xOffset: number = 6) {
    // this.closeInfoOverlay();

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
      this.setDataChanged()
      this.state.currentVolume[element] = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      if (element === 'datum_od') {
        this.state.currentVolume.datum_do = this.datePipe.transform(moment(event.value).endOf('month').toDate(), 'yyyy-MM-dd');
      }
    }
    // } else if (this.state.currentVolume[element]) {
    //   // const d: Date = Utils.dateFromDay(e.value);
    //   // this.pickerOd.select(d);
    // }

  }

  setDataChanged(){
    this.dataChanged = true
  }

  dateChanged(element, e) {
    console.log(element, e.target.value);
  }

  showSvazekOverview() {
    const dialogRef = this.dialog.open(SvazekOverviewComponent, {
      width: '650px',
      data: {
        carKod: this.state.currentVolume.carovy_kod,
        idTitul: this.state.currentVolume.id_titul
      }
    });
  }

  fillNazev(element) {
    // console.log(this.state.currentVolume.periodicita)
    // console.log(element);
    if (!element.nazev || element.nazev === '') {
      this.setDataChanged()
      element.nazev = this.state.currentVolume.titul.meta_nazev;
    }
  }


  log(element) {
    console.log(element);
  }

}


