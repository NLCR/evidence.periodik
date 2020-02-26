import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppState } from 'src/app/app.state';
import { AppService } from 'src/app/app.service';
import { Titul } from 'src/app/models/titul';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfiguration } from 'src/app/app-configuration';

@Component({
  selector: 'app-metatitul',
  templateUrl: './metatitul.component.html',
  styleUrls: ['./metatitul.component.scss']
})
export class MetatitulComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  titul: Titul = null;
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private service: AppService,
    public state: AppState,
    public config: AppConfiguration) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.getTituly().subscribe(resp => {
      if (!this.titul) {
        const id = this.route.snapshot.paramMap.get('id');
        let idx = 0;
        if (id) {
          idx = this.state.tituly.findIndex(t => t.id === id);
        }
        if (idx > -1) {
          this.loadTitul(this.state.tituly[idx]);
        }
      }

    });
  }

  loadTitul(t: Titul) {
    this.titul = t;
  }

  save() {
    this.loading = true;
    this.service.saveTitul(this.titul).subscribe(res => {
      console.log(res);
      this.loading = false;
      if (res.error) {
        this.service.showSnackBar('save_titul_error', res.error, true);
      } else {
        this.service.showSnackBar('Titul správně uložen');
        this.load();
      }
    });
  }

  newTitul() {
    this.titul = new Titul();
  }

  cancel() {

  }


}
