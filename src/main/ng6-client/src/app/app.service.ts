import {Injectable} from '@angular/core';
import {Router, ActivatedRoute, Params, NavigationStart, NavigationEnd, NavigationExtras} from '@angular/router';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

import {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import {tap, map} from 'rxjs/operators';

import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';

import {CloneParams} from './models/clone-params';
import {AppState} from './app.state';
import {Filter} from './models/filter';
import {Titul} from './models/titul';
import {Issue} from './models/issue';
import {Exemplar} from './models/exemplar';

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
    this.http.get(url, {params: params}).subscribe((res) => {
      this.state.specialDays = res;
    });
  }

  getSpecialDaysOfMonth(d: Date): Observable<any[]> {
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
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  isSpecial(d: Date): Observable<any[]> {
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
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  getIssuesOfTitul(uuid: string, month: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    var url = '';
    let test = this.state.config['test'];
    if (test) {
      url = this.state.config['context'] + 'assets/issues.json';
    } else {
      params = new HttpParams()
        .set('q', '*')
        .set('wt', 'json')
        .set('rows', '200')
        .set('fl', '*,exemplare:[json]')
        .set('fq', 'id_titul:"' + uuid + '"')
        .append('fq', 'datum_vydani:[' + month + ' TO ' + month + ']');
      url = this.state.config['context'] + 'search/issue/select';
    }
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  getTitul(id: string): Observable<Titul> {
    var url = this.state.config['context'] + 'search/titul/select';
    let params: HttpParams = new HttpParams();
    params = params.set('q', '*')
      .set('fq', 'id:"' + id + '"');
    return this.http.get<Titul>(url, {params: params}).pipe(
      map((res) => {
        let t = new Titul();
        t.id = id;
        if (res['response']['numFound'] > 0) {
          t.meta_nazev = res['response']['docs'][0]['meta_nazev'];
        }
        return t;
      }));
  }


  getTitul_(id: string): Observable<Titul> {
    var url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams();
    let test = this.state.config['test'];
    if (test) {
      url = this.state.config['context'] + 'assets/titul.json';
    } else {
      params = params.set('q', '*').set('rows', '1').set('fq', 'id_titul:"' + id + '"');
      //params.set('fl', 'start:datum_vydani,title:nazev,*')
    }
    return this.http.get<Titul>(url, {params: params}).pipe(
      tap((res) => {
        let t = new Titul();
        t.id = id;
        if (res['response']['numFound'] > 0) {
          t.meta_nazev = res['response']['docs'][0]['nazev'];
        }
        return t;

      }));
  }


  getTituly(): Observable<any> {
    var url = this.state.config['context'] + 'search/titul/select';
    let params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('sort', 'meta_nazev asc')
      .set('rows', '500');

    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        this.state.tituly = res['response']['docs'];
      }));
  }


  saveTitul(titul: Titul) {
    var url = this.state.config['context'] + 'index';
    let params: HttpParams = new HttpParams()
      .set('action', 'SAVE_TITUL')
      .set('json', JSON.stringify(titul));
    return this.http.get(url, {params: params});
  }


  saveIssue(issue: Issue) {
    console.log(issue);
    var url = this.state.config['context'] + 'index';
    let params: HttpParams = new HttpParams()
      .set('action', 'SAVE_ISSUE')
      .set('json', JSON.stringify(issue));
      
    return this.http.get(url, {params: params});
  }
  
  duplicateExemplar(issue: Issue, vlastnik: string, onspecial: boolean, exemplar: Exemplar, start: string, end: string){
    
    var url = this.state.config['context'] + 'index';
    let params: HttpParams = new HttpParams()
      .set('action', 'DUPLICATE_EX')
      .set('issue', JSON.stringify(issue))
      .set('exemplar', JSON.stringify(exemplar))
      .set('vlastnik', vlastnik)
      .set('onspecial', onspecial.toString())
      .set('start', start)
      .set('end', end);
      
    return this.http.get(url, {params: params});
  }
  
  addVdkEx(issue: Issue, urlvdk: string, options: any){
    
    var url = this.state.config['context'] + 'index';
    let params: HttpParams = new HttpParams()
      .set('action', 'ADD_VDK_SET')
      .set('issue', JSON.stringify(issue))
      .set('options', JSON.stringify(options))
      .set('url', urlvdk);
      
    return this.http.get(url, {params: params});
  }

  saveCurrentIssue() {
    return this.saveIssue(this.state.currentIssue);
  }

  getIssue(id: string): Observable<any[]> {
    var url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('fl', '*,exemplare:[json]')
      .set('fq', 'id:"' + id + '"');
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  getTitulTotals(id: string) {
    var url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      //    .set('fq', 'datum_vydani:"' + datum + '"')
      .append('fq', 'id_titul:"' + id + '"')
      .set('stats', 'true')
      .set('stats.field', '{!key=mutace countDistinct=true count=true}mutace')
      .append('stats.field', '{!key=den countDistinct=true count=true max=true min=true}datum_vydani_den')
      .append('stats.field', '{!key=vlastnik countDistinct=true count=true max=true min=true}vlastnik')
      .append('stats.field', 'exemplare')
    return this.http.get(url, {params: params});
  }

  search() {
    var url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams()
      .set('q', this.state.q ? this.state.q : '*')
      .set('wt', 'json')
      .set('rows', '500')
      .set('sort', 'datum_vydani_den asc')
      //.set('fq', 'exemplare:[* TO *]')
      //.set('fq', '{!collapse field=id_titul}')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .set('json.nl', 'arrntv')
      .set('fl', '*, exemplare:[json]')
      //.set('fl', '*')
      .set('stats', 'true')
      .set('stats.field', 'datum_vydani_den')
      .set('facet.field', 'meta_nazev')
      .append('facet.field', 'vlastnik')
      .append('facet.field', 'mutace')
      .append('facet.field', 'vydani');

    //facet.range=datum_vydani&facet.range.start=NOW/YEAR-200YEARS&facet.range.end=NOW&facet.range.gap=%2B1YEAR

    this.state.filters.forEach((f: Filter) => {
      //    for (let f in this.state.filters){
      params = params.append('fq', f.field + ':"' + f.value + '"');
    });

    if (this.state.filterByDate) {
      params = params.append('fq', 'datum_vydani_den:[' + this.state.start_year + '0101 TO ' + this.state.end_year + '1231]');
    }
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params});
  }

  searchTitulyHome() {
    var url = this.state.config['context'] + 'search/issue/select';
    
    let params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('rows', '500')
      .set('sort', 'datum_vydani_den asc')
      .set('fq', '{!collapse field=id_titul}')
      .set('fl', '*, exemplare:[json]');
      
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
