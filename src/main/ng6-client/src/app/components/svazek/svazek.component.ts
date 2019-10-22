import { Component, OnInit } from '@angular/core';
import {AppState} from 'src/app/app.state';
import {MzModalService} from 'ngx-materialize';
import {AddTitulDialogComponent} from 'src/app/components/add-titul-dialog/add-titul-dialog.component';
import {AppService} from 'src/app/app.service';
import {Titul} from 'src/app/models/titul';
import {Volume} from 'src/app/models/volume';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-svazek',
  templateUrl: './svazek.component.html',
  styleUrls: ['./svazek.component.scss']
})
export class SvazekComponent implements OnInit {
  displayedColumnsRightTable = [
    'date', 
    'numExist', 
    'addNextEdition', 
    'editionNumber', 
    'mutation', 
    'edition',
    'thisIsAttachement',
    'attachementName',
    'pageNumber',
    'mutationEdition',
    'destroyedPages',
    'degradated',
    'missingPages',
    'erroneousPaging',
    'erroneousDate',
    'erroneousNumbering',
    'wronglyBound',
    'censored'
  ];

  displayedColumnsLeftTableTop = [
    'attribute', 
    'value'
  ];

  displayedColumnsLeftTableBottom = [
    'goOut', 
    'numExist2',
    'edition2',
    'pageNumber2',
    'thisIsAttachement2',
    'attachementName2',
    'button'
  ];

  dataSourceRightTable = ELEMENT_DATA_RIGHT_TABLE;
  dataSourceLeftTableTop = ELEMENT_DATA_LEFT_TABLE_TOP;
  dataSourceLeftTableBottom = ELEMENT_DATA_LEFT_TABLE_BOTTOM;
  selected = 'option2';
  
  
  subscriptions: Subscription[] = [];
  titul_idx: number;

  constructor(
    private modalService: MzModalService,
    private route: ActivatedRoute,
    private router: Router,
    public state: AppState,
    private service: AppService) { }

  ngOnInit() {
    
    this.state.currentTitul = new Titul();
    this.state.currentVolume = new Volume();
    let id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.state.isNewIssue = false;
      if (this.state.config) {
        this.service.getVolume(id).subscribe(res => {
          this.setData(res);
        });
      } else {
        this.subscriptions.push(this.state.configSubject.subscribe((state) => {
          this.service.getVolume(id).subscribe(res => {
            this.setData(res);
          });
        }));
      }
    } else {

      this.state.isNewIssue = true;
    }


    this.subscriptions.push(this.service.langSubject.subscribe((lang) => {
      this.langChanged();
    }));
  }
  
  setData(res: Volume[]) {
    if (res.length > 0) {
      this.state.currentVolume = res[0];
      this.service.getTitul(this.state.currentVolume.id_titul).subscribe(res2 => {
        this.state.currentVolume.titul = res2;
        this.state.currentTitul = res2;
        for (let i = 0; i < this.state.tituly.length; i++) {
          if (this.state.tituly[i].id === this.state.currentVolume.titul.id) {
            this.titul_idx = i;
          }
        }
      });
    } else {
      this.state.currentVolume = new Volume();
    }
  }
  
  langChanged() {
    
  }
  
  readVolume() {
    
  }
  
  saveVolume() {
    
  }
  
  generateVolume() {
    
  }
  
  setTitul() {
    if (this.titul_idx.toString() === '-1') {
      //New titul dialog
      this.modalService.open(AddTitulDialogComponent,
        {"state": this.state, "service": this.service}
      );
    } else {
      this.state.currentIssue.titul = this.state.tituly[this.titul_idx];
      this.state.currentIssue.id_titul = this.state.currentIssue.titul.id;
      this.state.currentIssue.meta_nazev = this.state.currentIssue.titul.meta_nazev;
      this.state.currentTitul = this.state.currentIssue.titul;

      this.state.currentIssue.periodicita = this.state.currentIssue.titul.periodicita;

      this.state.currentIssue.pocet_stran = this.state.currentIssue.titul.pocet_stran;
    }
  }

}

export interface dataRightTable {
  date: string;
  numExist: string;
  addNextEdition: string;
  editionNumber: number;
  mutation: string;
  edition: string;
  thisIsAttachement: string;
  attachementName: string;
  pageNumber: number;
  mutationEdition: string;
  destroyedPages: string;
  degradated: string;
  missingPages: string;
  erroneousPaging: string;
  erroneousDate: string;
  erroneousNumbering: string;
  wronglyBound: string;
  censored: string;
}

const ELEMENT_DATA_RIGHT_TABLE: dataRightTable [] = [
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1970', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''},
  {date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '', 
  destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''}
];

export interface dataLeftTableTop {
  attribute: string;
  value: string;
}

const ELEMENT_DATA_LEFT_TABLE_TOP: string [] = [
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

export interface dataLeftTableBottom {
  goOut: string; 
  numExist2: string;
  edition2: string;
  pageNumber2: number;
  thisIsAttachement2: string;
  attachementName2: string;
  button: string;
}

const ELEMENT_DATA_LEFT_TABLE_BOTTOM: dataLeftTableBottom [] = [
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''},
  {goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: ''}
];
