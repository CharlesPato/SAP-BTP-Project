using my.bookshop as my from '../db/schema';

service CatalogService {
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
  entity Ratings as projection on my.Ratings;
  entity Wishlist as projection on my.Wishlist;
  entity Cart as projection on my.Cart;

  function getBookByID(bookId: Integer) returns Books;// Getting Single Book by ID
}
