import type { IFineStrategy } from './IFineStrategy';

export class FixedFine implements IFineStrategy {
  calculate(overdueDays: number): number {
    return overdueDays >= 7 ? 50 : 0;
  }
}
