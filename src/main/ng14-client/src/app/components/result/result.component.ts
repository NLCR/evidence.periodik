import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../app.service';
import { AppState } from '../../app.state';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject, switchMap, takeUntil } from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  private exemplarsRequests = []
  private idTitul = null
  private exemplarsLookup$: Subject<void> = new Subject();
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private searchChangedSub
  private titulSub

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: AppService,
    public state: AppState) { }

  ngOnInit() {
    this.state.searchResults = null
    this.idTitul = this.route.snapshot.paramMap.get('id')
    if (!this.idTitul) return this.router.navigate(['/home'])

    this.loadTitulInfo()

    this.searchChangedSub = this.state.searchParamsChanged.subscribe(() => {
      this.loadTitulInfo()
      this.exemplarsLookup$.next()
    });

    this.exemplarsLookup$
      .pipe(
        map(() => this.exemplarsRequests = []),
        switchMap(() => {
          this.state.loadingData = true
          this.exemplarsRequests.push(this.idTitul);
          return this.service.searchIssuesOfTitul(this.idTitul)
        }),
        takeUntil(this.destroyed$)
      ).subscribe(res => {
      this.state.setSearchResults(res);
      this.exemplarsRequests.shift()
      this.state.loadingData = false
    })
    this.exemplarsLookup$.next()

  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    if(this.searchChangedSub) this.searchChangedSub.unsubscribe()
    if(this.titulSub) this.titulSub.unsubscribe()
  }

  loadTitulInfo(){
    this.titulSub = this.service.getTitul(this.idTitul).subscribe(t => {
      this.state.currentTitul = t
    });
  }

}
