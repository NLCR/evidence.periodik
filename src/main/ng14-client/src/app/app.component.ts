import { Component, OnInit, OnDestroy } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AppService } from './app.service';
import { AppState } from './app.state';
import { AppConfiguration } from 'src/app/app-configuration';
import { AuthenticationService } from './shared/authentication.service';

import packageJson from '../../package.json';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public VERSION: string = packageJson.version;

  title = 'Evidence periodik';
  stavy = [];

  subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthenticationService,
    public state: AppState,
    private service: AppService,
    private config: AppConfiguration,
    private translate: TranslateService,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {

    console.info('App version:', this.VERSION);

    this.processUrl();
    this.authService.currentUser.subscribe(x => {
      const hasUser = x !== null;
      if (hasUser) {
        const expiredTime = this.config.expiredTime * 1000 * 60;
        if ((new Date().getTime() - x.date.getTime()) > expiredTime) {
          console.log('EXPIRED');
          this.state.logged = false;
          this.authService.logout();
        } else {
          this.authService.renewDate();
          this.state.logged = true;
          this.state.user = x;
          this.state.isAdmin = this.state.user.role === 'admin';
        }
      }

    });
    this.state.activePage = this.route.snapshot.url.toString();
    this.service.getSpecialDays();

    this.state.setConfig(this.config);
    this.service.getTituly().subscribe();

    this.service.langSubject.subscribe(() => {
      this.translate.get('app.title').subscribe((newTitle: string) => {
        this.titleService.setTitle(newTitle);
      });
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

        this.state.activePage = val.url;
      } else if (val instanceof NavigationStart) {

      }
    }));
  }

  showToolbarAndFacets() {
    // state.activePage != '/' && state.activePage != '/home' && state.activePage != '/login' && state.activePage != '/add-record'
    return this.state.activePage.indexOf('/calendar') > -1 || this.state.activePage.indexOf('/result') > -1;
  }


}
