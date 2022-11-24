package Authdb;

use strict;
use warnings;

use Data::Dumper;

# must implement load_user and check_cred

use MooX::Struct -rw,
  WAUser => [
    qw ( userid email lang username privlevel ),
    is_admin => sub { my $s = shift; return 1 if $s->privlevel && ( $s->privlevel >= 8 ); return 0; },
  ],
  ;

use Moo;
use namespace::clean;

has debug => ( is => 'rw', default => 0 );
has logger => ( is => 'rw', default => 0 );
has authdb => ( is => 'rw' );
has config => ( is => 'ro', required => 1 );

my $wausers = {
    phv => { userid => 'phv', email => 'philippe.voirol@epfl.ch', lang => 'en', username => 'phv', privlevel => 9 },
    debruin => { userid => 'debruin', email => 'lennart.debruin@epfl.ch', lang => 'en', username => 'debruin', privlevel => 9 },
    lcvmm => { userid => 'lcvmm', email => '', lang => 'en', username => 'lcvmm', privlevel => 9 },
};

my $wacreds = {
    phv => { userid => 'phv', password => 'phv' },
    debruin => { userid => 'debruin', password => 'lenny' },
    lcvmm => { userid => 'lcvmm', password => 'mozart1756' },
};

sub load_user {
  my $self = shift;
  my ($userid) = @_;
  my $user = WAUser->new( $wausers->{$userid} );
  return $user if $user->userid;
  warn "ERROR: load_user: could not load $userid\n";
  return;
}

sub check_creds {
  my $self = shift;
  my ($userid, $pw) = @_;

  my $u = $self->load_user($userid);
  unless ( $u ) {
    warn "ERROR: check_creds: no such user ($userid)\n";
    return 0;
  }
  my $creds = $wacreds->{$userid};
  unless ( $creds ) {
    warn "ERROR: check_creds: no creds for $userid\n";
    return;
  }

  unless ( $creds->{userid} eq $userid && $creds->{password} eq $pw ) {
    warn "ERROR: check_creds: bad credentials ($userid $pw)\n";
    return;
  }
  return $u;

}

1;
