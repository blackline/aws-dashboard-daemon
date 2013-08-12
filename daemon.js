var aws = require('aws-sdk'),
    firebase = require('firebase'),
    async = require('async'),
    ec2Prices = require('./ec2-prices.json'),
    rdsPrices = require('./rds-prices.json'),
    HOURS_PER_MONTH = 720;

var daemon = function (firebase) {
    var locals = {
        firebase: firebase,
        instances: [],
        ec2: new aws.EC2(),
        rds: new aws.RDS()
    };

    async.series([
        function (callback) {
            // Get a list of all ec2 instances
            console.log("Describing EC2 instances");
            locals.ec2.describeInstances(null, function (err, data) {
                if (err) return callback(err);

                for (var r in data.Reservations) {
                    for (var i in data.Reservations[r].Instances) {
                        var instance = data.Reservations[r].Instances[i];

                        // Add the monthly instance cos
                        instance.cost = Math.ceil(ec2Prices['on-demand'][instance.InstanceType] * HOURS_PER_MONTH);

                        // Convert the tags into key => value pairs
                        if (instance.Tags) {
                            for (var t in instance.Tags) {
                                var tag = instance.Tags[t];
                                delete instance.Tags[t];

                                instance.Tags[tag.Key] = tag.Value;
                            }
                        }
                        instance.id = instance.Tags.Name;

                        locals.instances[instance.Tags.Name] = instance;
                    }
                }

                callback();
            });
        },
        function (callback) {
            // Get a list of all rds instances
            console.log("Describing RDS instances");
            locals.rds.describeDBInstances(null, function (err, data) {
                if (err) return callback(err);

                for (var d in data.DBInstances) {
                    var instance = data.DBInstances[d];
                    instance.id = data.DBInstances[d].DBInstanceIdentifier;

                    var cost;
                    if (instance.MultiAZ === true) {
                        cost = rdsPrices['multi-az'][instance.DBInstanceClass];
                    } else {
                        cost = rdsPrices['standard'][instance.DBInstanceClass];
                    }
                    instance.cost = Math.ceil(cost * HOURS_PER_MONTH);
                    locals.instances[instance.id] = instance;
                }

                callback();
            });
        },
        function (callback) {
            console.log("Updating Firebase");
            firebase.child('instances').set(locals.instances);
            callback();
        }
    ], function (err) {
        if (err) throw err;

        console.log("Waiting " + (process.env.AWS_DAEMON_INTERVAL / 1000) + " seconds before running again");
        setTimeout(daemon, process.env.AWS_DAEMON_INTERVAL, locals.firebase);
    });
};

module.exports = daemon;
