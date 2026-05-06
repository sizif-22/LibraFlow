import type { IFineStrategy } from './IFineStrategy';

export class FineCalculator {
  constructor(private strategy: IFineStrategy) {}

  setStrategy(strategy: IFineStrategy) {
    this.strategy = strategy;
  }

  calculate(overdueDays: number, bookPrice?: number): number {
    return this.strategy.calculate(overdueDays, bookPrice);
  }
}
