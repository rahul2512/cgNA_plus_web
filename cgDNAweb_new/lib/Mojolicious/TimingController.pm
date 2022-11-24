package Mojolicious::TimingController;

use Mojo::Base 'Mojolicious::Controller';

use strict;

use Time::HiRes  ();

sub rendered {
  my ($self, $status) = @_;

  my $res = $self->res;
  $res->code($status || 200) if $status || !$res->code;

  # Finish transaction
  my $stash = $self->stash;
  if (!$stash->{'mojo.finished'} && ++$stash->{'mojo.finished'}) {

    # Disable auto rendering and stop timer
    my $app = $self->render_later->app;
    if (my $started = delete $stash->{'mojo.started'}) {
      my $elapsed
      = Time::HiRes::tv_interval($started, [Time::HiRes::gettimeofday()]);
      my $rps  = $elapsed == 0 ? '??' : sprintf '%.3f', 1 / $elapsed;
      my $code = $res->code; 
      my $msg  = $res->message || $res->default_message($code);
      $app->log->info("service time (${elapsed}s, $rps/s)");
    } 

    $app->plugins->emit_hook_reverse(after_dispatch => $self);
    $app->sessions->store($self);
  } 
  $self->tx->resume;
  return $self;
}


1;
