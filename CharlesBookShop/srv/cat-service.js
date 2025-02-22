const cds = require('@sap/cds');

module.exports = (srv) => {
  srv.on('READ', 'Books', async (req) => {
    // Fetch books manually instead of using `next()`
    const books = await cds.run(SELECT.from('my.bookshop.Books'));
    
    // Fetch ratings separately
    const ratings = await cds.run(SELECT.from('my.bookshop.Ratings'));

    console.log("Fetched Ratings:", JSON.stringify(ratings, null, 2)); // Debugging

    // Create a mapping of book IDs to their ratings
    const ratingMap = {};
    ratings.forEach(({ book_ID, rating }) => {
      if (!ratingMap[book_ID]) ratingMap[book_ID] = [];
      ratingMap[book_ID].push(rating);
    });

    books.forEach((book) => {
      // Compute avgRating
      const bookRatings = ratingMap[book.ID] || [];
      book.avgRating = bookRatings.length
        ? (bookRatings.reduce((sum, r) => sum + r, 0) / bookRatings.length).toFixed(1)
        : 0;

        if (book.imageUrl && !book.imageUrl.startsWith("images/")) {
          book.imageUrl = `images/${book.imageUrl}`;
        }
    });

    console.log("Processed Books:", JSON.stringify(books, null, 2)); // Debugging
    return books;
  });
};
