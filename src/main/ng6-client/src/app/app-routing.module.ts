import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { MetatitulComponent } from './components/metatitul/metatitul.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProfileComponent } from './components/profile/profile.component';
import { IssueComponent } from './components/issue/issue.component';
import { HomeComponent } from './components/home/home.component';
import { SvazekComponent } from './components/svazek/svazek.component';
import { ResultComponent } from './components/result/result.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { CalendarMonthComponent } from './components/calendar/calendar-month/calendar-month.component';
import { CalendarYearComponent } from './components/calendar/calendar-year/calendar-year.component';
// import { CalendarListComponent } from './components/calendar/calendar-list/calendar-list.component';
import { LoginComponent } from './components/login/login.component';


const routes: Routes = [
  { path: 'titul', component: MetatitulComponent, canActivate: [AuthGuard] },
  { path: 'titul/:id', component: MetatitulComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  /**
   * #169 - remove add_record with functionality
   * { path: 'issue', component: IssueComponent, canActivate: [AuthGuard] },
   */
  { path: 'issue/:id', component: IssueComponent },
  { path: 'home', component: HomeComponent },
  { path: 'svazek', component: SvazekComponent },
  { path: 'svazek/:id', component: SvazekComponent },
  { path: 'result/:id', component: ResultComponent },
  {
    path: 'calendar/:id', component: CalendarComponent,
    children: [
      { path: '', redirectTo: 'month', pathMatch: 'full' },
      { path: 'month/:day', component: CalendarMonthComponent },
      { path: 'month', component: CalendarMonthComponent },
      { path: 'year', component: CalendarYearComponent },
      { path: 'year/:day', component: CalendarYearComponent },
      /**
       * #123 - remove list component
       * { path: 'list', component: CalendarListComponent },
       * { path: 'list/:day', component: CalendarListComponent }
       */
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
