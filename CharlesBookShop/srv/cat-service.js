const cds = require('@sap/cds');
const { Books, Ratings } = cds.entities;

module.exports = (srv) => {
  
 
  srv.on('READ', 'Books', async (req) => {
    // Fetch all books
    const books = await SELECT.from(Books);

    // Iterate through each book and calculate its average rating
    for (const book of books) {
      // Fetch ratings for the current book
      const rates = await SELECT.from(Ratings).where({ book: book.ID });
      
      // Calculate the average rating for the book
      if (rates.length > 0) {
        const totalRating = rates.reduce((sum, rating) => sum + rating.rating, 0);
        book.ratings = totalRating / rates.length;  
      } else {
        book.ratings = null;  
      }
    }

  
    return books;
  });

};
