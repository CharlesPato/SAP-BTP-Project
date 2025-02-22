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
};
