package CgdnaWeb::Controller::Root;

use Mojo::Base 'Mojolicious::Controller';

use strict;

sub index {
  my $self = shift;
  $self->render('index');
}

1;

