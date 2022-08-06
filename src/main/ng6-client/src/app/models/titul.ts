
export class Titul {
  id: string;
  meta_nazev:string; //meta-název	text	Název skupiny bibliografických záznamů, které patří pod jedno periodikum - společný pro záznamy jednotlivých mutací, nemění se při změně názvu v čase. Pokud existuje jen jeden bib. záznam, přejímá se název z něj, případně se zkrátí a upraví tak, jak je obecně známý.
  prilohy: string[]; //mozne prilohy

  periodicita: string = ""; //default periodicita
  // pocet_stran: number = 0; //default počet stran Odstraneno podle #138
  // uuid: string = ""; //uuid titulu	text	pokud je to z Krameria
  poznamka: string = ""; //uuid titulu	text	pokud je to z Krameria
  allow_not_logged_users: boolean;
}
