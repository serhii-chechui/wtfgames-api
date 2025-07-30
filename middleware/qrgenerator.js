const QRCode = require('qrcode');

exports.generateQRCode = (req, res, next) => {

    let certificateId = req.certificate._id;

    if (certificateId !== "") {

        console.log(req.hostname);
        console.log(req.ip);

        let host = process.env.NODE_ENV === 'production' ? req.hostname : req.ip;
        let port = process.env.NODE_ENV === 'production' ? '' : process.env.PORT;

        // let url = process.env.NODE_ENV === 'production' ? `${host}` : `${host}:${port}`;

        let url = 'http://18.194.223.44'

        let redeemUrl = `${url}/api/gift-certificates/redeem/${certificateId}`;

        QRCode
            .toFile(`uploads/certificate-${certificateId}.png`, redeemUrl, {
                version: 6,
                color: {
                    dark: '#f4ed5bff',  // Blue dots
                    light: '#1e1e1e00' // Transparent background
                }
            },
                (err, message) => {
                    if (err) {
                        throw err;
                    } else {
                        console.log(`Generated QR for id: ${certificateId}`);
                        next();
                    }
                });
    } else {
        console.log("Sorry, but ID for certificate is null or empty.");
    }
};