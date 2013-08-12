AWS Dashboard Daemon
====================

Daemon for the [AWS Dashboard](https://github.com/blackline/aws-dashboard), which
manages and displays a list of applications consisting of groups of EC2 and RDS instances.

Requirements
============

* A [Heroku](https://www.heroku.com/) account
* An [Amazon AWS](http://aws.amazon.com/) account
* Your Amazon AWS Access Key and Secret Key

Setup
=====

Modify your Firebase Security to disable unauthenticated read and write access:

    {
        "rules": {}
    }

Create your Heroku application

    git clone git@github.com:blackline/aws-dashboard-daemon.git
    cd aws-dashboard-daemon
    heroku apps:create [your-application-name]

The Heroku config variables which need to be set are:

* AWS_DAEMON_INTERVAL - How often, in milliseconds, should the AWS daemon run.
* AWS_ACCESS_KEY - Your AWS Access key. Requires at least `read` level privileges for EC2 and RDS.
* AWS_ACCESS_KEY - Your AWS Secret key.
* FIREBASE_AUTH_TOKEN - The Auth Token for your Firebase data store.
* FIREBASE_URI - The URI to your Firebase data store.

Set the Heroku config variables:

    heroku config:set AWS_DAEMON_ENABLED=1 \
                      AWS_DAEMON_INTERVAL=300000 \
                      AWS_ACCESS_KEY=FOO_BAR_BAZ \
                      AWS_SECRET_KEY=SECRET \
                      FIREBASE_AUTH_TOKEN=SECRET \
                      FIREBASE_URI=https://YOUR_APP.firebaseio.com/
