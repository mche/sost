package Email;

=pod
Отправка писем

!!! INSTALL
cpanm Email::Sender
cpanm Email::MIME
cpanm Authen::SASL
cpanm Net::SMTP::SSL
cpanm Net::SMTP::TLS
=cut

use Mojo::Base -base;
use Email::Sender::Simple qw(sendmail);
use Email::Sender::Transport::SMTP::Persistent;# qw()
use Email::MIME;

has smtp_port => 465;#25;
has smtp_ssl => 1;
has [qw(smtp_host smtp_user smtp_pw)];

has transport => sub {
  my $self = shift;
  Email::Sender::Transport::SMTP::Persistent->new({#
    ssl => $self->smtp_ssl,
    host => $self->smtp_host,
    port => $self->smtp_port,
    sasl_username=>$self->smtp_user,
    sasl_password=>$self->smtp_pw, 
  });
};

sub send {
  my $self = shift;
  my %arg = (
    # from, to, cc, bcc, subject, body
    content_type=>'text/html',
    charset=>'UTF-8',
    encoding => 'Base64',
    #~ smtp_user => (grep {$_} map {$self->{$_}} qw(sasl_username sasl_user sasl_login smtp_username smtp_user smtp_login))[0],
    #~ smtp_pw => (grep {$_} map {$self->{$_}} qw(sasl_password sasl_passwd sasl_pw smtp_passwd smtp_password smtp_pw))[0],
    @_,
  );
  my $message = Email::MIME->create(
    header_str => [
      From=>$arg{from} || $arg{From} || $self->smtp_user,
      To=>$arg{to} || $arg{To} ,
      Subject=>$arg{Subject} || $arg{subject} || '<Без темы>',
      map { $_ => $arg{$_} } grep($arg{$_}, qw(Cc Reply-To)),
      #~ $arg{bcc} ? НЕ ТУТ! ниже в sendmail
      #~ 'X-Mailer'=> "Email::Sender::Simple $Email::Sender::VERSION",
      #~ 'X-Hello'=>'Dolly',
      #~ 'X-Spam'=> 'Not detected',
    ],
    attributes => {content_type=>$arg{content_type}, charset=>$arg{charset}, encoding => $arg{encoding},},
    $arg{body} ? (body_str   => $arg{body}) : (),
    $arg{parts} ? (parts => $arg{parts}) : (),
  );
  my $send = sendmail(
      $message,
      {
        $arg{bcc} ? (to => $arg{bcc}) : (),#[ref $arg{bcc} eq 'ARRAY' ? $arg{bcc} : 
        #~ from => $self->smtp_user,# ???$arg{smtp_user} || 
        transport => $self->transport,
      },
    );
  #~ return "Ошибка отправки ➜ [$arg{to}]:", $send
    #~ unless $send =~ /Success/i;
  #~ return join("\n", "Успешно ➜ [$arg{to} :", @{$arg{bcc} || []}, $send);
  return $send;
}

sub send_message {
  my ($self, $message) = @_;
  sendmail(
    $message,
    {
      #~ $arg{bcc} ? (to => $arg{bcc}) : (),#[ref $arg{bcc} eq 'ARRAY' ? $arg{bcc} : 
      #~ from => $self->smtp_user,# ???$arg{smtp_user} || 
      transport => $self->transport,
    },
  );
  
}

sub DESTROY {
  my $self = shift;
  $self->transport->disconnect;
    #~ if $self->transport;
  #~ delete $self->{transport};
  
}


1;