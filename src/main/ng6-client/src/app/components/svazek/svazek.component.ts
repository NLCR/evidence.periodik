import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { MzModalService } from 'ngx-materialize';
import { AddTitulDialogComponent } from 'src/app/components/add-titul-dialog/add-titul-dialog.component';
import { AppService } from 'src/app/app.service';
import { Titul } from 'src/app/models/titul';
import { Volume } from 'src/app/models/volume';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
  mutace_idx: number;
  oznaceni_idx: number;
  vlastnik_idx: number;

  mutations: { name: string, type: string, value: number }[];
  oznaceni_list: { name: string, type: string, value: number }[];

  constructor(
    private modalService: MzModalService,
    private route: ActivatedRoute,
    private router: Router,
    public state: AppState,
    private service: AppService) { }

  ngOnInit() {

    this.state.currentTitul = new Titul();
    this.state.currentVolume = new Volume();
    const id = this.route.snapshot.paramMap.get('id');
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

        this.setVolumeFacets();

        for (let i = 0; i < this.state.config.owners.length; i++) {
          if (this.state.config.owners[i].name === this.state.currentVolume.vlastnik) {
            this.vlastnik_idx = i;
          }
        }

      });
    } else {
      this.state.currentVolume = new Volume();
    }
  }

  setVolumeFacets() {
    this.service.getVolumeFacets(this.state.currentVolume.id_titul).subscribe(res => {
      console.log(res['facet_counts']['facet_fields']);
      this.oznaceni_idx = -1;
      this.mutace_idx = -1;
      this.oznaceni_list = Object.assign([], res['facet_counts']['facet_fields']['znak_oznaceni_vydani']);
      this.mutations = Object.assign([], res['facet_counts']['facet_fields']['mutace']);
      
      for (let i = 0; i < this.mutations.length; i++) {
        if (this.mutations[i].name === this.state.currentVolume.mutace) {
          this.mutace_idx = i;
        }
      }

      if (this.mutace_idx === -1) {
        // Udaj ve svazku neni mezi facety
        // Pridame
        this.mutations.push({name: this.state.currentVolume.mutace, type: 'int', value: 0});
        this.mutace_idx = this.mutations.length - 1;
      }


      for (let i = 0; i < this.oznaceni_list.length; i++) {
        if (this.oznaceni_list[i].name === this.state.currentVolume.znak_oznaceni_vydani) {
          this.oznaceni_idx = i;
        }
      }
      if (this.oznaceni_idx === -1) {
        // Udaj ve svazku neni mezi facety
        // Pridame
        this.oznaceni_list.push({name: this.state.currentVolume.znak_oznaceni_vydani, type: 'int', value: 0});
        this.oznaceni_idx = this.oznaceni_list.length - 1;
      }


    });
  }

  langChanged() {

  }

  read() {

  }

  save() {
    console.log(this.state.currentVolume);
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

const ELEMENT_DATA_RIGHT_TABLE: dataRightTable[] = [
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1970', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  },
  {
    date: 'út 5.1. 1960', numExist: '', addNextEdition: '', editionNumber: 2, mutation: 'Praha', edition: 'poledni', thisIsAttachement: '', attachementName: 'Detem', pageNumber: 1, mutationEdition: '',
    destroyedPages: '', degradated: '', missingPages: '', erroneousPaging: '', erroneousDate: '', erroneousNumbering: '', wronglyBound: '', censored: ''
  }
];

export interface dataLeftTableTop {
  attribute: string;
  value: string;
}

const ELEMENT_DATA_LEFT_TABLE_TOP: string[] = [
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

const ELEMENT_DATA_LEFT_TABLE_BOTTOM: dataLeftTableBottom[] = [
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' },
  { goOut: 'Pondeli', numExist2: '', edition2: '', pageNumber2: 2, thisIsAttachement2: '', attachementName2: 'Detem', button: '' }
];
