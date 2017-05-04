use Mojo::Base -strict;
use Image::Magick;
use Getopt::Long;
#~ use Mojo::UserAgent;

=pod
Запускать по крону

cd <корень проекта>
perl -w script/captcha.pl --count=100

Генерирует 100 картинок в папке (static/captcha/ по умолчанию)

Контроллер lib/Profile.pm::captcha считывает список картинок этой папки

=cut

# http://dimio.org/captcha-perl-generaciya-pri-pomoshhi-imagemagick.html
# 

#~ my $ua = Mojo::UserAgent->new;

#~ my $tx =  $ua->get('http://juick.com/');
#~ die grep length > 6 && /[а-я]/i,  split /\W+/, $tx->res->dom->find('#content article p')->map('all_text')->join("\n");

my @letter = (0..9,  );#map(chr, (0x430..(0x430 + 31))),
#map(uc chr, (0x430..(0x430 + 31))),
#~ warn @letter;

my %conf = (
  color          => 'teal',#
  bgcolor        => 'white',
  size           => 100,
  wave_amplitude => 50,
  wave_length    => 1700,
  filepath=>'static/captcha/',
  count => 1,
);

GetOptions (\%conf, 'count=i');


captcha() for (1..$conf{count});

sub captcha {
  my ($self,$code) = @_;
  
  $code ||= join('', map $letter[int rand @letter], (1..6) ),
  
  my $img = Image::Magick->new(size => '1000x1000', magick => 'png');
  my $x; $x = $img->Read('gradient:#ffffff-#ffffff');
  
  $x = $img->Annotate(
    pointsize   => $conf{'size'}, 
    fill        => $conf{color},
    #~ stroke => $conf{color},
    text        => $code, # || $conf{code}).' ', 
    geometry    => '+0+' . $conf{'size'},#,
    $conf{'font'} ? (font => $conf{'font'}) : (),
    #~ scale=>'2000,1000',
  );
  
  for (1..5) {
    my @from = (-(int rand 100), (int rand 200));
    my @to = ((int rand 400)+(int rand 400), (int rand 100)+(int rand 100));
    $x = $img->Draw(stroke=>$conf{bgcolor}, strokewidth=>3, bordercolor=>$conf{bgcolor}, fill=>$conf{color}, primitive=>'line', points=>sprintf("%i,%i %i,%i", @from, @to), );#'0,50 400,100'
    warn $x if $x;
  }
  
  $x = $img->Trim;
  warn $x if $x;
  
  
  
  $x = $img->Resize(height=>2000, width=>1000,  filter=>'Bessel', blur=>1);# Point, Box, Triangle, Hermite, Hanning, Hamming, Blackman, Gaussian, Quadratic, Cubic, Catrom, Mitchell, Lanczos, Bessel, Sinc}
  warn $x if $x;
  
  #~ $x = $img->Crop('2100x1100-100-100')
      #~ and warn $x;
  
  $x = $img->Rotate(degrees=>80+(int rand 20)); warn $x if $x;
  
  $x = $img->Swirl( degrees     =>  int(rand(14))+37,); warn $x if $x;
  $x = $img->Wave(amplitude => $conf{'wave_amplitude'}, wavelength => $conf{'wave_length'}, interpolate=>'spline');# interpolate=>{undefined, average, bicubic, bilinear, mesh, nearest-neighbor, spline}
  warn $x if $x;
  
  $x = $img->Resize(height=>200, width=>100,  filter=>'Box', blur=>1);# Point, Box, Triangle, Hermite, Hanning, Hamming, Blackman, Gaussian, Quadratic, Cubic, Catrom, Mitchell, Lanczos, Bessel, Sinc}
  warn $x if $x;
  
  $x = $img->Rotate(degrees=> -100 + (int rand 20));#
  warn $x if $x;
  
  $x = $img->Write('png:' . "$conf{filepath}$code.png");
    warn $x if $x;
    
  
  return;
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  #~ $x = $img->Roll(x =>  101+int(rand(4)),); warn $x if $x;
  
  $x = $img->Swirl( degrees     =>  int(rand(14))+37,); warn $x if $x;
  
  
  
  #~ $x = $img->Spread(radius=>1, );#interpolate=>'spline'{undefined, average, bicubic, bilinear, mesh, nearest-neighbor, spline}
  #~ warn $x if $x;

  $x = $img->Wave(amplitude => $conf{'wave_amplitude'}, wavelength => $conf{'wave_length'}, interpolate=>'spline');# interpolate=>{undefined, average, bicubic, bilinear, mesh, nearest-neighbor, spline}
  warn $x if $x;
  
  
  $x = $img->Rotate(degrees=>(int rand 2 == 1 ? 90 : 0) - (int rand 45));
  warn $x if $x;
  
  #~ $x = $img->Shade(geometry=>'+0+' . $conf{'size'}, azimuth=>58, elevation=>100, gray=>0);
  #~ warn $x if $x;
  
  #~ $x = $img->Resize(height=>200, width=>200,  filter=>'Gaussian', blur=>1);# Point, Box, Triangle, Hermite, Hanning, Hamming, Blackman, Gaussian, Quadratic, Cubic, Catrom, Mitchell, Lanczos, Bessel, Sinc}
  #~ warn $x if $x;
  
  $x = $img->Trim;
  warn $x if $x;
  
  
  $x = $img->Write('png:' . "$conf{filepath}$code.png");
  warn $x if $x;

}
