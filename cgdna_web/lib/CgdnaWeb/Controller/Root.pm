package CgdnaWeb::Controller::Root;

use Mojo::Base 'Mojolicious::Controller';

use strict;

sub index {
  my $self = shift;
  $self->render('index');
}

sub isalive {
  my $self = shift;
  $self->render(text => 'i_am_alive');
}

1;

