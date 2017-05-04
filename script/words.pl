open F, $ARGV[0] || die $!;
my $lines = 0;
my @words = ();
++$lines
  and push @words, /(\S+)/g
  while <F>;
printf "%8d %8d\n", $lines, scalar(@words);
close(F);