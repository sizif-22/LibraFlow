import { IFineStrategy } from './IFineStrategy';

export class PerDayFine implements IFineStrategy {
  calculate(overdueDays: number): number {
    return overdueDays > 0 ? overdueDays * 5 : 0;
  }
}
