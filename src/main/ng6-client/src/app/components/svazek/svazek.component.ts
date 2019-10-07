import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
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

const ELEMENT_DATA_LEFT_TABLE_TOP: dataLeftTableTop [] = [
  {attribute: 'Metatitul', value: ''},
  {attribute: 'Mutace', value: ''},
  {attribute: 'Označení mutačního vydání', value: ''},
  {attribute: 'Čárový kód', value: '2650576403'},
  {attribute: 'Signatura', value: 'III 93.410'},
  {attribute: 'Datum vydání prvního čísla svazku', value: '5.1.1960'},
  {attribute: 'První číslo ve svazku', value: '4'},
  {attribute: 'Datum vydání posledního čísla svazku', value: '30.6.1960'},
  {attribute: 'Poslední číslo ve svazku (orientační)', value: '159'},
  {attribute: 'Vlastník svazku', value: 'VKOL'},
  {attribute: 'Textová poznámka ke svazku', value: 'např. "svazek ohořelý"'}
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
