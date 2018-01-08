

export class CloneParams {
  id: string;
    start_date: Date = new Date();
    end_date: Date = new Date();
    
    start_number: number;
    start_year: number;
    
    periodicity: string = "P1D";
    onSpecialDays: boolean = false;
}