import { describe, it, expect } from 'bun:test'
import { BookBorrow } from '../factories/borrow/BookBorrow'
import { MagazineBorrow } from '../factories/borrow/MagazineBorrow'
import { ThesisBorrow } from '../factories/borrow/ThesisBorrow'
import { BorrowFactory } from '../factories/borrow/BorrowFactory'
import { BorrowType } from '../types/borrow'

describe('Borrow Types', () => {
    describe('BookBorrow', () => {
        const borrow = new BookBorrow()

        it('has 14-day due period', () => {
            expect(borrow.getDueDays()).toBe(14)
        })

        it('is renewable', () => {
            expect(borrow.isRenewable()).toBe(true)
        })

        it('provides meaningful description', () => {
            const desc = borrow.getDescription()
            expect(desc).toContain('14 days')
            expect(desc).toContain('renewable')
        })

        it('calculates due date as 14 days from given date', () => {
            const from = new Date('2026-01-01T00:00:00Z')
            const due = borrow.calculateDueDate(from)
            expect(due.getUTCDate()).toBe(15)
        })

        it('calculates due date from current date by default', () => {
            const before = new Date()
            before.setDate(before.getDate() + 14)
            const due = borrow.calculateDueDate()
            const diff = Math.abs(due.getTime() - before.getTime())
            expect(diff).toBeLessThan(1000)
        })
    })

    describe('MagazineBorrow', () => {
        const borrow = new MagazineBorrow()

        it('has 7-day due period', () => {
            expect(borrow.getDueDays()).toBe(7)
        })

        it('is not renewable', () => {
            expect(borrow.isRenewable()).toBe(false)
        })

        it('provides meaningful description', () => {
            const desc = borrow.getDescription()
            expect(desc).toContain('7 days')
            expect(desc).toContain('not renewable')
        })

        it('calculates due date as 7 days from given date', () => {
            const from = new Date('2026-06-15T00:00:00Z')
            const due = borrow.calculateDueDate(from)
            expect(due.getUTCDate()).toBe(22)
        })
    })

    describe('ThesisBorrow', () => {
        const borrow = new ThesisBorrow()

        it('has 3-day due period', () => {
            expect(borrow.getDueDays()).toBe(3)
        })

        it('is not renewable', () => {
            expect(borrow.isRenewable()).toBe(false)
        })

        it('provides meaningful description', () => {
            const desc = borrow.getDescription()
            expect(desc).toContain('3 days')
            expect(desc).toContain('in-library use only')
        })

        it('calculates due date as 3 days from given date', () => {
            const from = new Date('2026-12-31T00:00:00Z')
            const due = borrow.calculateDueDate(from)
            expect(due.getUTCDate()).toBe(3)
            expect(due.getUTCMonth()).toBe(0)
            expect(due.getUTCFullYear()).toBe(2027)
        })
    })

    describe('BorrowFactory', () => {
        it('creates BookBorrow for BOOK type', () => {
            const b = BorrowFactory.create(BorrowType.BOOK)
            expect(b).toBeInstanceOf(BookBorrow)
            expect(b.getDueDays()).toBe(14)
            expect(b.isRenewable()).toBe(true)
        })

        it('creates MagazineBorrow for MAGAZINE type', () => {
            const b = BorrowFactory.create(BorrowType.MAGAZINE)
            expect(b).toBeInstanceOf(MagazineBorrow)
            expect(b.getDueDays()).toBe(7)
            expect(b.isRenewable()).toBe(false)
        })

        it('creates ThesisBorrow for THESIS type', () => {
            const b = BorrowFactory.create(BorrowType.THESIS)
            expect(b).toBeInstanceOf(ThesisBorrow)
            expect(b.getDueDays()).toBe(3)
            expect(b.isRenewable()).toBe(false)
        })

        it('throws error for unknown borrow type', () => {
            expect(() => BorrowFactory.create('UNKNOWN' as BorrowType)).toThrow('Unknown borrow type')
        })
    })
})
