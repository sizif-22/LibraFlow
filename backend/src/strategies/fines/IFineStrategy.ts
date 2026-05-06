export interface IFineStrategy {
  calculate(overdueDays: number, bookPrice?: number): number;
}
