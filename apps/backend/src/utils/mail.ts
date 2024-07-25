export function sendEmail(subjectEmail: string, toEmail: string, bodyEmail: string): boolean {
    const nodemailer = require('nodemailer')

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        port: 587, // true for 465, false for other ports
        host: 'smtp-mail.outlook.com',
        secureConnection: false,
        auth: {
            user: process.env.NODEMAILDER_EMAIL,
            pass: process.env.NODEMAILDER_PASSWORD,
        },
        tls: {
            ciphers: 'SSLv3',
        },
    })

    //email
    const mailData = {
        from: process.env.NODEMAILDER_EMAIL, // sender address
        to: toEmail, // list of receivers
        subject: subjectEmail,
        text: 'Last step',
        html: bodyEmail,
    }

    //send email
    transporter.sendMail(mailData, (err: any, info: any) => {
        if (err) {
            console.log(err)
            return false
        } else return true
    })

    return true
}
