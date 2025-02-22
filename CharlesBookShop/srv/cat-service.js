const cds = require('@sap/cds');

module.exports = (srv) => {

  // Fetch books with average rating
  srv.on('READ', 'Books', async (req) => {
    
    // Fetch books
    const books = await cds.run(SELECT.from('my.bookshop.Books'));

    // Fetch ratings
    const ratings = await cds.run(SELECT.from('my.bookshop.Ratings'));

    // Group ratings by book ID
    const ratingMap = {};
    ratings.forEach(({ book_ID, rating }) => {
      if (!ratingMap[book_ID]) ratingMap[book_ID] = [];
      ratingMap[book_ID].push(rating);
    });

    // Calculate average rating and fix image URLs
    books.forEach((book) => {
      const bookRatings = ratingMap[book.ID] || [];
      book.avgRating = bookRatings.length
        ? (bookRatings.reduce((sum, r) => sum + r, 0) / bookRatings.length).toFixed(1)
        : 0;

      // Ensure the image URL has the correct prefix
      if (book.imageUrl && !book.imageUrl.startsWith("images/")) {
        book.imageUrl = `images/${book.imageUrl}`;
      }
    });

    return books;
  });

  // Add book to wishlist
  srv.on('CREATE', 'Wishlist', async (req) => {
    const { username, book_ID } = req.data;

    if (!book_ID) {
        return req.error(400, "Book ID is required.");
    }

    // Check if the book exists
    const bookExists = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
    if (!bookExists) {
        return req.error(404, `Book with ID ${book_ID} not found`);
    }

    // Check if the book is already in wishlist
    const existingEntry = await cds.run(
        SELECT.one.from('my.bookshop.Wishlist').where({ username, book_ID })
    );
    if (existingEntry) {
        return req.error(409, 'Book is already in your wishlist');
    }

    // Insert into Wishlist (fixing ID generation)
    const result = await cds.run(
        INSERT.into('my.bookshop.Wishlist').entries({ 
            ID: cds.utils.uuid(), 
            username, 
            book_ID 
        })
    );

    return result;
});
srv.on('DELETE', 'Wishlist', async (req) => {
  const { ID } = req.data;

  if (!ID) {
      return req.error(400, "Wishlist ID is required.");
  }

  // Delete from wishlist using the ID
  await cds.run(
      DELETE.from('my.bookshop.Wishlist').where({ ID })
  );

  return { message: `Wishlist entry ${ID} removed.` };
});


};
