import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../app.service';
import { AppState } from '../../app.state';
// import {ReplaySubject, Subject, Subscription, switchMap, takeUntil} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {ReplaySubject, Subject, switchMap, takeUntil} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {

  // subscriptions: Subscription[] = [];
  exemplarsRequests = []
  private exemplarsLookup$: Subject<void> = new Subject();
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  // public exemplarsLookup
  public searchChangedSub
  public issuesOfTitulSub
  public titulSub

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: AppService,
    public state: AppState) { }

  ngOnInit() {
    this.state.searchResults = null
    // this.loadResultItems();
    // this.searchChangedSub = this.state.searchParamsChanged.subscribe(() => {
    //   this.loadResultItems();
    // });

    this.searchChangedSub = this.state.searchParamsChanged.subscribe(() => {
      this.exemplarsLookup$.next()
    });

    this.exemplarsLookup$
      .pipe(
        map(() => this.exemplarsRequests = []),
        switchMap(() => {
          this.state.loadingData = true
          const idTitul = this.route.snapshot.paramMap.get('id')
          if (!idTitul) {
            this.router.navigate(['/home']);
          }
          this.exemplarsRequests.push(idTitul);
          return this.service.searchIssuesOfTitul(idTitul)
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
    // this.exemplarsLookup.unsubscribe()
    this.destroyed$.next(true);
    this.destroyed$.complete();
    // this.subscriptions.forEach(s => {
    //   s.unsubscribe();
    // });
    // this.subscriptions = [];
    this.searchChangedSub.unsubscribe()
    // this.issuesOfTitulSub.unsubscribe()
    // this.titulSub.unsubscribe()
  }

  loadResultItems() {
    this.state.loadingData = true
    const idTitul = this.route.snapshot.paramMap.get('id');
    if (!idTitul) {
      this.router.navigate(['/home']);
    }

    // this.exemplarsLookup$
    //   .pipe(
    //     switchMap(() => { return this.service.searchIssuesOfTitul(idTitul) }),
    //     takeUntil(this.destroyed$)
    //   ).subscribe(res => {
    //   this.state.setSearchResults(res);
    //   this.state.loadingData = false
    // })
    //
    // this.exemplarsLookup$.next()

    // this.service.searchIssuesOfTitul(idTitul).pipe(takeUntil(this.destroyed$)).subscribe(res => {
    //   this.state.setSearchResults(res);
    //   this.state.loadingData = false
    // });


    // this.issuesOfTitulSub = this.service.searchIssuesOfTitul(idTitul).subscribe(res => {
    //   this.state.setSearchResults(res);
    //   this.state.loadingData = false
    // });
    // this.titulSub = this.service.getTitul(idTitul).subscribe(t => {
    //   this.state.currentTitul = t;
    // });
    // console.log(this.subscriptions)
  }

}
