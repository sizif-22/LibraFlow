import { describe, it, expect } from 'bun:test'
import { PerDayFine } from '../strategies/fines/PerDayFine'
import { FixedFine } from '../strategies/fines/FixedFine'
import { PercentageFine } from '../strategies/fines/PercentageFine'
import { FineCalculator } from '../strategies/fines/FineCalculator'

describe('Fine Strategies', () => {
    describe('PerDayFine', () => {
        const strategy = new PerDayFine()

        it('returns 0 for 0 overdue days', () => {
            expect(strategy.calculate(0)).toBe(0)
        })

        it('returns 0 for negative overdue days', () => {
            expect(strategy.calculate(-1)).toBe(0)
        })

        it('returns 5 EGP per overdue day', () => {
            expect(strategy.calculate(1)).toBe(5)
            expect(strategy.calculate(3)).toBe(15)
            expect(strategy.calculate(10)).toBe(50)
            expect(strategy.calculate(30)).toBe(150)
        })

        it('ignores bookPrice parameter', () => {
            expect(strategy.calculate(2, 999)).toBe(10)
        })
    })

    describe('FixedFine', () => {
        const strategy = new FixedFine()

        it('returns 0 for 0 overdue days', () => {
            expect(strategy.calculate(0)).toBe(0)
        })

        it('returns 0 for fewer than 7 overdue days', () => {
            expect(strategy.calculate(1)).toBe(0)
            expect(strategy.calculate(6)).toBe(0)
        })

        it('returns 50 for exactly 7 overdue days', () => {
            expect(strategy.calculate(7)).toBe(50)
        })

        it('returns 50 for more than 7 overdue days', () => {
            expect(strategy.calculate(14)).toBe(50)
            expect(strategy.calculate(100)).toBe(50)
        })

        it('ignores bookPrice parameter', () => {
            expect(strategy.calculate(7, 999)).toBe(50)
        })
    })

    describe('PercentageFine', () => {
        const strategy = new PercentageFine()

        it('returns 0 for 0 overdue days', () => {
            expect(strategy.calculate(0, 100)).toBe(0)
        })

        it('returns 0 for negative overdue days', () => {
            expect(strategy.calculate(-1, 100)).toBe(0)
        })

        it('calculates 5% of book price per overdue day', () => {
            expect(strategy.calculate(1, 100)).toBe(5)
            expect(strategy.calculate(3, 100)).toBe(15)
            expect(strategy.calculate(2, 200)).toBe(20)
        })

        it('defaults bookPrice to 0 when not provided', () => {
            expect(strategy.calculate(5)).toBe(0)
            expect(strategy.calculate(10)).toBe(0)
        })

        it('returns whole numbers', () => {
            expect(strategy.calculate(1, 150)).toBe(7.5)
            expect(strategy.calculate(2, 150)).toBe(15)
        })
    })

    describe('FineCalculator (Strategy Pattern)', () => {
        it('delegates to PerDayFine strategy', () => {
            const calculator = new FineCalculator(new PerDayFine())
            expect(calculator.calculate(3)).toBe(15)
        })

        it('delegates to FixedFine strategy', () => {
            const calculator = new FineCalculator(new FixedFine())
            expect(calculator.calculate(7)).toBe(50)
        })

        it('delegates to PercentageFine strategy', () => {
            const calculator = new FineCalculator(new PercentageFine())
            expect(calculator.calculate(2, 100)).toBe(10)
        })

        it('supports switching strategies at runtime', () => {
            const calculator = new FineCalculator(new PerDayFine())
            expect(calculator.calculate(7)).toBe(35)

            calculator.setStrategy(new FixedFine())
            expect(calculator.calculate(7)).toBe(50)

            calculator.setStrategy(new PercentageFine())
            expect(calculator.calculate(7, 100)).toBe(35)
        })
    })
})
