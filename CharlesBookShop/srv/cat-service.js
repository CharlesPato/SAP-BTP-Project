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
            // Fetch author name
            const author = authors.find(a => a.ID === book.author_ID);
            book.authorName = author ? author.name : "Unknown Author";
    
            // Fetch book reviews
            book.reviews = ratingMap[book.ID] || [];
    
            // Compute average rating
            const bookRatings = ratings.filter(r => r.book_ID === book.ID).map(r => r.rating);
            book.avgRating = bookRatings.length
                ? (bookRatings.reduce((sum, r) => sum + r, 0) / bookRatings.length).toFixed(1)
                : 0;
    
            // Update Cloudinary image URL
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
    // Wishlist Service
    // =====================================================
    srv.on('CREATE', 'Wishlist', async (req) => {
        const { username, book_ID } = req.data;
    
        if (!book_ID) return req.error(400, "Book ID is required.");
    
        const bookExists = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
        if (!bookExists) return req.error(404, `Book with ID ${book_ID} not found`);
    
        const existingEntry = await cds.run(SELECT.one.from('my.bookshop.Wishlist').where({ username, book_ID }));
        if (existingEntry) return req.error(409, 'Book is already in your wishlist');
    
        return await cds.run(INSERT.into('my.bookshop.Wishlist').entries({ ID: cds.utils.uuid(), username, book_ID }));
    });
    
    srv.on('DELETE', 'Wishlist', async (req) => {
        const { ID } = req.data;
    
        if (!ID) return req.error(400, "Wishlist ID is required.");
    
        await cds.run(DELETE.from('my.bookshop.Wishlist').where({ ID }));
    
        return { message: `Wishlist entry ${ID} removed.` };
    });
    
    // =====================================================
    // Cart Service
    // =====================================================
    srv.on('CREATE', 'Cart', async (req) => {
        const { book_ID, quantity } = req.data;
    
        if (!book_ID) return req.error(400, "Book ID is required.");
    
        const qtyToAdd = quantity || 1;
        const book = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
        if (!book) return req.error(404, `Book with ID ${book_ID} not found`);
    
        const stockPrice = book.stock;
        const totalCost = stockPrice * qtyToAdd;
    
        const existingEntry = await cds.run(SELECT.one.from('my.bookshop.Cart').where({ book_ID }));
    
        if (existingEntry) {
            const newQuantity = existingEntry.quantity + qtyToAdd;
            const newTotalCost = stockPrice * newQuantity;
    
            await cds.run(UPDATE('my.bookshop.Cart').set({ quantity: newQuantity, totalCost: newTotalCost }).where({ ID: existingEntry.ID }));
    
            return { message: `Updated quantity to ${newQuantity} and total cost to ${newTotalCost}` };
        } else {
            return await cds.run(INSERT.into('my.bookshop.Cart').entries({ ID: cds.utils.uuid(), book_ID, quantity: qtyToAdd, totalCost }));
        }
    });
    
    srv.on('PATCH', 'Cart', async (req) => {
        const { book_ID, quantity } = req.data;
    
        if (!book_ID) return req.error(400, "Book ID is required.");
    
        const cartItem = await cds.run(SELECT.one.from('my.bookshop.Cart').where({ book_ID }));
        if (!cartItem) return req.error(404, "Cart item not found.");
    
        const book = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
        if (!book) return req.error(404, "Associated book not found.");
    
        const totalCost = book.stock * quantity;
    
        await cds.run(UPDATE('my.bookshop.Cart').set({ quantity, totalCost }).where({ ID: cartItem.ID }));
    
        return { message: `Updated quantity to ${quantity} and total cost to ${totalCost}` };
    });
    
    srv.on('DELETE', 'Cart', async (req) => {
        const { ID } = req.data;
    
        if (!ID) return req.error(400, "Cart ID is required.");
    
        await cds.run(DELETE.from('my.bookshop.Cart').where({ ID }));
    
        return { message: `Cart entry ${ID} removed.` };
    });
};
