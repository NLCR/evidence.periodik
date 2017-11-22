
export class Titul {
  id: string;
  meta_nazev:string; //meta-název	text	Název skupiny bibliografických záznamů, které patří pod jedno periodikum - společný pro záznamy jednotlivých mutací, nemění se při změně názvu v čase. Pokud existuje jen jeden bib. záznam, přejímá se název z něj, případně se zkrátí a upraví tak, jak je obecně známý.
  prilohy: string[]; //mozne prilohy
}
