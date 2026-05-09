import { Elysia, t } from 'elysia'
import { BookService } from '../services/book.service'

export const bookController = new Elysia({ prefix: '/books' })
    .get('/', async ({ query }: any) => {
        const { search, category, page, limit } = query
        return await BookService.getAll({
            search,
            category,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        })
    }, {
        isAuth: true,
        query: t.Object({
            search: t.Optional(t.String()),
            category: t.Optional(t.String()),
            page: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    })
    .get('/grouped', async ({ query }: any) => {
        const { search, category, author } = query
        return await BookService.getGroupedByCategory({ search, category, author })
    }, {
        isAuth: true,
        query: t.Object({
            search: t.Optional(t.String()),
            category: t.Optional(t.String()),
            author: t.Optional(t.String())
        })
    })
    .get('/:id', async ({ params: { id }, set }: any) => {
        const book = await BookService.getById(parseInt(id))
        if (!book) {
            set.status = 404
            return { message: 'Book not found' }
        }
        return book

    }, {
        isAuth: true,
        params: t.Object({
            id: t.String()
        })
    } as any)

    .post('/', async ({ body, set }: any) => {
        try {
            return await BookService.create(body)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to create book' }
        }

    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        body: t.Object({
            title: t.String({ minLength: 1 }),
            author: t.String({ minLength: 1 }),
            isbn: t.String({ minLength: 10 }),
            category: t.String({ minLength: 1 }),
            quantity: t.Number({ minimum: 0 })
        })
    })
    .put('/:id', async ({ params: { id }, body, set }: any) => {
        try {
            return await BookService.update(parseInt(id), body)
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to update book' }
        }

    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        body: t.Partial(t.Object({
            title: t.String({ minLength: 1 }),
            author: t.String({ minLength: 1 }),
            isbn: t.String({ minLength: 10 }),
            category: t.String({ minLength: 1 }),
            quantity: t.Number({ minimum: 0 }),
            available: t.Number({ minimum: 0 })
        }))
    })
    .delete('/:id', async ({ params: { id }, set }: any) => {
        try {
            await BookService.delete(parseInt(id))
            return { message: 'Book deleted successfully' }
        } catch (e: any) {
            set.status = 400
            return { message: e.message || 'Failed to delete book' }
        }

    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN'],
        params: t.Object({
            id: t.String()
        })
    } as any)
