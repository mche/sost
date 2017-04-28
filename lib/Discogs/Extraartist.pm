package Discogs::Extraartist;
use Mojo::Base 'Discogs::Base';

=pod

     Таблица "discogs.extraartists"
    Колонка    |   Тип   | Модификаторы 
---------------+---------+--------------
 parent_aid    | integer | NOT NULL
 roles_aid     | integer | NOT NULL
 position      | integer | NOT NULL
 artist_aid    | integer | NOT NULL
 anv           | text    | 
 join_relation | text    | 


parent_aid - для релизов и треков

=cut



1;