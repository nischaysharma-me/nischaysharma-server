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

// Apply authentication to all book routes
router.use(isAuthenticated);

// --- Book Routes ---

// Create a new book
router.post('/', bookController.createBook);

// Get all books for the user
router.get('/', bookController.getUserBooks);

// Get a specific book
router.get('/:bookId', bookController.getBook);

// Get a book with full hierarchy (populated chapters and pages)
router.get('/:bookId/full', bookController.getFullBook);

// Update book metadata
router.patch('/:bookId', bookController.updateBook);

// Delete a book and its pages
router.delete('/:bookId', bookController.deleteBook);

// --- Page Routes (Scoped within a Book) ---

// Get all pages for a book (ordered)
router.get('/:bookId/pages', bookController.getBookPages);

// Update a specific page
router.patch('/:bookId/pages/:pageId', bookController.updatePage);

// Delete a specific page
router.delete('/:bookId/pages/:pageId', bookController.deletePage);

export default router;
