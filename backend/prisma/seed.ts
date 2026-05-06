import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Seed Books
    const books = [
        {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            isbn: '9780743273565',
            category: 'Fiction',
            quantity: 5,
            available: 5
        },
        {
            title: '1984',
            author: 'George Orwell',
            isbn: '9780451524935',
            category: 'Dystopian',
            quantity: 3,
            available: 3
        },
        {
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            isbn: '9780061120084',
            category: 'Classic',
            quantity: 4,
            available: 4
        },
        {
            title: 'Sapiens: A Brief History of Humankind',
            author: 'Yuval Noah Harari',
            isbn: '9780062316097',
            category: 'History',
            quantity: 2,
            available: 2
        },
        {
            title: 'Clean Code',
            author: 'Robert C. Martin',
            isbn: '9780132350884',
            category: 'Technology',
            quantity: 10,
            available: 10
        }
    ]

    for (const book of books) {
        await prisma.book.upsert({
            where: { isbn: book.isbn },
            update: book,
            create: book
        })
    }

    console.log('Seeding completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
