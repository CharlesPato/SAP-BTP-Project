using my.bookshop as my from '../db/schema';

service CatalogService {
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
  entity Ratings as projection on my.Ratings;
  entity Wishlist as projection on my.Wishlist;
  entity Cart as projection on my.Cart;
  entity Users as projection on my.Users;


  action login(email: String, password: String) returns Users;
  action logout() returns String;

   function getBookByID(bookId: Integer) returns {
    ID: Integer;
    title: String;
    authorName: String;
    avgRating: String;
    reviews: Association to many Ratings; 
    imageUrl: String;
    stock: Integer;
  };
}
