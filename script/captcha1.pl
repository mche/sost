use Mojo::Base -strict;
use Image::Magick;
#~ use Mojo::UserAgent;

# http://dimio.org/captcha-perl-generaciya-pri-pomoshhi-imagemagick.html
# 

#~ my $ua = Mojo::UserAgent->new;

#~ my $tx =  $ua->get('http://juick.com/');
#~ die grep length > 6 && /[а-я]/i,  split /\W+/, $tx->res->dom->find('#content article p')->map('all_text')->join("\n");

my @letter = (1..5, 7..9,  map(chr, (0x430..(0x430 + 31))),);
#map(uc chr, (0x430..(0x430 + 31))),
#~ warn @letter;

my $conf = {
  color          => 'teal',#
  bgcolor        => 'white',
  size           => 100,
  wave_amplitude => 50,
  wave_length    => 100,
  code=>join('', map $letter[int rand @letter], (1..6) ),
  #~ code => "126*70",
  #~ %$conf,
};

$conf->{filename} = "static/captcha/$conf->{code}.png";

captcha();

sub captcha {
  my ($self,$code) = @_;
  
  my $img = Image::Magick->new(size => '400x400', magick => 'png');
  my $x; $x = $img->Read('gradient:#ffffff-#ffffff');
  
  $x = $img->Annotate(
    pointsize   => $conf->{'size'}, 
    fill        => $conf->{'color'}, 
    text        => ($code || $conf->{code}).' ', 
    geometry    => '+0+' . $conf->{'size'},
    $conf->{'font'} ? (font => $conf->{'font'}) : (),
  );
  
  $x = $img->Resize(height=>3000, width=>700,  filter=>'Box', blur=>1);# Point, Box, Triangle, Hermite, Hanning, Hamming, Blackman, Gaussian, Quadratic, Cubic, Catrom, Mitchell, Lanczos, Bessel, Sinc}
  warn $x if $x;
  
  #~ $x = $img->Roll(x =>  101+int(rand(4)),); warn $x if $x;
  
  $x = $img->Swirl( degrees     =>  int(rand(14))+37,); warn $x if $x;
  
  #~ $x = $img->Spread(radius=>1, );#interpolate=>'spline'{undefined, average, bicubic, bilinear, mesh, nearest-neighbor, spline}
  #~ warn $x if $x;
  
  warn $x if $x;
  $x = $img->Wave(amplitude => $conf->{'wave_amplitude'}, wavelength => $conf->{'wave_length'}, interpolate=>'spline');# interpolate=>{undefined, average, bicubic, bilinear, mesh, nearest-neighbor, spline}
  warn $x if $x;
  
  
  $x = $img->Rotate(degrees=>(int rand 2 == 1 ? 90 : 0) - (int rand 45));
  warn $x if $x;
  
  #~ $x = $img->Shade(geometry=>'+0+' . $conf->{'size'}, azimuth=>58, elevation=>100, gray=>0);
  #~ warn $x if $x;
  
  #~ $x = $img->Resize(height=>200, width=>200,  filter=>'Gaussian', blur=>1);# Point, Box, Triangle, Hermite, Hanning, Hamming, Blackman, Gaussian, Quadratic, Cubic, Catrom, Mitchell, Lanczos, Bessel, Sinc}
  #~ warn $x if $x;
  
  $x = $img->Trim;
  warn $x if $x;
  
  my $body = '';
  
  {
    #~ my $fh = File::Temp->new(UNLINK => 1, DIR => $ENV{MOJO_TMPDIR} || File::Spec->tmpdir);
    $x = $img->Write('png:' . $conf->{filename});
    warn $x if $x;
    #~ open $fh, '<', $fh->filename;
    #~ local $/;
    #~ $body = <$fh>;
  }
  #~ return $body;
}
