import {Injectable} from '@angular/core';
import {Router, ActivatedRoute, Params, NavigationStart, NavigationEnd, NavigationExtras} from '@angular/router';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

import {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import {tap, map} from 'rxjs/operators';
import {of} from "rxjs";

import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';

import {CloneParams} from './models/clone-params';
import {AppState} from './app.state';
import {Filter} from './models/filter';
import {Titul} from './models/titul';
import {Issue} from './models/issue';
import {Exemplar} from './models/exemplar';
import {HttpErrorResponse} from '@angular/common/http';
import { Volume } from './models/volume';

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

    const url = this.state.config['context'] + 'search/calendar/select';
    let params: HttpParams = new HttpParams();
    params = params.set('q', '*');
      params = params.set('rows', '100');
    this.http.get(url, {params: params}).subscribe((res) => {
      this.state.specialDays = res;
    });
  }

  getSpecialDaysOfMonth(d: Date): Observable<any[]> {
    const url = this.state.config['context'] + 'search/calendar/select';
    let params: HttpParams = new HttpParams();
    let test = this.state.config['test'];
    test = false;

      const month = this.datePipe.transform(d, 'M');
      const year = this.datePipe.transform(d, 'yyyy');
      const q = '(month:' + month + ' AND year:' + year + ') OR (month:' + month + ' AND year:0)';
      params = params.set('q', q);
      params = params.set('rows', '50');

    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  isSpecial(d: Date): Observable<any[]> {
    const url = this.state.config['context'] + 'search/calendar/select';
    let params: HttpParams = new HttpParams();
    const test = this.state.config['test'];

    const day = this.datePipe.transform(d, 'd');
      const month = this.datePipe.transform(d, 'M');
      const year = this.datePipe.transform(d, 'yyyy');
      const q = '(day:' + day + ' AND month:' + month + ' AND year:' + year + ') OR (day:' + day + ' AND month:' + month + ' AND year:0)';
      params = params.set('q', q);
      params = params.set('rows', '1');

    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  getIssuesOfTitul(uuid: string, month: string): Observable<any[]> {
    let params: HttpParams = new HttpParams();
    const url = this.state.config['context'] + 'search/issue/select';

    params = new HttpParams()
        .set('q', '*')
        .set('wt', 'json')
        .set('rows', '200')
        .set('fl', '*,exemplare:[json], pages:[json]')
        .set('fq', 'id_titul:"' + uuid + '"')
        .append('fq', 'datum_vydani:[' + month + ' TO ' + month + ']');

    // params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  searchByCarKod(carovy_kod: string) : Observable<any> {
    let params: HttpParams = new HttpParams();

    params = new HttpParams()
        .set('q', carovy_kod)
        .set('wt', 'json')
        .set('rows', '1')
        .set('fl', '*,exemplare:[json], pages:[json]')
        .set('sort', 'datum_vydani_den asc, vydani desc')
        .set('stats','true')
        .set('stats.field', 'datum_vydani_den');
    const url = this.state.config['context'] + 'search/issue/select';

    // params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params});
  }

  getIssuesOfVolume(volume: Volume): Observable<any[]> {
    let params: HttpParams = new HttpParams();

    params = new HttpParams()
        .set('q', volume.carovy_kod)
        .set('wt', 'json')
        .set('rows', '200')
        .set('fl', '*,exemplare:[json], pages:[json]')
        .set('sort', 'datum_vydani_den asc, vydani desc')
        .set('fq', 'id_titul:"' + volume.id_titul + '"')
        .append('fq', 'datum_vydani:[' + volume.datum_od + ' TO ' + volume.datum_do + ']');
    const url = this.state.config['context'] + 'search/issue/select';

    // params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  getTitul(id: string): Observable<Titul> {
    const url = this.state.config['context'] + 'search/titul/select';
    let params: HttpParams = new HttpParams();
    params = params.set('q', '*')
      .set('fq', 'id:"' + id + '"');
    return this.http.get<Titul>(url, {params: params}).pipe(
      map((res) => {
        const t = new Titul();
        t.id = id;
        if (res['response']['numFound'] > 0) {
          t.meta_nazev = res['response']['docs'][0]['meta_nazev'];
        }
        return t;
      }));
  }


  getTitul_(id: string): Observable<Titul> {
    let url = this.state.config['context'] + 'search/issue/select';
    let params: HttpParams = new HttpParams();
    const test = this.state.config['test'];
    if (test) {
      url = this.state.config['context'] + 'assets/titul.json';
    } else {
      params = params.set('q', '*').set('rows', '1').set('fq', 'id_titul:"' + id + '"');
      //params.set('fl', 'start:datum_vydani,title:nazev,*')
    }
    return this.http.get<Titul>(url, {params: params}).pipe(
      tap((res) => {
        const t = new Titul();
        t.id = id;
        if (res['response']['numFound'] > 0) {
          t.meta_nazev = res['response']['docs'][0]['nazev'];
        }
        return t;

      }));
  }


  getTituly(): Observable<any> {
    const url = this.state.config['context'] + 'search/titul/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('sort', 'meta_nazev asc')
      .set('rows', '500');

    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        this.state.tituly = res['response']['docs'];
      }));
  }

  getVolumeFacets(id_titul: string): Observable<any> {
    const url = this.state.config['context'] + 'search/issue/select';
    const params: HttpParams = new HttpParams()
      .set('q', 'id_titul:"' + id_titul + '"')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .set('f.mutace.facet.mincount', '0')
      .set('json.nl', 'arrntv')
      .set('rows', '0')
      .append('facet.field', 'znak_oznaceni_vydani')
      .append('facet.field', 'mutace');

    return this.http.get(url, {params: params});
  }


  saveTitul(titul: Titul) {
    const url = this.state.config['context'] + 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'SAVE_TITUL')
      .set('json', JSON.stringify(titul));
    return this.http.get(url, {params: params});
  }

  isValidAsInteger(o): boolean {
    if (typeof (o) === 'string') {
      if (parseInt(o) + '' !== o) {
        return false;
      }
    }
    return true
  }


  isIssueValid(issue: Issue): boolean {
    try {
//      if (!this.isValidAsInteger(issue.rocnik)) {
//        return false;
//      }
      if (!this.isValidAsInteger(issue.druhe_cislo)) {
        return false;
      }
      if (!this.isValidAsInteger(issue.cislo)) {
        return false;
      }

      //Cistime stavy, aby nebyly "null"
      issue.exemplare.forEach(ex => {
        if(ex.stav){
          ex.stav = ex.stav.filter(st => st !== "null");
        }
      });
      return true;
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }

  saveIssues(vol: Volume, issues: Issue[]): Observable<any> {
      const body = {svazek: vol, issues: issues};
      const url = this.state.config['context'] + 'index';
      const params: HttpParams = new HttpParams()
        .set('action', 'SAVE_ISSUES');

      return this.http.post(url, body, {params: params});
  }

  saveIssue(issue: Issue) {
    if (this.isIssueValid(issue)) {
      const url = this.state.config['context'] + 'index';
      const params: HttpParams = new HttpParams()
        .set('action', 'SAVE_ISSUE')
        .set('json', JSON.stringify(issue));

      return this.http.get(url, {params: params});
    } else {
      return of('error');
    }
  }

  deleteIssue(issue: Issue) {
    const url = this.state.config['context'] + 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'DELETE_ISSUE')
      .set('id', issue.id);

    return this.http.get(url, {params: params});
  }

  addVydani(issue: Issue, vydani: string) {
    const newIssue = new Issue();
    newIssue.fromJSON(issue);
    newIssue.id = null;
    newIssue.vydani = vydani;

    //console.log(newIssue);
    const url = this.state.config['context'] + 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'SAVE_ISSUE')
      .set('json', JSON.stringify(newIssue));

    return this.http.get(url, {params: params});
  }

  duplicateExemplar(issue: Issue, vlastnik: string, start_cislo: number, onspecial: boolean, exemplar: Exemplar, start: string, end: string) {
//console.log(exemplar);
    const url = this.state.config['context'] + 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'DUPLICATE_EX')
      .set('issue', JSON.stringify(issue))
      .set('exemplar', JSON.stringify(exemplar))
      .set('vlastnik', vlastnik)
      .set('cislo', start_cislo.toString())
      .set('onspecial', onspecial.toString())
      .set('start', start)
      .set('end', end);

    return this.http.get(url, {params: params});
  }

  addVdkEx(issue: Issue, urlvdk: string, options: any) {

    const url = this.state.config['context'] + 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'ADD_VDK_SET')
      .set('issue', JSON.stringify(issue))
      .set('options', JSON.stringify(options))
      .set('url', urlvdk);

    return this.http.get(url, {params: params});
  }

  prepareVdkEx(issue: Issue, urlvdk: string, options: any) {

    const url = this.state.config['context'] + 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'COLLECT_VDK_SET')
      .set('issue', JSON.stringify(issue))
      .set('options', JSON.stringify(options))
      .set('url', urlvdk);

    return this.http.get(url, {params: params});
  }

  saveCurrentIssue(): Observable<any> {
    const issue: Issue = JSON.parse(JSON.stringify(this.state.currentIssue));
    issue.exemplare.forEach((ex: Exemplar) => {
      delete ex['pagesRange'];
    });
    return this.saveIssue(issue);
  }

  getIssue(id: string): Observable<any[]> {
    const url = this.state.config['context'] + 'search/issue/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('fl', '*,exemplare:[json],pages:[json]')
      .set('fq', 'id:"' + id + '"');
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  getVolume(id: string): Observable<any[]> {
    const url = this.state.config['context'] + 'search/svazek/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('fl', '*,periodicita:[json]')
      .set('fq', 'id:"' + id + '"');
    return this.http.get(url, {params: params}).pipe(
      map((res) => {
        return res['response']['docs'];
      }));
  }

  getTitulTotals(id: string) {
    const url = this.state.config['context'] + 'search/issue/select';
    const params: HttpParams = new HttpParams()
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

  doSearchParams(): HttpParams {
    let params: HttpParams = new HttpParams()
      .set('q', this.state.q ? this.state.q : '*')
      .set('wt', 'json')
      .set('rows', '' + this.state.rows)
      .set('start', '' + (this.state.currentPage * this.state.rows))
      .set('sort', 'datum_vydani_den asc, vydani desc')
      //.set('fq', 'exemplare:[* TO *]')
      //.set('fq', '{!collapse field=id_titul}')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .set('json.nl', 'arrntv')
      .set('fl', '*, exemplare:[json], pages:[json]')
      //.set('fl', '*')
      .set('stats', 'true')
      .set('stats.field', 'datum_vydani_den')
      .set('facet.field', 'meta_nazev')
      .set('facet.field', 'nazev')
      .append('facet.field', 'mutace')
      .append('facet.field', 'vydani')
      .append('facet.field', 'znak_oznaceni_vydani')
      .append('facet.field', 'vlastnik')
      .append('facet.field', 'stav');

    //facet.range=datum_vydani&facet.range.start=NOW/YEAR-200YEARS&facet.range.end=NOW&facet.range.gap=%2B1YEAR

    this.state.filters.forEach((f: Filter) => {
      //    for (let f in this.state.filters){
      params = params.append('fq', f.field + ':"' + f.value + '"');
    });

    if (this.state.filterByDate) {
      params = params.append('fq', 'datum_vydani_den:[' + this.state.start_year + '0101 TO ' + this.state.end_year + '1231]');
    }
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return params;
  }

  search() {
    const url = this.state.config['context'] + 'search/issue/permonik';
    const params = this.doSearchParams();
    return this.http.get(url, {params: params});
  }

  searchCalendar(month: string) {
    const url = this.state.config['context'] + 'search/issue/permonik';
    let params = this.doSearchParams();
    params = params.append('fq', 'datum_vydani:[' + month + ' TO ' + month + ']');
    return this.http.get(url, {params: params});
  }

  searchTitulyHome() {
    const url = this.state.config['context'] + 'search/issue/select';

    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('rows', '500')
      .set('sort', 'datum_vydani_den asc')
      .set('fq', '{!collapse field=id_titul}')
      .set('fl', '*, id_titul, exemplare:[json], pages:[json]');

    return this.http.get(url, {params: params});
  }

  clone(cfg: CloneParams) {
    const url = this.state.config['context'] + 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'CLONE')
      .set('cfg', JSON.stringify(cfg));
    //params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, {params: params});
  }

  login() {
    this.state.loginError = false;
    return this.doLogin().subscribe(
      res => {
      if (res.hasOwnProperty('error')) {
        this.state.loginError = true;
        this.state.logged = false;
      } else {
        this.state.user = res;
        this.state.loginError = false;
        this.state.loginuser = '';
        this.state.loginpwd = '';
        this.state.logged = true;
        if (this.state.redirectUrl) {
          this.router.navigate([this.state.redirectUrl]);
        }
      }
    },
    (err: HttpErrorResponse) =>{
      console.log(err);
        this.state.loginHttpError = true;
      this.state.loginHttpErrorMsg = err.statusText;
        this.state.logged = false;
    });
  }

  doLogin(): Observable<any> {
    const url = 'lg'
    var params = new HttpParams()
      .set('user', this.state.loginuser)
      .set('pwd', this.state.loginpwd)
      .set('action', 'LOGIN');
    return this.http.get(url, {params: params});

    

  }

  logout() {
    this.doLogout().subscribe(res => {
      if (res.hasOwnProperty('error')) {
        console.log(res['error']);
      }
      this.state.loginError = false;
      this.state.logged = false;
      this.router.navigate(['/home']);
    });
  }

  doLogout() {
    const url = 'lg';
    var params = new HttpParams().set('action', 'LOGOUT');
    return this.http.get(url, {params: params});
  }

}
