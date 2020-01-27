import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { Titul } from 'src/app/models/titul';
import { MzToastService } from 'ngx-materialize';
import { load } from '@angular/core/src/render3/instructions';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-metatitul',
  templateUrl: './metatitul.component.html',
  styleUrls: ['./metatitul.component.scss']
})
export class MetatitulComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  titul: Titul = new Titul();
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private toastService: MzToastService,
    private service: AppService,
    public state: AppState) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
      if (this.state.config) {
        this.load();
      } else {
        this.subscriptions.push(this.state.configSubject.subscribe((state) => {
          this.load();
        }));
      }
    
  }

  load() {
    this.service.getTituly().subscribe(resp => {
      console.log(this.state.tituly);
      this.loadTitul(this.state.tituly[0])
    });
  }

  loadTitul(t: Titul) {
    this.titul = t;
  }

  ok() {
    this.service.saveTitul(this.titul).subscribe(res => {
      console.log(res);

      if (res['error']) {
        this.toastService.show(res['error'], 4000, 'red');
      } else {
        this.service.getTituly().subscribe();
      }
    });
  }

  cancel() {

  }


}
