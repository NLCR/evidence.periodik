import {Injectable} from '@angular/core';
import {Router, ActivatedRoute, Params, NavigationStart, NavigationEnd, NavigationExtras} from '@angular/router';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';

import {Http, Response, URLSearchParams, Headers, RequestOptions} from '@angular/http';

import {AppState} from './app.state';

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
        private http: Http,
        private datePipe: DatePipe) {}

    changeLang(lang: string) {
        //console.log('lang changed to ' + lang);
        this.state.currentLang = lang;
        this.translate.use(lang);
        this._langSubject.next(lang);
    }

    getSpecialDays() {

        var url = this.state.config['context'] + 'search/calendar/select';
        let params: URLSearchParams = new URLSearchParams();
        if (this.state.config['test']) {
            url = this.state.config['context'] + 'assets/special.json';
        } else {
            params.set('q', '*');
            params.set('rows', '100');
        }
        this.http.get(url, {search: params}).map((res: Response) => {
            this.state.specialDays = res.json();
            console.log(this.state.specialDays);
        }).subscribe();
    }

    getSpecialDaysOfMonth(d: Date) {
        var url = this.state.config['context'] + 'search/calendar/select';
        let params: URLSearchParams = new URLSearchParams();
        let test = this.state.config['test'];
        test = false;
        if (test) {
            url = this.state.config['context'] + 'assets/special.json';
        } else {
            let month = this.datePipe.transform(d, 'M');
            let year = this.datePipe.transform(d, 'yyyy');
            let q = '(month:' + month + ' AND year:' + year + ') OR (month:' + month + ' AND year:0)';
            params.set('q', q);
            params.set('rows', '50');
        }
        return this.http.get(url, {search: params}).map((res: Response) => {
            return res.json()['response']['docs'];
        });
    }

    isSpecial(d: Date) {
        var url = this.state.config['context'] + 'search/calendar/select';
        let params: URLSearchParams = new URLSearchParams();
        let test = this.state.config['test'];
        test = false;
        if (test) {
            url = this.state.config['context'] + 'assets/special.json';
        } else {
            let day = this.datePipe.transform(d, 'd');
            let month = this.datePipe.transform(d, 'M');
            let year = this.datePipe.transform(d, 'yyyy');
            let q = '(day:' + day + ' AND month:' + month + ' AND year:' + year + ') OR (day:' + day + ' AND month:' + month + ' AND year:0)';
            params.set('q', q);
            params.set('rows', '1');
        }
        return this.http.get(url, {search: params}).map((res: Response) => {
            return res.json()['response']['docs'];
        });
    }

    getIssuesOfTitul(uuid: string, month: string) {
        let params: URLSearchParams = new URLSearchParams();
        var url = '';
        let test = true;
        if (test) {
            url = this.state.config['context'] + 'assets/issues.json';
        } else {
            params.set('q', '*');
            params.set('fq', 'uuid_titulu:"' + uuid + '"');
            params.set('fq', 'datum_vydani:[' + month + ' TO ' + month + ']');
            url = this.state.config['context'] + 'search/issue/select';
        }
        //params.set('fl', 'start:datum_vydani,title:nazev,*')
        return this.http.get(url, {search: params}).map((res: Response) => {
            return res.json()['response']['docs'];
        });
    }

    getTitul(id: string) {
        var url = this.state.config['context'] + 'search/titul/select';
        let params: URLSearchParams = new URLSearchParams();
        let test = this.state.config['test'];
        if (test) {
            url = this.state.config['context'] + 'assets/titul.json';
        } else {
            params.set('q', '*');
            params.set('fq', 'id:"' + id + '"');
            //params.set('fl', 'start:datum_vydani,title:nazev,*')
        }
        return this.http.get(url, {search: params}).map((res: Response) => {
            return res.json()['response']['docs'];
        });
    }

    getIssue(id: string) {
        var url = this.state.config['context'] + 'search/issue/select';
        let params: URLSearchParams = new URLSearchParams();
        params.set('q', '*');
        params.set('wt', 'json');
        params.set('fl', '*,exemplare:[json]');
        params.set('fq', 'id:"' + id + '"');
        //params.set('fl', 'start:datum_vydani,title:nazev,*')
        return this.http.get(url, {search: params}).map((res: Response) => {
            return res.json()['response']['docs'];
        });
    }

}
