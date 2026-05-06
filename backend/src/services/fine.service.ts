import { FineRepository } from '../repositories/FineRepository';
import { BorrowRepository } from '../repositories/BorrowRepository';
import { FineCalculator } from '../strategies/fines/FineCalculator';
import { PerDayFine } from '../strategies/fines/PerDayFine';
import { FixedFine } from '../strategies/fines/FixedFine';
import { PercentageFine } from '../strategies/fines/PercentageFine';

export class FineService {
    static async calculateFineOnReturn(borrowId: number, strategyType: 'PER_DAY' | 'FIXED' | 'PERCENTAGE' = 'PER_DAY') {
        const borrow = await BorrowRepository.findById(borrowId);
        if (!borrow || !borrow.dueDate || !borrow.returnDate) {
            throw new Error("Invalid borrow record for fine calculation");
        }

        const due = new Date(borrow.dueDate).getTime();
        const returned = new Date(borrow.returnDate).getTime();
        
        if (returned <= due) {
            return null; // No fine if returned on or before due date
        }

        const overdueDays = Math.ceil((returned - due) / (1000 * 60 * 60 * 24));

        let strategy;
        switch (strategyType) {
            case 'FIXED':
                strategy = new FixedFine();
                break;
            case 'PERCENTAGE':
                strategy = new PercentageFine();
                break;
            case 'PER_DAY':
            default:
                strategy = new PerDayFine();
                break;
        }

        const calculator = new FineCalculator(strategy);
        // @ts-ignore - price field was just added to prisma schema, ignore TS error if Prisma client not regenerated yet
        const bookPrice = borrow.book?.price || 100;
        const amount = calculator.calculate(overdueDays, bookPrice);

        if (amount > 0) {
            return await FineRepository.createFine(borrowId, borrow.studentId, amount);
        }

        return null;
    }

    static async getMyFines(studentId: number) {
        return await FineRepository.findByStudent(studentId);
    }

    static async getAllFines() {
        return await FineRepository.getAll();
    }

    static async payFine(fineId: number) {
        return await FineRepository.markAsPaid(fineId);
    }
}
