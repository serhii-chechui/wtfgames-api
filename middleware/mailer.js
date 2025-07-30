const { log } = require('console');
const nodemailer = require('nodemailer');
const path = require("path");
const dotenv = require('dotenv').config();

exports.sendEmail = (req, res, next) => {

    let email = req.body.email;

    if (email !== "") {

        console.log(process.env.ADMIN_MAIL);
        console.log(process.env.ADMIN_PASS);

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: process.env.ADMIN_MAIL,
                pass: process.env.ADMIN_PASS
            }
        });

        // Message object
        let message = {
            from: process.env.ADMIN_MAIL,
            to: `Recipient <${email}>`,
            subject: 'Подарунковий сертифікат від BySadovskiy!',
            text: 'Вітаємо! Ви отримали подарунковий сертифікат від BySadovskiy!',
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>@font-face{font-family:Mak-Light;src:url(https://s3.eu-central-1.amazonaws.com/com.wtfgames.bysadovskiy/fonts/MAK.ttf) format('truetype'),url(https://s3.eu-central-1.amazonaws.com/com.wtfgames.bysadovskiy/fonts/MAK.otf) format('opentype');font-weight:400;font-style:normal}@font-face{font-family:Montserrat-Regular;src:url(https://s3.eu-central-1.amazonaws.com/com.wtfgames.bysadovskiy/fonts/Montserrat-Regular.ttf) format('truetype');font-weight:400;font-style:normal}*{margin:0;padding:0;border:0}body{font-family:Mak-Light,serif;font-size:16px;background-color:#141313;color:#f9ed32}div{display:block}h1,h2,h3,h4,h5,h6{font-family:Mak-Light,serif}h1{font-size:3em}h2{font-size:2.5em}p{font-family:Montserrat-Regular,sans-serif;font-size:1em;margin:1em auto;text-align:center}a,a:hover,a:visited{color:#f9ed32}.wrapper{display:block;margin:0 auto;width:621px;height:auto}.cover{background-color:#231f20;width:100%;height:354px;padding-top:60px;margin-bottom:2em}.cover__back{padding-top:60px}.title{text-align:center;margin:0 auto}.title__front{font-size:3em;padding-top:1em}.title__back{font-size:3em}.front-logo{display:block;margin:0 auto;width:166px;height:166px}.front-logo img{width:100%;height:auto}.qrcode{display:block;width:128px;height:128px;margin:0 auto 1em}.qrcode img{width:100%;height:auto}.copyright{font-size:.75em}</style></head><body><h1 class="title">Подарунковий сертифікат від BySadovskiy!</h1><p>Вітаємо! Ви отримали подарунковий сертифікат ві BySadovskiy номіналом ${req.certificate.value} гривень. Перешліть цей лист на нашу пошту, або у будь який зручний спосіб за допомогою соц. мереж.</p><div class="wrapper"><div class="cover cover__front"><div class="front-logo"><img src="https://s3.eu-central-1.amazonaws.com/com.wtfgames.bysadovskiy/svg/bysadovskiy-logo.svg"></div><h2 class="title title__front">Подарунковий<br>сертифікат</h2></div><div class="cover cover__back"><div class="qrcode"><img src="cid:admin@bysadovskiy.com"></div><h2 class="title title__back">₴ ${req.certificate.value}</h2><p class="facebook"><a href="https://www.facebook.com/bysadovskiy">www.facebook.com/bysadovskiy</a></p><p class="instagram"><a href="https://www.instagram.com/bysadovskiy/">www.instagram.com/bysadovskiy/</a></p><p class="mobile"><a href="tel:+380937427197">+380937427197</a></p><p class="copyright">BySadovskiy est. 2019</p></div></div></body></html>`,
            attachments: [
                // File Stream attachment
                {
                    filename: `certificate-${req.certificate._id}.png`,
                    path: path.join(__dirname, '..', `uploads/certificate-${req.certificate._id}.png`),
                    cid: 'admin@bysadovskiy.com'
                }
            ]
        };

        transporter.sendMail(message, (err, info) => {

            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }

            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            res.status(201).json({ message: `Gift certificate with ID: ${req.certificate._id} was created` });
        });
    } else {
        console.log("Sorry, E-mail parameter is empty, so no E-mail was sent.");
    }
};