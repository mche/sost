use Mojo::Base -strict;

sub now {
  my ($sec,$min,$hour,$mday,$mon,$year,) = localtime();#$wday,$yday,$isdst
  $mon++;
  return sprintf("dev%s-%s-%sT%s:%s:%s", $year+1900, length($mon) eq 1 ? "0$mon" : $mon, length($mday) eq 1 ? "0$mday" : $mday, length($hour) eq 1 ? "0$hour" : $hour, length($min) eq 1 ? "0$min" : $min, length($sec) eq 1 ? "0$sec" : $sec );
}

app->mode eq 'development'
  ? now()
  : qw(2020-01-22T13:03); # продуктивная версия штамп
