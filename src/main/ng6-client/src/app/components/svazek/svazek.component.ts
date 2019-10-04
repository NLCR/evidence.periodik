import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-svazek',
  templateUrl: './svazek.component.html',
  styleUrls: ['./svazek.component.scss']
})
export class SvazekComponent implements OnInit {
  displayedColumns = [
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
  dataSource = ELEMENT_DATA;
  selected = 'option2';

  constructor() { }

  ngOnInit() {
  }

}

export interface PeriodicElement {
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

const ELEMENT_DATA: PeriodicElement[] = [
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


/* 
toto je příloha	
název přílohy	
počet stran	
mutační vydání	
poškozené strany	
degradované	
chybí strany	
chybná paginace	
chybné datum	
chybné číslování	
chybně svázáno	
cenzurováno */
