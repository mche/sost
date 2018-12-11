package Util;
use Mojo::Base -strict;
use List::Util qw(first); # indexOf
use Data::Dumper 'Dumper';

use Exporter 'import';

# Defer to runtime so Mojo::Util can use "-strict"
require Mojo::Util;

my %RE = (
  inner_minus => qr/(\S\s*)-+/, # минусы внутри 
  non_digit => qr/[^\d,.\-]/, # почикать буквы пробелы
  to_dots => qr/,/, # только точки
  to_commas=>qr/\./, # только запят
  left_dots => qr/(\.)(?=.*\1)/, # останется только одна точка справа
  left_commas => qr/(\.)(?=.*\1)/, # останется только одна  справа
);

our @EXPORT_OK = qw(numeric money float indexOf );#dump_val

# Aliases
monkey_patch(__PACKAGE__, 'float',    \&numeric);

# Declared in Mojo::Base to avoid circular require problems
sub monkey_patch { Mojo::Util::monkey_patch(@_) }

sub numeric {
  #~ (( shift =~ s/$RE{non_digit}//gr) =~ s/$RE{to_dots}/./gr )=~ s/$RE{left_dots}//gr;
  ((( shift =~ s/$RE{inner_minus}/$1/gr) =~  s/$RE{non_digit}//gr ) =~ s/$RE{to_dots}/./gr ) =~ s/$RE{left_dots}//gr;
}

sub money {
  #~ (( shift =~ s/$RE{non_digit}//gr) =~ s/$RE{to_dots}/./gr )=~ s/$RE{left_dots}//gr;
  ((( shift =~ s/$RE{inner_minus}/$1/gr) =~  s/$RE{non_digit}//gr ) =~ s/$RE{to_commas}/,/gr ) =~ s/$RE{left_commas}//gr;
}

sub indexOf {# my $idx = indexOf(@array, $val);
  my $val = pop;
  my @array = ref $_[0] ? @{ shift(@_) } : @_ ;
  first { $array[$_] eq $val } 0..$#array;
}

=pod

=head1 dump_val($data);

Выдать все значения структуры в массиве


my $foo = {
    alpha => [ 'beta', \ 'gamma' ],
    one => { two => { three => 3, four => 3.141 },
             five => { six => undef, seven => \*STDIN },
    },
    foobar => sub { print "Hello, world!\n"; },
};

my @vals =  dump_val($foo);

sub dump_val {
    my ($var) = @_;
    return $var
      unless ref $var;
    my @rv;
    local $Data::Dumper::Indent = 0;
    local $Data::Dumper::Terse = 1;
    if (ref $var eq 'ARRAY') {
      push @rv, dump_val($var->[$_])
        for (0 .. $#$var);
    } elsif (ref $var eq 'HASH') {
      push @rv, dump_val($var->{$_})
        for (sort keys %$var);
    } elsif (ref $var eq 'SCALAR') {
        push @rv, dump_val($$var);
    } else {
        push @rv, Dumper($var);
    }
    return @rv;
}
=cut
1;