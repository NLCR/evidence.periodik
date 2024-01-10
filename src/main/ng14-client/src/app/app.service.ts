import { Injectable } from '@angular/core';
// import { Router, ActivatedRoute, Params, NavigationStart, NavigationEnd, NavigationExtras } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

import { Observable, Subject, of } from 'rxjs';
// import { tap, map } from 'rxjs/operators';
import { map } from 'rxjs/operators';

import { HttpClient, HttpParams } from '@angular/common/http';

import { CloneParams } from './models/clone-params';
import { AppState } from './app.state';
import { Filter } from './models/filter';
import { Titul } from './models/titul';
import { Issue } from './models/issue';
import { Exemplar } from './models/exemplar';
import { Volume } from './models/volume';
import { User } from './models/user';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AppService {

  // Observe language
  public _langSubject = new Subject();
  public langSubject: Observable<any> = this._langSubject.asObservable();

  constructor(
    private state: AppState,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar) { }

  changeLang(lang: string) {
    // console.log('lang changed to ' + lang);
    this.state.currentLang = lang;
    this.translate.use(lang);
    this._langSubject.next(lang);
  }

  getSpecialDays() {

    const url = '/api/v2/search/calendar/select';
    let params: HttpParams = new HttpParams();
    params = params.set('q', '*');
    params = params.set('rows', '100');
    this.http.get(url, { params }).subscribe((res) => {
      this.state.specialDays = res;
    });
  }

  getSpecialDaysOfMonth(d: Date): Observable<any[]> {
    const url = '/api/v2/search/calendar/select';
    let params: HttpParams = new HttpParams();
    const month = this.datePipe.transform(d, 'M');
    const year = this.datePipe.transform(d, 'yyyy');
    const q = '(month:' + month + ' AND year:' + year + ') OR (month:' + month + ' AND year:0)';
    params = params.set('q', q);
    params = params.set('rows', '50');

    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.response.docs;
      }));
  }

  isSpecial(d: Date): Observable<any[]> {
    const url = '/api/v2/search/calendar/select';
    let params: HttpParams = new HttpParams();

    const day = this.datePipe.transform(d, 'd');
    const month = this.datePipe.transform(d, 'M');
    const year = this.datePipe.transform(d, 'yyyy');
    const q = '(day:' + day + ' AND month:' + month + ' AND year:' + year + ') OR (day:' + day + ' AND month:' + month + ' AND year:0)';
    params = params.set('q', q);
    params = params.set('rows', '1');

    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.response.docs;
      }));
  }

  // getIssuesOfTitul(uuid: string, month: string): Observable<any[]> {
  //   const params: HttpParams = new HttpParams();
  //   const url = '/api/v2/search/issue/select';
  //
  //   params
  //     .set('q', '*')
  //     .set('wt', 'json')
  //     .set('rows', '200')
  //     .set('fl', '*,exemplare:[json], pages:[json]')
  //     .set('fq', 'id_titul:"' + uuid + '"')
  //     .append('fq', 'datum_vydani:[' + month + ' TO ' + month + ']');
  //
  //   // params.set('fl', 'start:datum_vydani,title:nazev,*')
  //   return this.http.get(url, { params }).pipe(
  //     map((res: any) => {
  //       return res.response.docs;
  //     }));
  // }

  volumeOverview(carovy_kod: string, idTitul: string): Observable<any> {
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('fq', 'id_titul:' + idTitul)
      .append('fq', 'carovy_kod:' + carovy_kod)
      .append('fq', '(numExists:"true" OR missing_number:"true")')
      .set('wt', 'json')
      // .set('rows', this.state.rows)
      .set('rows', 200000)
      .set('json.nl', 'arrntv')
      .set('fl', '*,pages:[json]')
      .set('sort', 'datum_vydani_den asc, vydani desc')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .set('facet.field', 'mutace')
      .append('facet.field', 'znak_oznaceni_vydani')
      .append('facet.field', 'vydani')
      .append('facet.field', 'stav')
      .set('facet.range', 'datum_vydani')
      .set('facet.range.start', 'NOW/YEAR-200YEARS')
      .set('facet.range.end', 'NOW/YEAR')
      .set('facet.range.gap', '+1YEAR')
      .set('stats', 'true')
      .set('stats.field', 'cislo')
      .append('stats.field', 'datum_vydani_den')
      .append('stats.field', 'pocet_stran')
    const url = '/api/v2/search/exemplar/select';

    // params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, { params });
  }

  // searchByCarKod(carovy_kod: string): Observable<any> {
  //   let params: HttpParams = new HttpParams();
  //
  //   params = new HttpParams()
  //     .set('q', carovy_kod)
  //     .set('wt', 'json')
  //     .set('rows', '1')
  //     .set('fl', '*,exemplare:[json], pages:[json]')
  //     .set('sort', 'datum_vydani_den asc, vydani desc')
  //     .set('stats', 'true')
  //     .set('stats.field', 'datum_vydani_den');
  //   const url = '/api/v2/search/issue/select';
  //
  //   // params.set('fl', 'start:datum_vydani,title:nazev,*')
  //   return this.http.get(url, { params });
  // }

  // getIssuesOfVolume(volume: Volume): Observable<any> {
  //   let params: HttpParams = new HttpParams();
  //
  //   params = new HttpParams()
  //     .set('q', volume.carovy_kod)
  //     .set('wt', 'json')
  //     .set('rows', '1000')
  //     .set('fl', '*,exemplare:[json], pages:[json]')
  //     .set('sort', 'datum_vydani_den asc, vydani desc')
  //     .set('fq', 'id_titul:"' + volume.id_titul + '"')
  //     .append('fq', 'datum_vydani:[' + volume.datum_od + ' TO ' + volume.datum_do + ']');
  //   const url = '/api/v2/search/issue/select';
  //
  //   // params.set('fl', 'start:datum_vydani,title:nazev,*')
  //   return this.http.get(url, { params }).pipe(
  //     map((res: any) => {
  //       return res.response;
  //     }));
  // }

  // searchIssueByDate(datum: string, id_titul: string): Observable<any[]> {
  //   let params: HttpParams = new HttpParams();
  //
  //   params = new HttpParams()
  //     .set('q', '*')
  //     .set('wt', 'json')
  //     .set('rows', '10')
  //     .set('fl', '*,exemplare:[json], pages:[json]')
  //     .set('sort', 'datum_vydani_den asc, vydani desc')
  //     .set('fq', 'id_titul:"' + id_titul + '"')
  //     .append('fq', 'datum_vydani_den:"' + datum + '"');
  //   const url = '/api/v2/search/issue/select';
  //
  //   // params.set('fl', 'start:datum_vydani,title:nazev,*')
  //   return this.http.get(url, { params }).pipe(
  //     map((res: any) => {
  //       return res.response.docs;
  //     }));
  // }

  getTitul(id: string): Observable<Titul> {
    const url = '/api/v2/search/titul/select';
    let params: HttpParams = new HttpParams();
    params = params.set('q', '*')
      .set('fq', 'id:"' + id + '"');
    return this.http.get<Titul>(url, { params }).pipe(
      map((res: any) => {
        const t = new Titul();
        t.id = id;
        if (res.response.numFound > 0) {
          t.meta_nazev = res.response.docs[0].meta_nazev;
        }
        return t;
      }));
  }


  // getTitul_(id: string): Observable<Titul> {
  //   const url = '/api/v2/search/issue/select';
  //   let params: HttpParams = new HttpParams();
  //
  //   params = params.set('q', '*').set('rows', '1').set('fq', 'id_titul:"' + id + '"');
  //
  //   return this.http.get<Titul>(url, { params }).pipe(
  //     tap((res: any) => {
  //       const t = new Titul();
  //       t.id = id;
  //       if (res.response.numFound > 0) {
  //         t.meta_nazev = res.response.docs[0].nazev;
  //       }
  //       return t;
  //
  //     }));
  // }


  getTituly(): Observable<any> {
    const url = '/api/v2/search/titul/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('sort', 'meta_nazev_sort asc')
      .set('rows', '500');
  //   return this.http.get(url, { params }).pipe(
  //     map((res: any) => {
  //       this.state.tituly = res.response.docs;
  //     }));
  // }
    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        let allowed = [];
        res.response.docs.map((doc) => {
          if (doc.show_to_not_logged_users || this.state.logged) {
            if (typeof doc.show_to_not_logged_users === 'undefined'){
              doc.show_to_not_logged_users = false;
            }
            allowed = [...allowed, doc];
          }
        });
        this.state.tituly = allowed;
      }));
  }

  getVolumeFacets(id_titul: string): Observable<any> {
    const url = '/api/v2/search/exemplar/select';
    const params: HttpParams = new HttpParams()
      .set('q', 'id_titul:"' + id_titul + '"')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .set('f.mutace.facet.mincount', '0')
      .set('json.nl', 'arrntv')
      .set('rows', '0')
      .append('facet.field', 'znak_oznaceni_vydani')
      .append('facet.field', 'mutace');

    return this.http.get(url, { params });
  }

  saveTitul(titul: Titul): Observable<any> {
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'SAVE_TITUL')
      .set('json', JSON.stringify(titul));
    return this.http.get(url, { params });
  }

  deleteTitul(id: string): Observable<any> {
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'DELETE_TITUL')
      .set('id', id);
    return this.http.get(url, { params });
  }

  isValidAsInteger(o): boolean {
    if (typeof (o) === 'string') {
      if (parseInt(o) + '' !== o) {
        return false;
      }
    }
    return true;
  }


  isIssueValid(issue: Issue): { valid: boolean, error: string } {
    const ret = { valid: true, error: '' };
    try {
      //      if (!this.isValidAsInteger(issue.rocnik)) {
      //        return false;
      //      }
      if (!issue.datum_vydani) {
        ret.valid = false;
        ret.error = 'Pole datum_vydani je povinne';
        return ret;
      }
      if (!issue.id_titul) {
        ret.valid = false;
        ret.error = 'Metatitul je povinne';
        return ret;
      }
      if (!this.isValidAsInteger(issue.druhe_cislo)) {
        ret.valid = false;
        ret.error = 'Druhe cislo not nevalidni';
        return ret;
      }
      if (!this.isValidAsInteger(issue.cislo)) {
        ret.valid = false;
        ret.error = 'Pole cislo neni validni';
        return ret;
      }

      // Cistime stavy, aby nebyly "null"
      issue.exemplare.forEach(ex => {
        if (ex.stav && Array.isArray(ex.stav)) {
          ex.stav = ex.stav.filter(st => st !== 'null');
        }
      });
    } catch (ex) {
      console.log(ex);
      ret.valid = false;
      ret.error = ex;
    }

    return ret;
  }

  isExemplarValid(ex: Exemplar): { valid: boolean, error: string } {
    const ret = { valid: true, error: '' };
    try {
      //      if (!this.isValidAsInteger(issue.rocnik)) {
      //        return false;
      //      }
      if (!ex.datum_vydani) {
        ret.valid = false;
        ret.error = 'Pole datum_vydani je povinne';
        return ret;
      }
      if (!ex.id_titul) {
        ret.valid = false;
        ret.error = 'Metatitul je povinne';
        return ret;
      }
      if (!this.isValidAsInteger(ex.druhe_cislo)) {
        ret.valid = false;
        ret.error = 'Druhe cislo not nevalidni';
        return ret;
      }

      // https://github.com/NKCR-INPROVE/evidence.periodik/issues/152
      // pokud u mimořádného čísla není hodnota čísla uvedena, může zůstat prázdné - není to chyba
      // if (!this.isValidAsInteger(ex.cislo)) {
      //   ret.valid = false;
      //   ret.error = 'Pole cislo neni validni';
      //   return ret;
      // }

      // Cistime stavy, aby nebyly "null"
      if (ex.stav && Array.isArray(ex.stav)) {
        ex.stav = ex.stav.filter(st => st !== 'null');
      }

    } catch (ex) {
      console.log(ex);
      ret.valid = false;
      ret.error = ex;
    }

    return ret;
  }

  saveExemplar(exemplar: Exemplar): Observable<any> {
    const isValid = this.isExemplarValid(exemplar);
    if (isValid.valid) {
      const url = 'index';
      const params: HttpParams = new HttpParams()
        .set('action', 'SAVE_EXEMPLAR');
      // const body = { exemplar };
      return this.http.post(url, exemplar, { params });
    } else {
      return of(isValid);
    }
  }

  saveExemplars(vol: Volume, exemplars: Exemplar[]): Observable<any> {
    // console.log("Saving exemplars")
    const body = { svazek: vol, exemplars };
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'SAVE_EXEMPLARS');

    return this.http.post(url, body, { params });
  }

  deleteSvazekAndExemplars(request: object): Observable<any> {
    const body = request;
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'DELETE_SVAZEK_AND_EXEMPLARS');

    return this.http.post(url, body, { params });
  }

  // saveIssues(vol: Volume, issues: Issue[]): Observable<any> {
  //   const body = { svazek: vol, issues };
  //   const url = 'index';
  //   const params: HttpParams = new HttpParams()
  //     .set('action', 'SAVE_ISSUES');
  //
  //   return this.http.post(url, body, { params });
  // }

  saveIssue(issue: Issue): Observable<any> {
    const isValid = this.isIssueValid(issue);
    // console.log("delete")
    // console.log(issue)
    if (isValid.valid) {
      const url = 'index';
      const params: HttpParams = new HttpParams()
        .set('action', 'SAVE_EXEMPLARS');

      return this.http.post(url, { exemplars: issue.exemplare }, { params });
    } else {
      return of(isValid);
    }
  }

  deleteIssue(issue: Issue): Observable<any> {
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'DELETE_ISSUE')
      .set('id', issue.id);

    return this.http.get(url, { params });
  }

  addVydani(issue: Issue, vydani: string): Observable<any> {
    const newIssue = new Issue();
    newIssue.fromJSON(issue);
    newIssue.id = null;
    newIssue.vydani = vydani;

    // console.log(newIssue);
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'SAVE_ISSUE')
      .set('json', JSON.stringify(newIssue));

    return this.http.get(url, { params });
  }

  duplicateExemplar(issue: Issue, vlastnik: string,
    start_cislo: number, onspecial: boolean,
    exemplar: Exemplar, start: string, end: string): Observable<any> {
    // console.log(exemplar);
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'DUPLICATE_EX')
      .set('issue', JSON.stringify(issue))
      .set('exemplar', JSON.stringify(exemplar))
      .set('vlastnik', vlastnik)
      .set('cislo', start_cislo.toString())
      .set('onspecial', onspecial.toString())
      .set('start', start)
      .set('end', end);

    return this.http.get(url, { params });
  }

  // addVdkEx(issue: Issue, urlvdk: string, options: any) {
  //
  //   const url = 'index';
  //   const params: HttpParams = new HttpParams()
  //     .set('action', 'ADD_VDK_SET')
  //     .set('issue', JSON.stringify(issue))
  //     .set('options', JSON.stringify(options))
  //     .set('url', urlvdk);
  //
  //   return this.http.get(url, { params });
  // }

  prepareVdkEx(issue: Issue, urlvdk: string, options: any): Observable<any> {

    // const url = 'index';
    // const params: HttpParams = new HttpParams()
    //   .set('action', 'COLLECT_VDK_SET')
    //   .set('issue', JSON.stringify(issue))
    //   .set('options', JSON.stringify(options))
    //   .set('url', urlvdk);
    // return this.http.get(url, { params });

    const url = 'index?action=COLLECT_VDK_SET';
    const json = { issue, urlvdk, options };

    return this.http.post(url, json);

  }

  saveCurrentIssue(): Observable<any> {
    const issue: Issue = this.state.currentIssue;
    issue.exemplare.forEach((ex: Exemplar) => {
      // delete ex.pagesRange;
      // copy issue changed properties to exemplar

      ex.nazev = issue.nazev;
      ex.podnazev = issue.podnazev;
      ex.vydani = issue.vydani;
      ex.znak_oznaceni_vydani = issue.znak_oznaceni_vydani;
      ex.cas_vydani = issue.cas_vydani;
      ex.mutace = issue.mutace;
      ex.periodicita = issue.periodicita;
      ex.pocet_stran = issue.pocet_stran;
      ex.rocnik = issue.rocnik;
      ex.cislo = issue.cislo;
      ex.druhe_cislo = issue.druhe_cislo;
    });
    return this.saveIssue(issue);
  }

  getIssue(id: string): Observable<any[]> {
    // console.log("get issue api")
    const url = '/api/v2/search/exemplar/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('rows', '30')
      .set('fl', '*,pages:[json]')
      .set('fq', 'id_issue:"' + id + '"');
    // params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.response.docs;
      }));
  }

  getVolume(id: string): Observable<any[]> {
    const url = '/api/v2/search/svazek/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('fl', '*,periodicita:[json]')
      .set('fq', 'id:"' + id + '"');
    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.response.docs;
      }));
  }

  getPeriodicals(id: string): Observable<any[]> {
    const url = '/api/v2/search/svazek/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('fl', 'periodicita:[json]')
      .set('fq', 'id:"' + id + '"')
    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.response.docs;
      }));
  }

  logout(): Observable<any[]> {
    const url = '/api/v2/auth/logout';
    return this.http.post(url, {}).pipe(map((res: any) => {
      return res.response;
    }));
  }

  logoutShibboleth(): Observable<any[]> {
    const url = '/Shibboleth.sso/Logout';
    return this.http.get(url, {}).pipe(map((res: any) => {
      return res.response;
    }));
  }

  getMetaTitlePeriodicals(id: string): Observable<any[]> {
    const url = '/api/v2/search/svazek/select'
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('fl', 'periodicita:[json]')
      .set('fq', 'id_titul:"' + id + '"')
      .set("rows", "100000")
    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.response.docs
      }))
  }

  getDistinctValuesOfMetaTitleForAttachments(id: string): Observable<any[]> {
    const url = '/api/v2/search/exemplar/select'
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('stats', 'true')
      .set('stats.calcdistinct', 'true')
      .set('stats.field', 'nazev')
      .append('stats.field', 'podnazev')
      .set('fq', 'id_titul:"' + id + '"')
      .append('fq', '(numExists:"true" OR missing_number:"true")')
      .append('fq', 'isPriloha:"true"')
      // .set("rows", "1000")
    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.stats.stats_fields
      }))
  }

  getExemplarsByCarKod(carKod: string, dateRange: string): Observable<any> {
    const url = '/api/v2/search/exemplar/select';
    const params: HttpParams = new HttpParams()
      .set('q', dateRange)
      .set('wt', 'json')
      .set('fl', '*,pages:[json]')
      .set('rows', '1000')
      .set('sort', 'datum_vydani_den asc, vydani asc')
      .set('stats', 'true')
      .set('stats.field', 'datum_vydani_den')
      .set('fq', 'carovy_kod:"' + carKod + '"');
    return this.http.get(url, { params });
  }

  // getExemplarsByCarKodVlastnik(carKodVlastnik: string): Observable<any> {
  //   const url = '/api/v2/search/exemplar/select';
  //   const params: HttpParams = new HttpParams()
  //     .set('q', '*')
  //     .set('wt', 'json')
  //     .set('fl', '*,pages:[json]')
  //     .set('sort', 'datum_vydani_den asc, vydani desc')
  //     .set('stats', 'true')
  //     .set('stats.field', 'datum_vydani_den')
  //     .set('fq', 'carovy_kod_vlastnik:"' + carKodVlastnik + '"');
  //   return this.http.get(url, { params });
  // }

  getTitulTotals(id: string) {
    const url = '/api/v2/search/exemplar/select';
    const params: HttpParams = new HttpParams()
      .set('q', '*')
      .set('wt', 'json')
      .set('rows', '0')
      .append('fq', 'id_titul:"' + id + '"')
      .append('fq', '(numExists:"true" OR missing_number:"true")')
      .set('stats', 'true')
      .set('stats.field', '{!key=mutace countDistinct=true count=true}mutace')
      .append('stats.field', '{!key=den countDistinct=true count=true max=true min=true}datum_vydani_den')
      .append('stats.field', '{!key=vlastnik countDistinct=true count=true max=true min=true}vlastnik')
      // .append('stats.field', 'exemplare')
      .append('group', 'true')
      .append('group.field', 'id_issue')
      .append('group.limit', '1')
      .append('group.ngroups', 'true');
    return this.http.get(url, { params });
  }
  //
  // deleteVolume(barCode: string, dateRange: string): Observable<any> {
  //   const volumeUrl = '/api/v2/update/exemplar/delete';
  //   const exemplarsUrl = '/api/v2/update/exemplar/delete';
  //   const params: HttpParams = new HttpParams()
  //     .set('q', '*')
  //     .set('wt', 'json')
  //     .set('fl', '*,pages:[json]')
  //     .set('sort', 'datum_vydani_den asc, vydani desc')
  //     .set('stats', 'true')
  //     .set('stats.field', 'datum_vydani_den')
  //     .set('fq', 'carovy_kod_vlastnik:"' + carKodVlastnik + '"');
  //   return this.http.get(url, { params });
  // }

  doSearchParams(includeRowsLimit = false): HttpParams {
    let params: HttpParams = new HttpParams()
      .set('q', this.state.q ? this.state.q : '*')
      .set('wt', 'json')
      // .set('rows', '' + this.state.rows)
      // .set('start', '' + (this.state.currentPage * this.state.rows))
      .set('sort', 'datum_vydani_den asc, vydani desc')
      // .set('fq', 'exemplare:[* TO *]')
      // .set('fq', '{!collapse field=id_titul}')
      .set('facet', 'true')
      .set('facet.mincount', '1')
      .set('json.nl', 'arrntv')
      .set('fl', '*, exemplare:[json], pages:[json]')
      // .set('fl', '*')
      .set('stats', 'true')
      .set('stats.field', 'datum_vydani_den')
      .set('facet.field', 'meta_nazev')
      .set('facet.field', 'nazev')
      .append('facet.field', 'podnazev')
      .append('facet.field', 'mutace')
      .append('facet.field', 'vydani')
      .append('facet.field', 'znak_oznaceni_vydani')
      .append('facet.field', 'vlastnik')
      .append('facet.field', 'stav');
      // .append('fq', 'numExists:true');

    if(includeRowsLimit){
      params = params.set('rows', '' + this.state.rows)
      params = params.set('start', '' + (this.state.currentPage * this.state.rows))
    } else{
      params = params.set('rows', '' + 100000)
    }

    // facet.range=datum_vydani&facet.range.start=NOW/YEAR-200YEARS&facet.range.end=NOW&facet.range.gap=%2B1YEAR


    this.state.filters.forEach((f: Filter) => {
      if (f.value === 'notVerified'){
        params = params.append('fq',  '!stav:"OK"');
      } else{
        params = params.append('fq', f.field + ':"' + f.value + '"');
      }
    });
    // }



    if (this.state.filterByDate) {
      params = params.append('fq', 'datum_vydani_den:[' + this.state.start_year + '0101 TO ' + this.state.end_year + '1231]');
    }

    if (this.state.filterByVolume) {
      params = params.append('fq', 'carovy_kod:' + this.state.volume_id_for_search);
    }
    // params.set('fl', 'start:datum_vydani,title:nazev,*')
    return params;
  }

  search() {
    // console.log("Search api")
    const url = '/api/v2/search/issue/permonik';
    const params = this.doSearchParams();
    return this.http.get(url, { params });
  }

  searchIssuesOfTitul(id: string) {
    // const url = '/api/v2/search/issue/permonik';
    // const params = this.doSearchParams()
    //  .append('fq', 'id_titul:"' + id + '"');
    // console.log("Search issue of titul")


    const url = '/api/v2/search/exemplar/select';
    const params = this.doSearchParams(true)
      .append('fq', 'id_titul:"' + id + '"')
      .append('fq', '(numExists:"true")')
      .append('group', 'true')
      .append('group.field', 'id_issue')
      .append('group.limit', '20')
      .append('group.ngroups', 'true');


    return this.http.get(url, { params });
  }

  // searchCalendar(month: string) {  //probably bad endpoint because of data migration
  //   const url = '/api/v2/search/issue/permonik';
  //   let params = this.doSearchParams();
  //   params = params.append('fq', 'datum_vydani:[' + month + ' TO ' + month + ']');
  //   return this.http.get(url, { params });
  // }

  searchCalendar(month: string) {
    const url = '/api/v2/search/exemplar/select';
    let params = this.doSearchParams()
    .append('fq', 'datum_vydani:[' + month + ' TO ' + month + ']')
    .append('fq', '(numExists:"true" OR missing_number:"true")')
    // .append('group', 'true')
    // .append('group.field', 'id_issue')
    // .append('group.limit', '1')
    // .append('group.ngroups', 'true')
    return this.http.get(url, { params });
  }

  clone(cfg: CloneParams): Observable<any> {
    const url = 'index';
    const params: HttpParams = new HttpParams()
      .set('action', 'CLONE')
      .set('cfg', JSON.stringify(cfg));
    // params.set('fl', 'start:datum_vydani,title:nazev,*')
    return this.http.get(url, { params });
  }



  getUsers(): Observable<any> {
    const url = '/api/v2/users/all';
    return this.http.get<any>(url)
      .pipe(map(resp => {
        return resp.docs;
      }));
  }

  saveUser(u: User): Observable<any> {
    return this.http.post(`/api/v2/users/save`, u);
  }

  resetHeslo(json: { id: string, oldheslo: string, newheslo: string }) {
    return this.http.post<any>(`/api/v2/users/resetpwd`, json);
  }


  showSnackBar(s: string, r: string = '', error: boolean = false, additionalInfo = '', duration = 0, positionMiddle = false) {
    const right = r !== '' ? this.getTranslation(r) : '';
    const clazz = error ? ( positionMiddle ? 'app-snack-error-middle' : 'app-snack-error') : ( positionMiddle ? 'app-snack-success-middle' : 'app-snack-success');
    this.snackBar.open(this.getTranslation(s) + additionalInfo, right, {
      duration: duration || 2000,
      verticalPosition: 'top',
      panelClass: clazz,
    });
  }

  getTranslation(s: string): string {
    return this.translate.instant(s);
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


}
