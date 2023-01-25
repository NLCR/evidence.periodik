
export class Exemplar {
  id: string;
  id_issue: string;
  numExists: boolean;
  vydaniExists: boolean;
  // stav	kód	kódovaný údaj, významy: ok, poškozeno - čitelné, poškozeno - ztráta informace, chybí celé stránky, není vůbec (zničeno/ztráta)
  stav: string[] = [];
  stav_popis = ''; // stav - popis	text	podrobný popis poškození
  vlastnik = ''; // vlastnictví	text	sigla nebo název instituce (která nemá siglu)
  carovy_kod = ''; // čárový kód	text	čárák svazku, ve kterém je číslo
  signatura = ''; // signatura	text	signatura svazku ve kterém je číslo
  pages: { missing: string[], damaged: string[] } = { missing: [], damaged: [] }; // seznam chybejcich a poskozenych stranek

  // cely rozsah. Neindexovat
  pagesRange: { missing: { label: string, sel: boolean }[], damaged: { label: string, sel: boolean }[] } = { missing: [], damaged: [] };
  // github #46 k exempláři přidat pole "označení regionálního vydání" -
  // vkládání symbolů - př hvězdička, puntík - zobrazení v přehledové tabulce
  oznaceni: string;
  popis_oznaceni_vydani: string; // github #46

  poznamka = '';



  id_titul: string = "";
  meta_nazev: string = ""; //název na titulu

  nazev: string = ""; //název na titulní straně	text	Název tak jak je na konkrétním čísle novin
  podnazev: string = ""; //podnázev na titulní straně	text	Podnázev tak jak je na konkrétním čísle novin.
  vydani: string = ""; //vydání	text	název vydání tak jak je uveden na titulní straně
  mutace: string = ""; //mutace	text	název mutace
  datum_vydani: Date; //datum vydání	datum
  datum_vydani_den: string = ""; //datum vydání ve formatu yyyyMMdd
  periodicita: string = "";
  cas_vydani: number = 0; //čas vydání	čas	generuje se (hlavně důležité v případě více vydání téže mutace v jednom dni) na základě názvu vydání. Bude existovat tabulka, která každému názvu vydání přiřadí čas kvůli řazení
  pocet_stran: number = 0; //počet stran	celé číslo	předpokládám, že vždy sudé. 0 může znamenat že nevyšlo, -1 že není znám počet stran

  rocnik: string = ""; //ročník	text	jak je uveden na exempláři
  rocnik_number: number;
  cislo: number = 0; //číslo	číslo	pořadové číslo uvedené na čísle
  druhe_cislo: number = 0; //druhé číslo	číslo	další paralelní číslování, kdyby bylo třeba

  typ: string = ""; //typ	kód	tištěné/fotokopie/mikrofilm/digitální
  znak_oznaceni_vydani: string = ""; //github #47 "Způsob označení mutace": znaky  * nebo • nebo +/.

  state: string = "auto"; // Slouzi pro oznaceni aktualinho stavu v ramci aplikace. Tj, automaticke generovane, podtverzeno

  // Properties pro zobrazeni v tabulce svazku
  complete: boolean;
  // chybiCislo: boolean;
  destroyedPages: boolean;
  degradated: boolean;
  missingPages: boolean;
  erroneousPaging: boolean;
  erroneousDate: boolean;
  erroneousNumbering: boolean;
  wronglyBound: boolean;
  necitelneSvazano: boolean;
  censored: boolean;
  odd: boolean;
  isPriloha: boolean

}

export type ExemplarStates =
  "complete" |
  "destroyedPages" |
  "degradated" |
  "missingPages" |
  "erroneousPaging" |
  "erroneousDate" |
  "erroneousNumbering" |
  "wronglyBound" |
  "necitelneSvazano" |
  "censored" | ""
