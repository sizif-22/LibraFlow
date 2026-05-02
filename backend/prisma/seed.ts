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
            type: 'BOOK' as const,
            quantity: 5,
            available: 5
        },
        {
            title: 'National Geographic - May 2024',
            author: 'Various',
            isbn: 'MAG-NG-2024-05',
            category: 'Science',
            type: 'MAGAZINE' as const,
            quantity: 10,
            available: 10
        },
        {
            title: 'AI in Library Management Systems',
            author: 'Ahmed Ali',
            isbn: 'TH-2024-001',
            category: 'Technology',
            type: 'THESIS' as const,
            quantity: 1,
            available: 1
        },
        {
            title: '1984',
            author: 'George Orwell',
            isbn: '9780451524935',
            category: 'Dystopian',
            type: 'BOOK' as const,
            quantity: 3,
            available: 3
        },
        {
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            isbn: '9780061120084',
            category: 'Classic',
            type: 'BOOK' as const,
            quantity: 4,
            available: 4
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
