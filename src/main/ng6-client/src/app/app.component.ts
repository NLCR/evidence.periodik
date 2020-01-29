import { Component, OnInit, OnDestroy } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AppService } from './app.service';
import { AppState } from './app.state';
import { HttpClient } from '@angular/common/http';
import { AppConfiguration } from 'src/app/app-configuration';
import { AuthenticationService } from './shared/authentication.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Evidence periodik';
  stavy = [];

  init: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthenticationService,
    public state: AppState,
    private service: AppService,
    private config: AppConfiguration,
    private translate: TranslateService,
    private titleService: Title,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {

    this.processUrl();
    this.authService.currentUser.subscribe(x => {
      const isLogged = x !== null;
      this.state.user = x;
      this.state.isAdmin = isLogged && this.state.user.role === 'admin';
    });
    this.state.activePage = this.route.snapshot.url.toString();
    console.log(this.route.snapshot, this.state.activePage);
    this.service.getSpecialDays();
    let userLang = navigator.language.split('-')[0]; // use navigator lang if available
    userLang = /(cs|en)/gi.test(userLang) ? userLang : 'cs';
    if (this.config.defaultLang) {
      userLang = this.config.defaultLang;
    }
    this.service.changeLang(userLang);

    this.state.setConfig(this.config);
    this.service.getTituly().subscribe();

    this.service.langSubject.subscribe(() => {
      this.translate.get('app.title').subscribe((newTitle: string) => {
        this.titleService.setTitle(newTitle);
      });
    });

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.state.activePage = val.url;
        console.log(this.route.snapshot, this.state.activePage);
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

  showToolbarAndFacets() {
    //state.activePage != '/' && state.activePage != '/home' && state.activePage != '/login' && state.activePage != '/add-record'
    return this.state.activePage.indexOf('/calendar') > -1 || this.state.activePage.indexOf('/result') > -1;
  }


}
