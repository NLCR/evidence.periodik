
import {Component, OnInit} from '@angular/core';
import {StavIssue} from './models/stav-issue.enum';

import {Title} from '@angular/platform-browser';
import {Http, URLSearchParams} from '@angular/http';
import {ActivatedRoute, Router, Params, NavigationEnd, NavigationStart} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/Rx';
import {Subscription} from 'rxjs/Subscription';

import {AppService} from './app.service';
import {AppState} from './app.state';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'Evidence periodik';
    stavy = [];

    init: boolean = false;

    subscriptions: Subscription[] = [];

    constructor(
        public state: AppState,
        private service: AppService,
        private translate: TranslateService,
        private titleService: Title,
        private http: Http,
        private route: ActivatedRoute,
        private router: Router) {}

    ngOnInit() {

        this.processUrl();
        this.getConfig().subscribe(cfg => {});

        this.service.langSubject.subscribe(() => {
            this.translate.get('title.app').subscribe((newTitle: string) => {
                this.titleService.setTitle(newTitle);
            });
        });

        this.router.events.subscribe(val => {
            if (val instanceof NavigationEnd) {
                this.state.activePage = val.url;
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s: Subscription) => {
            s.unsubscribe();
        });
        this.subscriptions = [];
    }



    processUrl() {

        this.subscriptions.push(this.route.params
            .switchMap((params: Params) => Observable.of(params['start'])).subscribe(start => {
                if (start) {

                }
            }));

        this.subscriptions.push(this.router.events.subscribe(val => {

            if (val instanceof NavigationEnd) {

            } else if (val instanceof NavigationStart) {

            }
        }));
    }

    getConfig() {
        return this.http.get("assets/config.json").map(res => {
            let cfg = res.json();
            this.state.config = cfg;
            this.service.getSpecialDays();
            var userLang = navigator.language.split('-')[0]; // use navigator lang if available
            userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
            if (cfg.hasOwnProperty('defaultLang')) {
                userLang = cfg['defaultLang'];
            }

            this.state.setConfig(cfg);
            return this.state.config;
        });
    }
  
  showToolbarAndFacets(){
      //state.activePage != '/' && state.activePage != '/home' && state.activePage != '/login' && state.activePage != '/add-record'
      return this.state.activePage.indexOf('/calendar') > -1 || this.state.activePage.indexOf('/result') > -1;
  }


}
