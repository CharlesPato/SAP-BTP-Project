const cds = require('@sap/cds');
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// =====================================================
// Cloudinary Connection
// =====================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = (srv) => {
    const { Users } = srv.entities;
    let isLoggedIn = 0
    // =====================================================
    // Books Service
    // =====================================================
    srv.on('READ', 'Books', async (req) => {
        const books = await cds.run(SELECT.from('my.bookshop.Books'));
        const ratings = await cds.run(SELECT.from('my.bookshop.Ratings'));
        const authors = await cds.run(SELECT.from('my.bookshop.Authors'));
    
        const ratingMap = {};
        ratings.forEach(({ book_ID, review }) => {
            if (!ratingMap[book_ID]) ratingMap[book_ID] = [];
            ratingMap[book_ID].push(review);
        });
    
        books.forEach((book) => {
            const author = authors.find(a => a.ID === book.author_ID);
            book.authorName = author ? author.name : "Unknown Author";
            book.reviews = ratingMap[book.ID] || [];
    
            const bookRatings = ratings.filter(r => r.book_ID === book.ID).map(r => r.rating);
            book.avgRating = bookRatings.length
                ? (bookRatings.reduce((sum, r) => sum + r, 0) / bookRatings.length).toFixed(1)
                : 0;
    
            if (book.imageUrl) {
                book.imageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/books/${book.imageUrl}`;
            }
        });
    
        return books;
    });
    srv.on('getBookByID', async (req) => {
        const { bookId } = req.data;
        if (!bookId) return req.error(400, "Book ID is required.");

        const book = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: bookId }));
        if (!book) return req.error(404, `Book with ID ${bookId} not found.`);

        const ratings = await cds.run(SELECT.from('my.bookshop.Ratings').where({ book_ID: bookId }));
        const author = await cds.run(SELECT.one.from('my.bookshop.Authors').where({ ID: book.author_ID }));

        book.authorName = author ? author.name : "Unknown Author";
        book.reviews = ratings.map(r => r.review);
        book.avgRating = ratings.length ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 0;

        if (book.imageUrl) {
            book.imageUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/books/${book.imageUrl}`;
        }

        return book;
    });

    // =====================================================
    // User Authentication Service (Login Only)
    // =====================================================
    srv.on('login', async (req) => {
        const { email, password } = req.data;
        if (!email || !password) return req.reject(400, "All fields are required");
    
        const user = await cds.run(SELECT.one.from(Users).where({ email }));
        if (!user) return req.reject(401, "Invalid credentials");
    
        if (password !== user.password) return req.reject(401, "Invalid credentials");
    
        global.isLoggedIn = 1; 
        return { ...user, isLoggedIn: global.isLoggedIn }; 
    });
    
    // =====================================================
    // Logout Service
    // =====================================================
    srv.on('logout', async (req) => {
        isLoggedIn = 0; // Mark user as logged out
        return { message: "Logged out successfully", isLoggedIn };
    });
    
};
