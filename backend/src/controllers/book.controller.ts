import { Elysia, t } from 'elysia'
import { BookService } from '../services/book.service'
import { authMiddleware } from '../middlewares/auth.middleware'
import { roleMiddleware } from '../middlewares/role.middleware'

export const bookController = new Elysia({ prefix: '/books' })
    .use(authMiddleware)
    .use(roleMiddleware)
    .get('/', async ({ query }) => {
        const { search, page, limit } = query
        return await BookService.getAll({
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        })
    }, {
        isAuth: true,
        query: t.Object({
            search: t.Optional(t.String()),
            page: t.Optional(t.String()),
            limit: t.Optional(t.String())
        })
    })
    .get('/:id', async ({ params: { id }, error }) => {
        const book = await BookService.getById(parseInt(id))
        if (!book) return error(404, 'Book not found')
        return book
    }, {
        isAuth: true
    })
    .post('/', async ({ body, error }) => {
        try {
            return await BookService.create(body)
        } catch (e: any) {
            return error(400, e.message || 'Failed to create book')
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
    .put('/:id', async ({ params: { id }, body, error }) => {
        try {
            return await BookService.update(parseInt(id), body)
        } catch (e: any) {
            return error(400, e.message || 'Failed to update book')
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
    .delete('/:id', async ({ params: { id }, error }) => {
        try {
            await BookService.delete(parseInt(id))
            return { message: 'Book deleted successfully' }
        } catch (e: any) {
            return error(400, e.message || 'Failed to delete book')
        }
    }, {
        isAuth: true,
        hasRole: ['LIBRARIAN', 'ADMIN']
    })
