import prisma from '../db/client'

export const BookService = {
    async getAll(params: { search?: string, page?: number, limit?: number }) {
        const { search, page = 1, limit = 10 } = params
        
        const where = search ? {
            OR: [
                { title: { contains: search } },
                { author: { contains: search } },
                { isbn: { contains: search } },
                { category: { contains: search } }
            ]
        } : {}

        const [books, total] = await Promise.all([
            prisma.book.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.book.count({ where })
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

    async getById(id: number) {
        return await prisma.book.findUnique({
            where: { id }
        })
    },

    async create(data: any) {
        return await prisma.book.create({
            data: {
                ...data,
                available: data.quantity // Initially available is same as total quantity
            }
        })
    },

    async update(id: number, data: any) {
        return await prisma.book.update({
            where: { id },
            data
        })
    },

    async delete(id: number) {
        return await prisma.book.delete({
            where: { id }
        })
    }
}
