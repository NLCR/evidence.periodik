import {Injectable} from '@angular/core';
import {Router, ActivatedRoute, Params, NavigationStart, NavigationEnd, NavigationExtras} from '@angular/router';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';

import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';

import {CloneParams} from './models/clone-params';
import {AppState} from './app.state';
import {Filter} from './models/filter';

@Injectable()
export class AppService {

  //Observe language
  public _langSubject = new Subject();
  public langSubject: Observable<any> = this._langSubject.asObservable();

  constructor(
    private state: AppState,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private datePipe: DatePipe) {}

  changeLang(lang: string) {
    //console.log('lang changed to ' + lang);
    this.state.currentLang = lang;
    this.translate.use(lang);
    this._langSubject.next(lang);
  }

  getSpecialDays() {

    var url = this.state.config['context'] + 'search/calendar/select';
    let params: HttpParams = new HttpParams();
    if (this.state.config['test']) {
      url = this.state.config['context'] + 'assets/special.json';
    } else {
      params = params.set('q', '*');
      params = params.set('rows', '100');
    }
    this.http.get(url, {params: params}).map((res) => {
      this.state.specialDays = res;
    }).subscribe();
  }

  getSpecialDaysOfMonth(d: Date) {
    var url = this.state.config['context'] + 'search/calendar/select';
    let params: HttpParams = new HttpParams();
    let test = this.state.config['test'];
    test = false;
    if (test) {
      url = this.state.config['context'] + 'assets/special.json';
    } else {
      let month = this.datePipe.transform(d, 'M');
      let year = this.datePipe.transform(d, 'yyyy');
      let q = '(month:' + month + ' AND year:' + year + ') OR (month:' + month + ' AND year:0)';
      params = params.set('q', q);
      params = params.set('rows', '50');
    }
    return this.http.get(url, {params: params}).map((res) => {
      return res['response']['docs'];
    });
  }

  isSpecial(d: Date) {
    var url = this.state.config['context'] + 'search/calendar/select';
    let params: HttpParams = new HttpParams();
    let test = this.state.config['test'];
    if (test) {
      url = this.state.config['context'] + 'assets/special.json';
    } else {
      let day = this.datePipe.transform(d, 'd');
      let month = this.datePipe.transform(d, 'M');
      let year = this.datePipe.transform(d, 'yyyy');
      let q = '(day:' + day + ' AND month:' + month + ' AND year:' + year + ') OR (day:' + day + ' AND month:' + month + ' AND year:0)';
      params = params.set('q', q);
      params = params.set('rows', '1');
    }
    return this.http.get(url, {params: params}).map((res) => {
      return res['response']['docs'];
    });
  }

  getIssuesOfTitul(uuid: string, month: string) {
    let params: HttpParams = new HttpParams();
    var url = '';
    let test = this.state.config['test'];
    if (test) {
      url = this.state.config['context'] + 'assets/issues.json';
    } else {
      params = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('rows', '500')
      .set('fl', '*,exemplare:[json]')
      .set('fq', 'id_titul:"' + uuid + '"')
      .append('fq', 'datum_vydani:[' + month + ' TO ' + month + ']');
      url = this.state.config['context'] + 'search/issue/select';
    }
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params}).map((res) => {
      return res['response']['docs'];
    });
  }

  getTitul(id: string) {
    var url = this.state.config['context'] + 'search/titul/select';
    let params: HttpParams = new HttpParams();
    let test = this.state.config['test'];
    if (test) {
      url = this.state.config['context'] + 'assets/titul.json';
    } else {
      params = params.set('q', '*');
      params = params.set('fq', 'id:"' + id + '"');
      //params.set('fl', 'start:datum_vydani,title:nazev,*')
    }
    return this.http.get(url, {params: params}).map((res) => {
      return res['response']['docs'];
    });
  }
  
  saveIssue(){
    var url = this.state.config['context'] + 'index';
    let params: HttpParams = new HttpParams()
    .set('action', 'SAVE_ISSUE')
      .set('json', JSON.stringify(this.state.currentIssue));
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params});
  }

  getIssue(id: string) {
    var url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams()
    .set('q', '*')
    .set('wt', 'json')
    .set('fl', '*,exemplare:[json]')
    .set('fq', 'id:"' + id + '"');
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params}).map((res) => {
      return res['response']['docs'];
    });
  }
  
  getIssueTotals(id: string, datum: string) {
    var url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams()
    .set('q', '*')
    .set('wt', 'json')
//    .set('fq', 'datum_vydani:"' + datum + '"')
    .append('fq', 'id_titul:"' + id + '"')
    .set('stats','true')
    .set('stats.field','{!key=mutace countDistinct=true count=true}mutace')
    .append('stats.field','{!key=den countDistinct=true count=true max=true min=true}datum_vydani_den')
    .append('stats.field','vlastnik')
    .append('stats.field','exemplare')
    return this.http.get(url, {params: params});
  }

  search() {
    var url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams()
    .set('q', '*')
    .set('wt', 'json')
    .set('fq', '{!collapse field=id_titul}')
    .set('facet', 'true')
    .set('json.nl', 'arrntv')
    .set('facet.field', 'nazev')
    .append('facet.field', 'mutace')
    .append('facet.field', 'vlastnik');
    
    this.state.filters.forEach((f: Filter) => {
//    for (let f in this.state.filters){
      params = params.append('fq', f.field + ':"' + f.value + '"');
    });
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params});
  }

  searchTituly() {
    var url = this.state.config['context'] + 'search/titul/select';
    let params: HttpParams = new HttpParams()
    .set('q', '*')
    .set('wt', 'json');
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params});
  }

  clone(cfg: CloneParams) {
    var url = this.state.config['context'] + 'index';
    let params: HttpParams = new HttpParams()
    .set('action', 'CLONE')
    .set('cfg', JSON.stringify(cfg));
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params});
  }

}
