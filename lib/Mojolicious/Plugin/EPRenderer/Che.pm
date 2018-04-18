package Mojolicious::Plugin::EPRenderer::Che;
use Mojo::Base 'Mojolicious::Plugin::EPRenderer';

use Mojo::Template;
use Mojo::Util qw(encode md5_sum monkey_patch);

#~ sub DESTROY { Mojo::Util::_teardown(shift->{namespace}) }

sub register {
  my ($self, $app, $conf) = @_;
  
  ###### EPLRenderer #######
  $app->renderer->add_handler(
    epl => sub { _render(@_, Mojo::Template->new, $_[1]) });

  ###### EPRenderer #######
  # Auto escape by default to prevent XSS attacks
  my $ep = {auto_escape => 1, %{$conf->{template} || {}}, vars => 1};
  my $ns = $self->{namespace} = $ep->{namespace}
    //= 'Mojo::Template::Sandbox::' . md5_sum "$self";
  
  #~ _helpers($ns, $app->renderer->helpers);

  # Make "$self" and "$c" available in templates
  $ep->{prepend} = 'my $self = my $c = _C;' . ($ep->{prepend} // '');

  # Add "ep" handler and make it the default
  $app->renderer->default_handler('ep')->add_handler(
    $conf->{name} || 'ep' => sub {
      my ($renderer, $c, $output, $options) = @_;

      my $name = $options->{inline} // $renderer->template_path($options) || $renderer->template_name($options);###patch
      return unless defined $name;
      my $key = md5_sum encode 'UTF-8', $name;

      my $cache = $renderer->cache;
      my $mt    = $cache->get($key);
      $cache->set($key => $mt = Mojo::Template->new($ep)) unless $mt;

      # Export helpers only once
      ++$self->{helpers} and _helpers($ns, $renderer->helpers)
        unless $self->{helpers};

      # Make current controller available and render with "epl" handler
      no strict 'refs';
      no warnings 'redefine';
      local *{"${ns}::_C"} = sub {$c};
      _render($renderer, $c, $output,###patch Mojolicious::Plugin::EPLRenderer::
        $options, $mt, $c->stash);
    }
  );
}

sub _helpers {### EPRenderer
  my ($class, $helpers) = @_;
  for my $method (grep {/^\w+$/} keys %$helpers) {
    my $sub = $helpers->{$method};
    monkey_patch $class, $method, sub { $class->_C->$sub(@_) };
  }
}

sub _render {### EPLRenderer
  my ($renderer, $c, $output, $options, $mt, @args) = @_;

  # Cached
  if ($mt->compiled) {
    $c->app->log->debug("Rendering cached @{[$mt->name]}");
    $$output = $mt->process(@args);
  }

  # Not cached
  else {
    my $inline = $options->{inline};
    my $name = defined $inline ? md5_sum encode('UTF-8', $inline) : undef;
    return unless defined($name //= $renderer->template_path($options) || $renderer->template_name($options));###patch

    # Inline
    if (defined $inline) {
      $c->app->log->debug(qq{Rendering inline template "$name"});
      $$output = $mt->name(qq{inline template "$name"})->render($inline, @args);
    }

    # File
    else {
      if (my $encoding = $renderer->encoding) { $mt->encoding($encoding) }

      # Try template
      if (defined(my $path = $renderer->template_path($options))) {
        $c->app->log->debug(qq{Rendering template "$name"});
        $$output = $mt->name(qq{template "$name"})->render_file($path, @args);
      }

      # Try DATA section
      elsif (defined(my $d = $renderer->get_data_template($options))) {
        $c->app->log->debug(qq{Rendering template "$name" from DATA section});
        $$output = $mt->name(qq{template "$name" from DATA section})
          ->render($d, @args);
      }

      # No template
      else { $c->app->log->debug(qq{Template "$name" not found}) }
    }
  }

  # Exception
  die $$output if ref $$output;
}

1;

=encoding utf8

=head1 NAME

Mojolicious::Plugin::EPRenderer::Che - Embedded Perl renderer plugin

=head1 SYNOPSIS

  # Mojolicious
  $app->plugin('EPRenderer::Che');
  $app->plugin('EPRenderer::Che' => {name => 'foo'});
  $app->plugin('EPRenderer::Che' => {name => 'bar', template => {line_start => '.'}});

  # Mojolicious::Lite
  plugin 'EPRenderer::Che';
  plugin 'EPRenderer::Che' => {name => 'foo'};
  plugin 'EPRenderer::Che' => {name => 'bar', template => {line_start => '.'}};

=head1 DESCRIPTION

L<Mojolicious::Plugin::EPRenderer::Che> is a renderer for Embedded Perl templates.
For more information see L<Mojolicious::Guides::Rendering/"Embedded Perl">.

See L<Mojolicious::Plugins/"PLUGINS"> for a list of plugins that are available
by default.


=head1 SEE ALSO

See L<Mojolicious::Plugin::EPRenderer> for more info.

=cut
