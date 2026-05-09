-- CreateTable
CREATE TABLE `book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `isbn` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` ENUM('BOOK', 'MAGAZINE', 'THESIS') NOT NULL DEFAULT 'BOOK',
    `quantity` INTEGER NOT NULL,
    `available` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 100,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Book_isbn_key`(`isbn` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `borrow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `bookId` INTEGER NOT NULL,
    `type` ENUM('BOOK', 'MAGAZINE', 'THESIS') NOT NULL DEFAULT 'BOOK',
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'RETURNED') NOT NULL DEFAULT 'PENDING',
    `borrowDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NULL,
    `returnDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Borrow_bookId_fkey`(`bookId` ASC),
    INDEX `Borrow_studentId_fkey`(`studentId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `borrowId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Fine_borrowId_key`(`borrowId` ASC),
    INDEX `Fine_studentId_fkey`(`studentId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` ENUM('BORROW_APPROVED', 'BORROW_REJECTED', 'FINE_ADDED', 'DUE_REMINDER') NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_studentId_fkey`(`studentId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'LIBRARIAN', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `borrow` ADD CONSTRAINT `Borrow_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `borrow` ADD CONSTRAINT `Borrow_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fine` ADD CONSTRAINT `Fine_borrowId_fkey` FOREIGN KEY (`borrowId`) REFERENCES `borrow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fine` ADD CONSTRAINT `Fine_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `Notification_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
