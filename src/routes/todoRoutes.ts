import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Todo } from '../database.js';
import { db } from '../database.js';

const router = Router();

// GET /todos - Get all todos
router.get('/todos', (req: Request, res: Response): void => {
  const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  res.json(todos);
});

// GET /todos/:id - Get a single todo by id
router.get('/todos/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  
  res.json(todo);
});

// POST /todos - Create a new todo
router.post('/todos', (req: Request, res: Response): void => {
  const { title, description, completed }: Todo = req.body;
  
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  
  const stmt = db.prepare(`
    INSERT INTO todos (title, description, completed)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(title, description, completed ? 1 : 0);
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  
  res.status(201).json(todo);
});

// PUT /todos/:id - Update a todo
router.put('/todos/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  const { title, description, completed }: Todo = req.body;
  
  const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as Todo | undefined;
  
  if (!existingTodo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  
  const stmt = db.prepare(`
    UPDATE todos 
    SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    title ?? existingTodo.title,
    description ?? existingTodo.description,
    completed !== undefined ? (completed ? 1 : 0) : existingTodo.completed,
    id
  );
  
  const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json(updatedTodo);
});

// DELETE /todos/:id - Delete a todo
router.delete('/todos/:id', (req: Request, res: Response): void => {
  const { id } = req.params;
  
  const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  
  if (!existingTodo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.status(204).send();
});

export default router;
