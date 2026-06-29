import Database from 'better-sqlite3';
declare const db: Database.Database;
export interface Todo {
    id?: number;
    title: string;
    description?: string;
    completed?: boolean;
    created_at?: string;
    updated_at?: string;
}
export { db };
