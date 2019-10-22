import {Titul} from "src/app/models/titul";

export class Volume {
  id: string;
  id_titul: string;
  titul: Titul;
  mutace: string;
  znak_oznaceni_vydani: string;
  carovy_kod: string;
  signatura: string;
  vlastnik: string;
  periodicita: {};
  prvni_cislo: number;
  posledni_cislo: number;
  poznamka: string;
  datum_od: Date = new Date();
  datum_do: Date = new Date();
}
