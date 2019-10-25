import {Titul} from 'src/app/models/titul';
import { PeriodicitaSvazku } from 'src/app/models/periodicita-svazku';
import { WeekDay } from '@angular/common';

export class Volume {
  id: string;
  id_titul: string;
  titul: Titul;
  mutace: string;
  znak_oznaceni_vydani: string;
  carovy_kod: string;
  signatura: string;
  vlastnik: string;
  periodicita: PeriodicitaSvazku[];
  prvni_cislo: number;
  posledni_cislo: number;
  poznamka: string;
  datum_od: Date = new Date();
  datum_do: Date = new Date();

  constructor() {
    this.periodicita = [];
      const wds: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      wds.forEach(wd => {
        const ps = new PeriodicitaSvazku();
        ps.den = wd;
        this.periodicita.push(ps);
      });
  }
}
