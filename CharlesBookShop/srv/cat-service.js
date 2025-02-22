const cds = require('@sap/cds');
// On this Service Im calculating Average Rating based Book_ID
module.exports = (srv) => {
  srv.on('READ', 'Books', async (req) => {
  
    const books = await cds.run(SELECT.from('my.bookshop.Books'));
    

    const ratings = await cds.run(SELECT.from('my.bookshop.Ratings'));

   

 
    const ratingMap = {};
    ratings.forEach(({ book_ID, rating }) => {
      if (!ratingMap[book_ID]) ratingMap[book_ID] = [];
      ratingMap[book_ID].push(rating);
    });

    books.forEach((book) => {
      
      const bookRatings = ratingMap[book.ID] || [];
      book.avgRating = bookRatings.length
        ? (bookRatings.reduce((sum, r) => sum + r, 0) / bookRatings.length).toFixed(1)
        : 0;

        if (book.imageUrl && !book.imageUrl.startsWith("images/")) {
          book.imageUrl = `images/${book.imageUrl}`;
        }
    });

   
    return books;
  });

  //Add book to wishlist
  srv.on('CREATE', 'Wishlist', async (req) => {
    const { username, book_ID } = req.data;

    // Check if the book exists
    const bookExists = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
    if (!bookExists) req.error(404, `Book with ID ${book_ID} not found`);

    // Check if the book is already in wishlist
    const existingEntry = await cds.run(
      SELECT.one.from('my.bookshop.Wishlist').where({ username, book_ID })
    );
    if (existingEntry) req.error(409, 'Book is already in your wishlist');

    // Insert into Wishlist
    const result = await cds.run(
      INSERT.into('my.bookshop.Wishlist').entries({ username, book_ID })
    );

    return result;
  });

};
