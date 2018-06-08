const mailer = require('nodemailer');

module.exports = class Email
{
    constructor(config) {
        this.transporter = mailer.createTransport(config);
    }

    send(options) {
        this.transporter.sendMail(options, function(error, info) {
            if (error) throw error;

            console.log("Email sent: " + info.response)
        });
    }
};