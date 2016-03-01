var comailer = require('comailer');

var config = require('./config');
var utils = require('./utils');
var ses = require('nodemailer-ses-transport');

if (config.mail_server.aws && config.mail_server.aws.accessKeyId)
    var mail_server_config = ses(config.mail_server.aws);
else
    var mail_server_config = config.mail_server;

// Config transporter
var transporter = comailer.createTransport(mail_server_config);

module.exports = function (options) {
    var mail_data = config.email;
    mail_data = utils.merge(mail_data, options);

    return transporter.sendMail(mail_data);
}
