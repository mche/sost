use Data::Dumper 'Dumper';


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

my $foo = {
    alpha => [ 'ывдкж', \'gamma', ['молодец""'], undef, ],
    one => { two => { three => 3, four => 3.141 },
             five => { six => undef, seven => \*STDIN },
    },
    foobar => sub { print "Hello, world!\n"; },
};

print dump_val($foo);