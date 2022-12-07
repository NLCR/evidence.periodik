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

  private searchQuery = null
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
    this.searchQuery = this.route.snapshot.queryParamMap
    this.state.parseSearchQuery(this.searchQuery)

    if (!this.idTitul) return this.router.navigate(['/home'])

    this.loadTitulInfo()

    this.searchChangedSub = this.state.searchParamsChanged.subscribe(() => {
      this.updateSearchQuery().then(() => {
        this.loadTitulInfo()
        this.exemplarsLookup$.next()
      })
    })

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
      // this.state.loadingData = false
    })
    this.exemplarsLookup$.next()

  }

  ngOnDestroy() {
    this.state.loadingData = false
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

  updateSearchQuery(){
    const queryMap = new Map()

    const searchParams = {
      filters: this.state.filters,
      currentPage: this.state.currentPage,
      filterByDate: {
        enabled: this.state.filterByDate,
        from: this.state.start_year,
        until: this.state.end_year
      },
      filterByVolume: {
        enabled: this.state.filterByVolume,
        id: this.state.volume_id_for_search
      },
      search: this.state.q
    }

    searchParams.filters.forEach((f, i) => {
      queryMap.set(`${f.field}-${i}`, f.value)
    })

    if(searchParams.currentPage > 0) queryMap.set("currentPage", searchParams.currentPage)
    if(searchParams.filterByDate.enabled){
      queryMap.set("start_year", searchParams.filterByDate.from)
      queryMap.set("end_year", searchParams.filterByDate.until)
    }
    if(searchParams.filterByVolume.enabled){
      queryMap.set("volume_id_for_search", searchParams.filterByVolume.id)
    }
    if(searchParams.search?.length > 0) queryMap.set("q", searchParams.search)

    return this.router.navigate(['.'], { relativeTo: this.route, replaceUrl: true, queryParams: Object.fromEntries(queryMap.entries())})
  }

}
