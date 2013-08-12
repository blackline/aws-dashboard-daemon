var aws = require('aws-sdk'),
    firebase = require('firebase'),
    daemon = require('./daemon');

// Configure AWS
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1'
});

// Connect to the database
var firebaseConnection = new firebase(process.env.FIREBASE_URI);
firebaseConnection.auth(process.env.FIREBASE_AUTH_TOKEN, function(err) {
     if (err) {
        throw "Firebase auth failed: " +  err;
    }
});

process.on('uncaughtException', function(err) {
    console.log(err.stack);
});

// Start the daemon
daemon(firebaseConnection);
