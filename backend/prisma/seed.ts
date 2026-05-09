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
        },
        {
            title: 'Brave New World',
            author: 'Aldous Huxley',
            isbn: '9780060850524',
            category: 'Dystopian',
            type: 'BOOK' as const,
            quantity: 4,
            available: 4
        },
        {
            title: 'The Lord of the Rings',
            author: 'J.R.R. Tolkien',
            isbn: '9780544003415',
            category: 'Fantasy',
            type: 'BOOK' as const,
            quantity: 3,
            available: 3
        },
        {
            title: 'Harry Potter and the Sorcerer\'s Stone',
            author: 'J.K. Rowling',
            isbn: '9780439708180',
            category: 'Fantasy',
            type: 'BOOK' as const,
            quantity: 6,
            available: 6
        },
        {
            title: 'The Da Vinci Code',
            author: 'Dan Brown',
            isbn: '9780307474278',
            category: 'Thriller',
            type: 'BOOK' as const,
            quantity: 5,
            available: 5
        },
        {
            title: 'The Alchemist',
            author: 'Paulo Coelho',
            isbn: '9780062315007',
            category: 'Philosophy',
            type: 'BOOK' as const,
            quantity: 4,
            available: 4
        },
        {
            title: 'Sapiens: A Brief History of Humankind',
            author: 'Yuval Noah Harari',
            isbn: '9780062316110',
            category: 'History',
            type: 'BOOK' as const,
            quantity: 3,
            available: 3
        },
        {
            title: 'Atomic Habits',
            author: 'James Clear',
            isbn: '9780735211292',
            category: 'Self-Help',
            type: 'BOOK' as const,
            quantity: 7,
            available: 7
        },
        {
            title: 'The Lean Startup',
            author: 'Eric Ries',
            isbn: '9780307887894',
            category: 'Business',
            type: 'BOOK' as const,
            quantity: 4,
            available: 4
        },
        {
            title: 'A Brief History of Time',
            author: 'Stephen Hawking',
            isbn: '9780553380163',
            category: 'Science',
            type: 'BOOK' as const,
            quantity: 3,
            available: 3
        },
        {
            title: 'The Art of War',
            author: 'Sun Tzu',
            isbn: '9781590302255',
            category: 'Philosophy',
            type: 'BOOK' as const,
            quantity: 5,
            available: 5
        },
        {
            title: 'Thinking, Fast and Slow',
            author: 'Daniel Kahneman',
            isbn: '9780374533557',
            category: 'Psychology',
            type: 'BOOK' as const,
            quantity: 3,
            available: 3
        },
        {
            title: 'Forbes - July 2024',
            author: 'Various',
            isbn: 'MAG-FB-2024-07',
            category: 'Business',
            type: 'MAGAZINE' as const,
            quantity: 6,
            available: 6
        },
        {
            title: 'The Economist - June 2024',
            author: 'Various',
            isbn: 'MAG-EC-2024-06',
            category: 'News',
            type: 'MAGAZINE' as const,
            quantity: 7,
            available: 7
        },
        {
            title: 'Wired - August 2024',
            author: 'Various',
            isbn: 'MAG-WR-2024-08',
            category: 'Technology',
            type: 'MAGAZINE' as const,
            quantity: 5,
            available: 5
        },
        {
            title: 'Machine Learning for Healthcare',
            author: 'Dr. Nour Hassan',
            isbn: 'TH-2025-003',
            category: 'Technology',
            type: 'THESIS' as const,
            quantity: 1,
            available: 1
        },
        {
            title: 'Climate Change in the Nile Delta',
            author: 'Mariam Ibrahim',
            isbn: 'TH-2025-004',
            category: 'Science',
            type: 'THESIS' as const,
            quantity: 1,
            available: 1
        },
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
