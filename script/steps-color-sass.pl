use strict;

my $name = 'green-forest';
my $color = '#008000';
my $steps = 5;

my @darken = stepsColor($color, '#000000', $steps);# к черному
my @lighten = stepsColor($color, '#ffffff', $steps); # к белому

print qq|\$$name: (\n  "base":       $color,\n|, map(qq|  "lighten-$_": |.$lighten[$_-1].qq|,\n|, (1..$steps)), map(qq|  "darken-$_": |.$darken[$_-1].qq|,\n|, (1..$steps)), ");\n";

sub stepsColor {
=pod
Массив оттенков с шагом

#stepsColor('#800000', '#ffffff', 6)
javascript:
function stepsColor(startColor, endColor, steps) {
   var startR = parseInt(startColor.slice(1,3), 16),
    endR = parseInt(endColor.slice(1,3), 16),
    startG = parseInt(startColor.slice(3,5), 16),
    endG = parseInt(endColor.slice(3,5), 16),
    startB = parseInt(startColor.slice(5,7), 16),
    endB = parseInt(endColor.slice(5,7), 16),
    dR = (endR - startR)/steps,
    dG = (endG - startG)/steps,
    dB = (endB - startB)/steps,
    stepsHex  = new Array()
  ;
   for(var i = 0; i <= steps; i++) {
     var stepR = Math.round(startR + dR * i) || '00';
     var stepG = Math.round(startG + dG * i) || '00';
     var stepB = Math.round(startB + dB * i) || '00';
     stepsHex[i] = '#' + stepR.toString(16)  + stepG.toString(16)  + stepB.toString(16);
   }
   return stepsHex;
}
=cut
  my ($startColor, $endColor, $steps) = @_;
  my @startColor = map hex, $startColor =~ /(\w{2})(\w{2})(\w{2})/;
  my @endColor = map hex, $endColor =~ /(\w{2})(\w{2})(\w{2})/;
  my @diff = map(($endColor[$_] - $startColor[$_])/($steps+1), (0..2));
  
  my @out = ();
  
  for my $s (1..$steps) {
    push @out, '#'.join('', map(sprintf("%x", int($startColor[$_]+$diff[$_]*$s + 0.5)) || '00', (0..2)));# + 0.5 для округления через int
  }
  
  return @out;
}
