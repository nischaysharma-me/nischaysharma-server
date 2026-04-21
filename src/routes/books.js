import express from 'express';
import bookController from '../controllers/bookController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Threaded Book and Page management
 */

// --- Book Routes ---

// Get all books (Public for showcase)
router.get('/', bookController.getUserBooks);

// Get a specific book (Public)
router.get('/:bookId', bookController.getBook);

// Get a book with full hierarchy (Public)
router.get('/:bookId/full', bookController.getFullBook);

// Get all pages for a book (Public)
router.get('/:bookId/pages', bookController.getBookPages);


// Mutations require authentication
router.use(isAuthenticated);

// Create a new book
router.post('/', bookController.createBook);

// Update book metadata
router.patch('/:bookId', bookController.updateBook);

// Delete a book and its pages
router.delete('/:bookId', bookController.deleteBook);

// --- Page Routes (Scoped within a Book) ---

// Update a specific page
router.patch('/:bookId/pages/:pageId', bookController.updatePage);

// Delete a specific page
router.delete('/:bookId/pages/:pageId', bookController.deletePage);

export default router;
