import { Titul } from './titul';
import {Exemplar} from './exemplar';


export class Issue {
  id = '';
  id_titul = '';
  meta_nazev = ''; // název na titulu
  titul: Titul = new Titul();
  nazev = ''; // název na titulní straně	text	Název tak jak je na konkrétním čísle novin
  podnazev = ''; // podnázev na titulní straně	text	Podnázev tak jak je na konkrétním čísle novin.
  vydani = ''; // vydání	text	název vydání tak jak je uveden na titulní straně
  mutace = ''; // mutace	text	název mutace
  datum_vydani: Date; // datum vydání	datum
  datum_vydani_den = ''; // datum vydání ve formatu yyyyMMdd
  periodicita = '';
  cas_vydani = 0; // čas vydání	čas	generuje se (hlavně důležité v případě více vydání téže mutace v jednom dni) na základě názvu vydání. Bude existovat tabulka, která každému názvu vydání přiřadí čas kvůli řazení
  pocet_stran = 0; // počet stran	celé číslo	předpokládám, že vždy sudé. 0 může znamenat že nevyšlo, -1 že není znám počet stran
  pages: {index: number, label: string}[] = []; // detailne popsane stranky
  rocnik = ''; // ročník	text	jak je uveden na exempláři
  rocnik_number: number;
  cislo = 0; // číslo	číslo	pořadové číslo uvedené na čísle
  druhe_cislo = 0; // druhé číslo	číslo	další paralelní číslování, kdyby bylo třeba
  id_bib_zaznamu = ''; // id bib záznamu	id
  url_bib_zaznamu = ''; // url bib záznamu	prolink na bib. záznam (id, URL)
  uuid_cisla = ''; // uuid čísla	text	pokud je to z Krameria
  uuid_titulu = ''; // uuid titulu	text	pokud je to z Krameria
  url_krameria = ''; // URL krameria	text	pokud je to z Krameria
  typ = ''; // typ	kód	tištěné/fotokopie/mikrofilm/digitální

  exemplare: Exemplar[] = [];
  /* toto vsechno bude pod exemplar
  stav: StavIssue = StavIssue.OK;
  //stav	kód	kódovaný údaj, významy: ok, poškozeno - čitelné, poškozeno - ztráta informace, chybí celé stránky, není vůbec (zničeno/ztráta)
  stav_popis: string = ''; //stav - popis	text	podrobný popis poškození
  vlastnictvi: string = ''; //vlastnictví	text	sigla nebo název instituce (která nemá siglu)
  carovy_kod: string = ''; //čárový kód	text	čárák svazku, ve kterém je číslo
  signatura: string = ''; //signatura	text	signatura svazku ve kterém je číslo
  */

  znak_oznaceni_vydani = ''; // github #47 "Způsob označení mutace": znaky  * nebo • nebo +/.

  state = 'auto'; // Slouzi pro oznaceni aktualinho stavu v ramci aplikace. Tj, automaticke generovane, podtverzeno

  fromJSON(json: any){
    const array = Object.getOwnPropertyNames(this);
    array.forEach(i => {
      if (json.hasOwnProperty(i)){
        this[i] = json[i];
      }
    });
    if (json.datum_vydani) {
      this.datum_vydani = new Date(json.datum_vydani);
    }
    return this;
  }
}
