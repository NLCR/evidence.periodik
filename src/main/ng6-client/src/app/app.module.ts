import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { DatePipe } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { FlexLayoutModule } from '@angular/flex-layout';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatBadgeModule,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  NativeDateModule,
  DateAdapter,
  NativeDateAdapter,
  MAT_NATIVE_DATE_FORMATS
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

import { AppState } from './app.state';
import { AppService } from './app.service';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CalendarComponent } from './components/calendar/calendar.component';

import { IssueComponent } from './components/issue/issue.component';
import { FacetComponent } from './components/facet/facet.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { HomeComponent } from './components/home/home.component';
import { ResultComponent } from './components/result/result.component';
import { ResultItemComponent } from './components/result/result-item/result-item.component';
import { CalendarMonthComponent } from './components/calendar/calendar-month/calendar-month.component';
import { CalendarYearComponent } from './components/calendar/calendar-year/calendar-year.component';
import { CalendarListComponent } from './components/calendar/calendar-list/calendar-list.component';
import { CalendarMonthDayComponent } from './components/calendar/calendar-month/calendar-month-day/calendar-month-day.component';
import { LoginComponent } from './components/login/login.component';
import { FacetUsedComponent } from './components/facet/facet-used/facet-used.component';
import { ToolbarPaginationResultComponent } from './components/toolbar/toolbar-pagination-result/toolbar-pagination-result.component';
import { ToolbarPaginationCalendarComponent } from './components/toolbar/toolbar-pagination-calendar/toolbar-pagination-calendar.component';
import { ToolbarNavViewsComponent } from './components/toolbar/toolbar-nav-views/toolbar-nav-views.component';
import { ToolbarCountComponent } from './components/toolbar/toolbar-count/toolbar-count.component';
import { CalendarListItemComponent } from './components/calendar/calendar-list/calendar-list-item/calendar-list-item.component';
import { CloneDialogComponent } from './components/clone-dialog/clone-dialog.component';
import { ResultTableComponent } from './components/result-table/result-table.component';
import { AddExemplarDialogComponent } from './components/add-exemplar-dialog/add-exemplar-dialog.component';
import { AddTitulDialogComponent } from './components/add-titul-dialog/add-titul-dialog.component';
import { AddVdkExComponent } from './components/add-vdk-ex/add-vdk-ex.component';
import { AddVydaniDialogComponent } from './components/add-vydani-dialog/add-vydani-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { AuthGuard } from './auth-guard';
import { EditPagesComponent } from './components/edit-pages/edit-pages.component';
import { SvazekComponent } from './components/svazek/svazek.component';
import { MetatitulComponent } from './components/metatitul/metatitul.component';
import { BasicAuthInterceptor } from './shared/basic-auth.interceptor';
import { AppConfiguration } from './app-configuration';
import { AdminComponent } from './components/admin/admin.component';
import { PasswordDialogComponent } from './components/password-dialog/password-dialog.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AppRoutingModule } from './app-routing.module';
import { Platform } from '@angular/cdk/platform';
import { SvazekOverviewComponent } from './components/svazek-overview/svazek-overview.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';


import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';


registerLocaleData(localeCs, 'cs');

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const providers: any[] = [
  { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
  { provide: MAT_DATE_LOCALE, useValue: 'cs-CZ' },
  {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
  {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: APP_INITIALIZER, useFactory: (config: AppConfiguration) => () => config.load(), deps: [AppConfiguration], multi: true },
  HttpClient, DatePipe, AppConfiguration, AppState, AppService, AuthGuard];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CalendarComponent,
    //KalendarFullComponent,
    IssueComponent,
    FacetComponent,
    ToolbarComponent,
    SearchBarComponent,
    HomeComponent,
    ResultComponent,
    ResultItemComponent,
    CalendarMonthComponent,
    CalendarYearComponent,
    CalendarListComponent,
    CalendarMonthDayComponent,
    LoginComponent,
    FacetUsedComponent,
    ToolbarPaginationResultComponent,
    ToolbarPaginationCalendarComponent,
    ToolbarNavViewsComponent,
    ToolbarCountComponent,
    CalendarListItemComponent,
    CloneDialogComponent,
    ResultTableComponent,
    AddExemplarDialogComponent,
    AddTitulDialogComponent,
    AddVdkExComponent,
    AddVydaniDialogComponent,
    ConfirmDialogComponent,
    EditPagesComponent,
    SvazekComponent,
    MetatitulComponent,
    AdminComponent,
    PasswordDialogComponent,
    ProfileComponent,
    PromptDialogComponent,
    SvazekOverviewComponent
  ],
  entryComponents: [ConfirmDialogComponent,
    CloneDialogComponent,
    AddExemplarDialogComponent,
    AddTitulDialogComponent,
    AddVdkExComponent,
    AddVydaniDialogComponent,
    EditPagesComponent, SvazekOverviewComponent,
    PasswordDialogComponent,
    PromptDialogComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSidenavModule,
    FlexLayoutModule,
    CdkTableModule,
    AppRoutingModule
  ],
  providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
