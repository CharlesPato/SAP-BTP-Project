namespace my.bookshop;

entity Books {
  key ID : Integer;
  title  : localized String;
  author : Association to Authors;
  stock  : Integer;
  ratings: Association to many Ratings on ratings.book = $self;
}

entity Authors {
  key ID : Integer;
  name   : String;
  books  : Association to many Books on books.author = $self;
}

entity Ratings {
  key ID     : Integer;
  rating     : Integer @title: 'Rating' @min: 1 @max: 10;
  review     : String;
  book       : Association to Books;
}
