package Util;
use Mojo::Base -strict;
use List::Util qw(first); # indexOf

use Exporter 'import';

# Defer to runtime so Mojo::Util can use "-strict"
require Mojo::Util;

my %RE = (
  inner_minus => qr/(\S\s*)-+/, # минусы внутри 
  non_digit => qr/[^\d,.\-]/, # почикать буквы пробелы
  to_dots => qr/,/, # только точки
  left_dots => qr/(\.)(?=.*\1)/, # останется только одна точка справа
);

our @EXPORT_OK = qw(numeric float indexOf);

# Aliases
monkey_patch(__PACKAGE__, 'float',    \&numeric);

# Declared in Mojo::Base to avoid circular require problems
sub monkey_patch { Mojo::Util::monkey_patch(@_) }

sub numeric {
  #~ (( shift =~ s/$RE{non_digit}//gr) =~ s/$RE{to_dots}/./gr )=~ s/$RE{left_dots}//gr;
  ((( shift =~ s/$RE{inner_minus}/$1/gr) =~  s/$RE{non_digit}//gr ) =~ s/$RE{to_dots}/./gr ) =~ s/$RE{left_dots}//gr;
}

sub indexOf {# my $idx = indexOf(@array, $val);
  my $val = pop;
  my @array = ref $_[0] ? @{ shift(@_) } : @_ ;
  first { $array[$_] eq $val } 0..$#array;
}

1;