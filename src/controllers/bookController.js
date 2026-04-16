import bookService from '../services/bookService.js';
import * as userService from '../services/userProfileService.js';

class BookController {
    /**
     * Create a new book
     */
    async createBook(req, res) {
        try {
            const { title, description, threadId, type } = req.body;
            const userId = req.user.uid;
            
            const book = await bookService.createBook(userId, title, description, type, threadId);
            
            res.status(201).json({
                success: true,
                data: book
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all books (Publicly returns primary admin's books if unauthenticated)
     */
    async getUserBooks(req, res) {
        try {
            let userId = req.user?.uid;
            
            if (!userId) {
                const admin = await userService.getPrimaryAdmin();
                if (admin) {
                    userId = admin.uid;
                }
            }

            if (!userId) {
                return res.json({
                    success: true,
                    data: []
                });
            }

            const { full } = req.query;
            let books = await bookService.getUserBooks(userId);

            if (full === 'true') {
                books = await Promise.all(books.map(book => bookService.getFullBookContents(book.id)));
            }
            
            res.status(200).json({
                success: true,
                data: books
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get a specific book by ID
     */
    async getBook(req, res) {
        try {
            const { bookId } = req.params;
            const book = await bookService.getBook(bookId);
            
            res.status(200).json({
                success: true,
                data: book
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get a book with full hierarchy (chapters and pages)
     */
    async getFullBook(req, res) {
        try {
            const { bookId } = req.params;
            const fullBook = await bookService.getFullBookContents(bookId);
            
            res.status(200).json({
                success: true,
                data: fullBook
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update book metadata
     */
    async updateBook(req, res) {
        try {
            const { bookId } = req.params;
            const updates = req.body;
            
            const updatedBook = await bookService.updateBook(bookId, updates);
            
            res.status(200).json({
                success: true,
                data: updatedBook
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete a book
     */
    async deleteBook(req, res) {
        try {
            const { bookId } = req.params;
            await bookService.deleteBook(bookId);
            
            res.status(200).json({
                success: true,
                message: 'Book and its pages deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get all pages for a book (ordered)
     */
    async getBookPages(req, res) {
        try {
            const { bookId } = req.params;
            const pages = await bookService.getBookPages(bookId);
            
            res.status(200).json({
                success: true,
                data: pages
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Update a specific page
     */
    async updatePage(req, res) {
        try {
            const { pageId } = req.params;
            const updates = req.body;
            
            const updatedPage = await bookService.updatePage(pageId, updates);
            
            res.status(200).json({
                success: true,
                data: updatedPage
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Delete a page
     */
    async deletePage(req, res) {
        try {
            const { pageId } = req.params;
            await bookService.deletePage(pageId);
            
            res.status(200).json({
                success: true,
                message: 'Page deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new BookController();
