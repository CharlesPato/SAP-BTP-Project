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
    
        // Fetch the book details by ID
        const book = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: bookId }));
        if (!book) return req.error(404, `Book with ID ${bookId} not found.`);
        console.log("Fetched Book:", book);
    
        // Fetch the related ratings for the book
        const ratings = await cds.run(SELECT.from('my.bookshop.Ratings').where({ book_ID: bookId }));
        console.log("Fetched Ratings:", ratings);
    
        // Calculate the average rating (if ratings exist)
        const avgRating = ratings.length
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : '0.0'; // Ensure it's a string for consistency with the response
        console.log("Calculated avgRating:", avgRating);
    
        // Fetch the author details based on the author_ID
        const author = await cds.run(SELECT.one.from('my.bookshop.Authors').where({ ID: book.author_ID }));
        console.log("Fetched Author:", author);
    
        // Add the necessary details to the book object
        book.authorName = author ? author.name : "Unknown Author";
        book.reviews = ratings.map(r => ({ review: r.review, rating: r.rating, id: r.ID })); // Returning full Ratings objects
        book.avgRating = avgRating; // Average rating
        book.imageUrl = book.imageUrl ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/books/${book.imageUrl}` : '';
    
        // Log what is being returned (for debugging)
        console.log("Returning Response:", {
            ID: book.ID,
            title: book.title,
            authorName: book.authorName,
            avgRating: book.avgRating,
            reviews: book.reviews,
            imageUrl: book.imageUrl,
            stock: book.stock
        });
    
        // Return the full response with necessary fields
        return {
            "@odata.context": "$metadata#Books/$entity", // Ensure OData context is set
            ID: book.ID,
            title: book.title,
            authorName: book.authorName,  // Add author name to the response
            avgRating: book.avgRating,
            reviews: book.reviews,        // Add reviews to the response
            imageUrl: book.imageUrl,
            stock: book.stock
        };
    });
    srv.on('CREATE', 'Ratings', async (req) => {
        const { rating, review, book_ID } = req.data;
    
        if (!rating || !review || !book_ID) {
            return req.error(400, "Rating, review, and book ID are required.");
        }
    
     
        const bookExists = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
        if (!bookExists) {
            return req.error(404, `Book with ID ${book_ID} not found.`);
        }
    
   
        const lastRating = await cds.run(SELECT.one.from('my.bookshop.Ratings').orderBy({ ID: 'desc' }).limit(1));
        const nextId = lastRating ? lastRating.ID + 1 : 28; 
    
   
        const result = await cds.run(
            INSERT.into('my.bookshop.Ratings').entries({
                ID: nextId,  
                rating,
                review,
                book_ID
            })
        );
    
        
        const ratings = await cds.run(SELECT.from('my.bookshop.Ratings').where({ book_ID }));
        const avgRating = ratings.length
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 0;
    
       
        await cds.run(
            UPDATE('my.bookshop.Books')
                .set({ avgRating })
                .where({ ID: book_ID })
        );
    
        return result;
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

srv.on('DELETE', 'Cart', async (req) => {
  const { ID } = req.data;

  if (!ID) {
      return req.error(400, "Cart ID is required.");
  }

 
  await cds.run(
      DELETE.from('my.bookshop.Cart').where({ ID })
  );

  return { message: `Cart entry ${ID} removed.` };
});
srv.on('CREATE', 'Cart', async (req) => {
  const { book_ID, quantity } = req.data;

  if (!book_ID) {
      return req.error(400, "Book ID is required.");
  }

  const qtyToAdd = quantity || 1;

  const bookExists = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
  if (!bookExists) {
      return req.error(404, `Book with ID ${book_ID} not found`);
  }

  const stockPrice = bookExists.stock;
  const totalCost = stockPrice * qtyToAdd;

  const existingEntry = await cds.run(
      SELECT.one.from('my.bookshop.Cart').where({ book_ID })
  );

  if (existingEntry) {
      const newQuantity = existingEntry.quantity + qtyToAdd;
      const newTotalCost = stockPrice * newQuantity;

      await cds.run(
          UPDATE('my.bookshop.Cart')
              .set({ quantity: newQuantity, totalCost: newTotalCost })
              .where({ ID: existingEntry.ID })
      );

      return { message: `Updated quantity to ${newQuantity} and total cost to ${newTotalCost}` };
  } else {
      const result = await cds.run(
          INSERT.into('my.bookshop.Cart').entries({ 
              ID: cds.utils.uuid(), 
              book_ID,
              quantity: qtyToAdd,
              totalCost
          })
      );

      return result;
  }
});

srv.on('PATCH', 'Cart', async (req) => {
  const { book_ID, quantity } = req.data;

  if (!book_ID) {
      return req.error(400, "Book ID is required.");
  }

  // Find the cart entry using book_ID
  const cartItem = await cds.run(SELECT.one.from('my.bookshop.Cart').where({ book_ID }));
  if (!cartItem) {
      return req.error(404, "Cart item not found.");
  }

  // Fetch the book details for price calculation
  const book = await cds.run(SELECT.one.from('my.bookshop.Books').where({ ID: book_ID }));
  if (!book) {
      return req.error(404, "Associated book not found.");
  }

  // Calculate new total cost
  const totalCost = book.stock * quantity;

  // Update the cart using the actual cart ID
  await cds.run(
      UPDATE('my.bookshop.Cart')
          .set({ quantity, totalCost })
          .where({ ID: cartItem.ID }) // Use Cart ID, not book_ID
  );

  return { message: `Updated quantity to ${quantity} and total cost to ${totalCost}` };
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
