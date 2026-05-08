export enum Role {
    STUDENT = 'STUDENT',
    LIBRARIAN = 'LIBRARIAN',
    ADMIN = 'ADMIN'
}

export interface AuthUser {
    id: number
    email: string
    role: Role
    name?: string
}
