package CgdnaWeb::Controller::Auth;

use Mojo::Base 'Mojolicious::Controller';

use strict;

use Data::Dumper;

sub login {
  my $c = shift;
  
  my $username    = $c->param('wamusername') // '';
  my $password = $c->param('wampassword') // '';
  unless ( $username && $password ) {
    $c->stash('notice_message', "Login credentials are missing");
    $c->app->log->error("auth: could not find login credentials wamusername and/or wampassword in request parameters");
    return $c->redirect_to('index');
  }

  $c->app->log->debug("auth: checking user credentials: $username/$password");
  my $u = $c->authdb->check_creds($username, $password);
  if ( $u ) {
    $c->app->log->debug("auth: success validating credentials of $username");
    $c->session( wauserid => $u->userid );
    $c->stash( wauser => $u );
    $c->session( expiration => 0 );
    my $redirect_to = $c->session('auth_redirect_to');
    if ( $redirect_to ) {
      $c->app->log->debug("auth: login redirecting to original target ($redirect_to)");
      delete $c->session->{'auth_redirect_to'};
    }
    else {
      $redirect_to = 'index';
    }
    $c->redirect_to($redirect_to);
  }
  else {
    $c->stash('failed_message', "Login failed");
    $c->app->log->error("auth: could not validate $username / $password");
    $c->redirect_to('index');
  }
}

sub logout {
  my $c = shift;
  my $userid = $c->session('wauserid') // '_nosuchuser';
  $c->app->log->debug("auth: logout for $userid");
  $c->session(wauserid => '');
  $c->session(expires => 1);
  $c->redirect_to('index');
}

sub if_loggedin {
  my $c = shift;

  my $ip = $c->tx->remote_address;
  $c->stash( clientip => $ip);
  my $currurl = $c->url_for('current');

  if ( $c->config->{bypass_auth} ) {
    $c->app->log->info("if_loggedin: granting access to $currurl to generic user at $ip");
    return 1; ### MODIF PHV
  }

  my $userid = $c->is_loggedin();
  if ( $userid ) {
    $c->app->log->info("if_loggedin: granting access to $currurl to user $userid at $ip");
    return 1;
  }

  
  $c->app->log->info("if_loggedin: access denied from $ip, redirecting to authpage (auth_redirect_to=" . $currurl . ")"); 
  $c->session('auth_redirect_to' => $currurl);

  $c->stash('notice_message', 'Authentication is required, please login');
  $c->render( template => 'index' );
  return undef;
}


1;

