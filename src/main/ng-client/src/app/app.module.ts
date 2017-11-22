import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { HttpClientModule, HttpClient} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { MaterializeModule } from 'ng2-materialize';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CalendarModule } from "ap-angular2-fullcalendar";

import { AppState } from './app.state';
import { AppService } from './app.service';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { KalendarComponent } from './components/kalendar/kalendar.component';
import { KalendarDayComponent } from './components/kalendar/kalendar-day/kalendar-day.component';
import { KalendarFullComponent } from './components/kalendar-full/kalendar-full.component';
import { IssueComponent } from './components/issue/issue.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    KalendarComponent,
    KalendarDayComponent,
    KalendarFullComponent,
    IssueComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MaterializeModule.forRoot(),
    BrowserAnimationsModule,
    CalendarModule,
    
    RouterModule.forRoot([
      { path: 'issue', component: IssueComponent },
      { path: 'issue/:id', component: IssueComponent },
      { path: 'kalendar', component: KalendarComponent },
      { path: '', redirectTo: 'kalendar', pathMatch: 'full' }
    ])
  ],
  providers: [HttpClient, DatePipe, AppState, AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
