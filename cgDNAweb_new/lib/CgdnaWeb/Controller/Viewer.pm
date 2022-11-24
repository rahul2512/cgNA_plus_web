package CgdnaWeb::Controller::Viewer;
use Mojo::Base 'Mojolicious::Controller';

sub view1 {
  my $self = shift;
  $self->render(template => 'viewer/view1', msg => 'test1');
}

sub view2 {
  my $self = shift;
  $self->render(template => 'viewer/view2', msg => 'test2');
}

1;
