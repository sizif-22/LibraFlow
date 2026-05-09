import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Seed Users
    const users = [
        {
            name: 'Admin User',
            email: 'admin@lib.com',
            password: '$2b$10$Ci7qRJ7kw8JhdYPaRMK9AO8tVzNn2UYHABoPk15EpE2WT1e7IzP3m',
            role: 'ADMIN' as Role,
            isActive: true,
            isVerified: true
        },
        {
            name: 'Librarian User',
            email: 'lib@lib.com',
            password: '$2b$10$Ci7qRJ7kw8JhdYPaRMK9AO8tVzNn2UYHABoPk15EpE2WT1e7IzP3m',
            role: 'LIBRARIAN' as Role,
            isActive: true,
            isVerified: true
        },
        {
            name: 'Student User',
            email: 'student@lib.com',
            password: '$2b$10$Ci7qRJ7kw8JhdYPaRMK9AO8tVzNn2UYHABoPk15EpE2WT1e7IzP3m',
            role: 'STUDENT' as Role,
            isActive: true,
            isVerified: true
        }
    ]

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: user,
            create: user
        })
    }

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
        },
        {
            title: 'The Catcher in the Rye',
            author: 'J.D. Salinger',
            isbn: '9780316769488',
            category: 'Classic',
            type: 'BOOK' as const,
            quantity: 3,
            available: 3
        },
        {
            title: 'Pride and Prejudice',
            author: 'Jane Austen',
            isbn: '9780141439518',
            category: 'Romance',
            type: 'BOOK' as const,
            quantity: 4,
            available: 4
        },
        {
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
            isbn: '9780547928227',
            category: 'Fantasy',
            type: 'BOOK' as const,
            quantity: 5,
            available: 5
        },
        {
            title: 'Time Magazine - June 2024',
            author: 'Various',
            isbn: 'MAG-TM-2024-06',
            category: 'News',
            type: 'MAGAZINE' as const,
            quantity: 8,
            available: 8
        },
        {
            title: 'Blockchain in Academia',
            author: 'Sara Mohamed',
            isbn: 'TH-2025-002',
            category: 'Technology',
            type: 'THESIS' as const,
            quantity: 1,
            available: 1
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
    console.log('Accounts:')
    console.log('  Admin:     admin@lib.com / password')
    console.log('  Librarian: lib@lib.com / password')
    console.log('  Student:   student@lib.com / password')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
