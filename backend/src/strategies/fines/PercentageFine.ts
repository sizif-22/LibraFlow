import type { IFineStrategy } from './IFineStrategy';

export class PercentageFine implements IFineStrategy {
  calculate(overdueDays: number, bookPrice: number = 0): number {
    return overdueDays > 0 ? (bookPrice * 0.05) * overdueDays : 0;
  }
}
