import {Titul} from 'src/app/models/titul';
import { PeriodicitaSvazku } from 'src/app/models/periodicita-svazku';
// import { WeekDay } from '@angular/common';
// import { Issue } from './issue';

export type BaseInfo = "id_titul" | "titul.meta_nazev" | "znak_oznaceni_vydani" | "carovy_kod" | "signatura" | "vlastnik" | "mutace"

export class Volume {
  id: string = '';
  id_titul: string = '';
  titul: Titul;
  mutace: string = '';
  znak_oznaceni_vydani: string = '';
  carovy_kod: string = '';
  signatura: string = '';
  vlastnik: string = '';
  periodicita: PeriodicitaSvazku[];
  prvni_cislo: number = 0;
  posledni_cislo: number = 0;
  poznamka: string = '';
  datum_od: string;
  datum_do: string;
  show_attachments_at_the_end: boolean = false

  constructor(datum_od: string, datum_do: string) {
    this.datum_od = datum_od;
    this.datum_do = datum_do;
    this.periodicita = [];
      const wds: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      wds.forEach(wd => {
        const ps = new PeriodicitaSvazku();
        ps.den = wd;
        this.periodicita.push(ps);
      });
  }

}
