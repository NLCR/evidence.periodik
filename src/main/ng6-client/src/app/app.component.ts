import {Component, OnInit} from '@angular/core';

import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router, NavigationEnd, NavigationStart} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';

import {AppService} from './app.service';
import {AppState} from './app.state';
import {HttpClient} from '@angular/common/http';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'Evidence periodik';
    stavy = [];

    init: boolean = false;

    subscriptions: Subscription[] = [];

    constructor(
        public state: AppState,
        private service: AppService,
        private translate: TranslateService,
        private titleService: Title,
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router) {}

    ngOnInit() {

        this.processUrl();
        this.getConfig().subscribe(cfg => {
console.log(cfg);

            this.state.config = cfg;
            this.service.getSpecialDays();
            var userLang = navigator.language.split('-')[0]; // use navigator lang if available
            userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
            if (cfg.hasOwnProperty('defaultLang')) {
                userLang = cfg['defaultLang'];
            }
            this.service.changeLang(userLang);
            this.state.setConfig(cfg);
            return this.state.config;
        
        
        
});
        this.service.langSubject.subscribe(() => {
            this.translate.get('app.title').subscribe((newTitle: string) => {
                this.titleService.setTitle(newTitle);
            });
        });

        this.router.events.subscribe(val => {
            if (val instanceof NavigationEnd) {
                this.state.activePage = val.url;
                
//                if(this.state.activePage.indexOf('/calendar') > -1){
//                    this.state.calendarView = this.state.activePage.substring(this.state.activePage.lastIndexOf('/')+1);
//                }
      
      
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

        this.subscriptions.push(this.router.events.subscribe(val => {

            if (val instanceof NavigationEnd) {

            } else if (val instanceof NavigationStart) {

            }
        }));
    }

    getConfig() {
        return this.http.get("assets/config.json");
    }
  
  showToolbarAndFacets(){
      //state.activePage != '/' && state.activePage != '/home' && state.activePage != '/login' && state.activePage != '/add-record'
      return this.state.activePage.indexOf('/calendar') > -1 || this.state.activePage.indexOf('/result') > -1;
  }


}
