import { BookRepository } from '../repositories/BookRepository'

export const BookService = {
    async getAll(params: { search?: string, category?: string, page?: number, limit?: number }) {
        const { search, category, page = 1, limit = 10 } = params
        
        let where: any = {}
        
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { author: { contains: search } },
                { isbn: { contains: search } },
                { category: { contains: search } }
            ]
        }
        
        if (category) {
            where.category = category
        }

        const [books, total] = await Promise.all([
            BookRepository.findMany(where, { skip: (page - 1) * limit, take: limit }),
            BookRepository.count(where)
        ])

        return {
            books,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    async getGroupedByCategory(params: { search?: string, category?: string, author?: string }) {
        const { search, category, author } = params
        
        let where: any = {}
        
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { author: { contains: search } },
                { isbn: { contains: search } },
                { category: { contains: search } }
            ]
        }
        
        if (category) {
            where.category = category
        }
        
        if (author) {
            where.author = author
        }

        const books = await BookRepository.findAll(where)

        const grouped = books.reduce((acc, book) => {
            const cat = book.category || 'Uncategorized'
            const list = acc[cat] || []
            list.push(book)
            acc[cat] = list
            return acc
        }, {} as Record<string, typeof books>)

        return Object.keys(grouped).map(category => ({
            category,
            books: grouped[category]
        }))
    },

    async getById(id: number) {
        return await BookRepository.findById(id)
    },

    async create(data: any) {
        return await BookRepository.create(data)
    },

    async update(id: number, data: any) {
        return await BookRepository.update(id, data)
    },

    async delete(id: number) {
        return await BookRepository.delete(id)
    }
}
