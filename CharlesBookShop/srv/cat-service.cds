using my.bookshop as my from '../db/schema';

service CatalogService {
  entity Books     as projection on my.Books;
  entity Authors   as projection on my.Authors;
  entity Ratings   as projection on my.Ratings;  
  entity Wishlist  as projection on my.Wishlist;
  
}
