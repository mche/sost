package Discogs::Util;
use Mojo::Base -base;
use Exporter 'import';
#~ use Mojo::JSON qw(decode_json encode_json);
#~ use Encode qw(encode decode);
#~ use Mojo::Util qw(html_unescape);
use  Regexp::Common;

#~ our @EXPORT_OK = qw(json_enc json_dec);
our @EXPORT_OK = qw(split_role);

#~ sub json_enc {
  #~ decode('utf-8', encode_json(shift));
  
#~ }

#~ sub json_dec {
  #~ decode_json(encode('utf-8', shift));
#~ }

sub split_role {# парсинг ролей в релизах - проблема запятых в скобках
=pod
Design [Logos, Visuels], Artwork
Recorded By, Mixed By [Assistant]
Written-By [Sample "Hey, Joe"] 
=cut
  my $str = shift
    or return undef;
  #~ warn 'SPLIT_ROLE: ', $str;
  my @par = $str =~ /$RE{balanced}{-parens=>'()[]'}/g;
  $str =~ s/$RE{balanced}{-parens=>'()[]"'}/%s/g;
  $str =~ s/\s*,\s*/\n/g;
  return [split /\n/, sprintf($str, @par)];
  
}


1;