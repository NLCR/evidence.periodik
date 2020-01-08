import { Issue } from "./issue";
import { Exemplar } from "./exemplar";

export class CisloSvazku {
  id_issue: string;
  issue: Issue;
  exemplar: Exemplar;
  datum_vydani: Date;
  numExists: boolean;
  cislo: number;
  mutace: string = '';
  vydani: string = '';
  isPriloha: boolean;
  nazev_prilohy: string = '';
  pocet_stran: number;
  znak_oznaceni_vydani: string = '';
  destroyedPages: boolean;
  degradated: boolean;
  missingPages: boolean;
  erroneousPaging: boolean;
  erroneousDate: boolean;
  erroneousNumbering: boolean;
  wronglyBound: boolean;
  censored: boolean;
  odd: boolean;

  constructor(issue: Issue, carovy_kod: string, odd: boolean) {
    this.id_issue = issue.id;
    this.issue = issue;
    this.datum_vydani = issue.datum_vydani;
    this.cislo = issue.cislo;
    this.mutace = issue.mutace;
    this.vydani = issue.vydani;
    this.isPriloha = issue.isPriloha;
    this.nazev_prilohy = issue.nazev_prilohy;
    this.pocet_stran = issue.pocet_stran;
    this.znak_oznaceni_vydani = issue.znak_oznaceni_vydani;
    this.odd = odd;
    this.numExists = false;
    if (issue.exemplare) {
      issue.exemplare.forEach(ex => {
        if (ex.carovy_kod === carovy_kod) {
          this.exemplar = ex;
          this.numExists = true;
          if (ex.oznaceni) {

            this.znak_oznaceni_vydani = ex.oznaceni;
          }
          if (ex.stav) {
            this.destroyedPages = ex.stav.includes('PP');
            this.degradated = ex.stav.includes('Deg');
            this.missingPages = ex.stav.includes('ChS');
            this.erroneousPaging = ex.stav.includes('ChPag');
            this.erroneousDate = ex.stav.includes('ChDatum');
            this.erroneousNumbering = ex.stav.includes('ChCis');
            this.wronglyBound = ex.stav.includes('ChSv');
            this.censored = ex.stav.includes('Cz');
          }

        }
      });
    }

  }
}
