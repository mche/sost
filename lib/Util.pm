package Util;
use Mojo::Base -strict;

use Exporter 'import';

my %RE = (
  non_digit => qr/\D/, # почикать буквы пробелы
  #~ dots => qr/\D/, # только точки
  left_dots => qr/(\.)(?=.*\1)/, # останется только одна точка справа
);

our @EXPORT_OK = qw(numeric float);

# Aliases
monkey_patch(__PACKAGE__, 'float',    \&numeric);

# Declared in Mojo::Base to avoid circular require problems
sub monkey_patch { Mojo::Base::_monkey_patch(@_) }

sub numeric {
  #~ (( shift =~ s/$RE{non_digit}//gr) =~ s/$RE{dots}/./gr )=~ s/$RE{left_dots}//gr;
  ( shift =~ s/$RE{non_digit}/./gr )=~ s/$RE{left_dots}//gr;
}

1;