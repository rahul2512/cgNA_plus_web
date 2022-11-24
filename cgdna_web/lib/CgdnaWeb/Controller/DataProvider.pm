package CgdnaWeb::Controller::DataProvider;

#use Mojo::Base 'Mojolicious::Controller';
use Mojo::Base 'Mojolicious::TimingController';

use Data::Dumper;
use IO::File;
use Mojo::IOLoop::ReadWriteFork;

# load data from local JSON file
sub data1 {
  my $c = shift;

  my $seq_id = $c->param('seq_id');

  unless ( $seq_id ) {
    $c->app->log->error("no seq_id, returning nothing");
    $c->render(text => '');
  }

  $c->app->log->debug("loading seq_id $seq_id");

  my $filename = sprintf("%s/%s.json", $c->config->{datadir}, $seq_id);
  $c->app->log->debug("loading file $filename");

  my $fh = IO::File->new($filename, "r");
  unless ( $fh ) {
    $c->app->log->error("cannot read $filename : $!");
    $c->render(text => '');
  }
  my $json = join('', $fh->getlines);
  $fh->close;

  $c->render(text => $json);
  
}

# calculate data by calling shapes program as a coprocess
sub data2 {
  my $c = shift;

  my $seq_id;
  my $param_id;
  if ( $c->req->method eq 'GET' ) { 
    $seq_id = $c->param('seq_id');
    $c->app->log->debug("getting seq_id via GET");
  }
  else {
    $seq_id = $c->req->param('seq_input');
    $param_id = $c->req->param('param_input');
    $c->app->log->debug("getting seq_id, param_id via POST");
  }

  unless ( $seq_id && $param_id ) {
    $c->app->log->error("no seq_id or param_id, returning dummy response");
    $c->render(text => qq/{ "status" : "KO", "error" : "no seq_id or param_id" }/);
  }

  $c->app->log->info(sprintf(q{dataprovider: processing param_id=%s, seq_id=%s}, $param_id, $seq_id));
  $c->render_later;

  $ENV{'PARAMDIR'} = $c->config->{shapes_dir};

  my $f = Mojo::IOLoop::ReadWriteFork->new;
  $c->stash( forker => $f);

  # Mojo::IOLoop->stream($c->tx->connection)->timeout(60);
  if ( $c->config->{request_timeout} ) {
    Mojo::IOLoop->stream($c->tx->connection)->timeout($c->config->{request_timeout});
  }

  my $json = '';

  $f->on('read' => sub {
      my ($fork, $buf) = @_;
      $json .= $buf;
    }
  );

  $f->on('close' => sub {
      my ($fork, $rc, $signo) = @_;
      # $c->app->log->debug("forked process done: json=" . Dumper($json));
      $c->render(text => $json);
    }
  );

  $f->on('error' => sub {
      my ($fork, $error) = @_;
      $c->app->log->error("forked process error : $error");
    }
  );

  my @shapemaker_cmd = (
    sprintf("%s/%s", $c->config->{shapes_dir}, $c->config->{shapes_builder}),
    $seq_id,
    $param_id
  );
  
  $c->app->log->debug("executing shapemaker command : " . join(" ", @shapemaker_cmd)) if $c->config->{verbose};

  $f->run(@shapemaker_cmd);

  # alternative call method :
  #my %kidenv = %ENV;
  #%kidenv{'PARAMDIR'} = $c->config->{shapes_dir};
  #$f->start( {
  #   program => sprintf("%s/%s", $c->config->{shapes_dir}, $c->config->{shapes_builder}),
  #   program_args => [ $seq_id ],
  #   env => \%kidenv,
  #});
  
}

# calculate data by calling make_CSC program as a coprocess
sub data3 {
  my $c = shift;

  my $seq_id;
  my $param_id;
  if ( $c->req->method eq 'GET' ) { 
    $seq_id = $c->param('seq_id');
    $c->app->log->debug("getting seq_id via GET");
  }
  else {
    $seq_id = $c->req->param('seq_input');
    $param_id = $c->req->param('param_input');
    $c->app->log->debug("getting seq_id, param_id via POST");
  }

  unless ( $seq_id && $param_id ) {
    $c->app->log->error("no seq_id or param_id, returning dummy response");
    $c->render(text => qq/{ "status" : "KO", "error" : "no seq_id or param_id" }/);
  }

  $c->app->log->info("processing seq_id: $seq_id");
  $c->app->log->info("processing param_id: $param_id");
  $c->render_later;

  $ENV{'PARAMDIR'} = $c->config->{shapes_dir};

  my $f = Mojo::IOLoop::ReadWriteFork->new;
  $c->stash( forker => $f);

  # Mojo::IOLoop->stream($c->tx->connection)->timeout(60);
  if ( $c->config->{request_timeout} ) {
    Mojo::IOLoop->stream($c->tx->connection)->timeout($c->config->{request_timeout});
  }

  my $json = '';

  $f->on('read' => sub {
      my ($fork, $buf) = @_;
      $json .= $buf;
    }
  );

  $f->on('close' => sub {
      my ($fork, $rc, $signo) = @_;
      # $c->app->log->debug("forked process done: json=" . Dumper($json));
      $c->render(text => $json);
    }
  );

  $f->on('error' => sub {
      my ($fork, $error) = @_;
      $c->app->log->error("forked process error : $error");
    }
  );

  my @csc_maker_cmd = (
    sprintf("%s/%s", $c->config->{shapes_dir}, $c->config->{csc_builder}),
    $seq_id,
    $param_id
  );
  
  $c->app->log->debug("executing csc_maker command : " . join(" ", @csc_maker_cmd)) if $c->config->{verbose};

  $f->run(@csc_maker_cmd);

  # alternative call method :
  #my %kidenv = %ENV;
  #%kidenv{'PARAMDIR'} = $c->config->{shapes_dir};
  #$f->start( {
  #   program => sprintf("%s/%s", $c->config->{shapes_dir}, $c->config->{shapes_builder}),
  #   program_args => [ $seq_id ],
  #   env => \%kidenv,
  #});
  
}

# FOR shapes+
# calculate data by calling shapes program as a coprocess 
sub data4 {
  my $c = shift;

  my $seq_id;
  my $param_id;
  if ( $c->req->method eq 'GET' ) { 
    $seq_id = $c->param('seq_id');
    $c->app->log->debug("getting seq_id via GET");
  }
  else {
    $seq_id = $c->req->param('seq_input');
    $param_id = $c->req->param('param_input');
    $c->app->log->debug("getting seq_id, param_id via POST");
  }

  unless ( $seq_id && $param_id ) {
    $c->app->log->error("no seq_id or param_id, returning dummy response");
    $c->render(text => qq/{ "status" : "KO", "error" : "no seq_id or param_id" }/);
  }

  $c->app->log->info(sprintf(q{dataprovider: processing param_id=%s, seq_id=%s}, $param_id, $seq_id));
  $c->render_later;

  $ENV{'PARAMDIR'} = $c->config->{shapes_dir};

  my $f = Mojo::IOLoop::ReadWriteFork->new;
  $c->stash( forker => $f);

  # Mojo::IOLoop->stream($c->tx->connection)->timeout(60);
  if ( $c->config->{request_timeout} ) {
    Mojo::IOLoop->stream($c->tx->connection)->timeout($c->config->{request_timeout});
  }

  my $json = '';

  $f->on('read' => sub {
      my ($fork, $buf) = @_;
      $json .= $buf;
    }
  );

  $f->on('close' => sub {
      my ($fork, $rc, $signo) = @_;
      # $c->app->log->debug("forked process done: json=" . Dumper($json));
      $c->render(text => $json);
    }
  );

  $f->on('error' => sub {
      my ($fork, $error) = @_;
      $c->app->log->error("forked process error : $error");
    }
  );

  my @shapemaker_cmd = (
    sprintf("%s/%s", $c->config->{shapes_dirp}, $c->config->{shapes_builder}),
    $seq_id,
    $param_id
  );
  
  $c->app->log->debug("executing shapemaker command : " . join(" ", @shapemaker_cmd)) if $c->config->{verbose};

  $f->run(@shapemaker_cmd);

}


1;
