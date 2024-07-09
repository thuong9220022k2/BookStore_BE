const https = require('https');
const crypto = require('crypto');

class PaymentService {

    // createPaymentRequest(orderInfo, amount, redirectUrl, ipnUrl) {
    //     const orderId = this.partnerCode + new Date().getTime();
    //     const extraData = ''
    //     const paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA=='
    //     const autoCapture = false
    //     const lang = 'en'
    //     const requestId = orderId;
    //     console.log("access key", this.accessKey)
    //     console.log("requestId", requestId)
    //     console.log("orderId", orderId)

    //     // const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=`;
    //     const rawSignature = "accessKey=" + this.accessKey + "&amount=" + amount + "&extraData=" + extraData + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + this.partnerCode + "&paymentCode=" + paymentCode + "&requestId=" + requestId;
    //     console.log("raw Signature", rawSignature)
    //     const signature = crypto.createHmac('sha256', this.secretKey)
    //         .update(rawSignature)
    //         .digest('hex');

    //     console.log("signature", signature)

    //     const requestBody = JSON.stringify({
    //         partnerCode: this.partnerCode,
    //         partnerName: "Test",
    //         storeId: "MomoTestStore",
    //         requestId: requestId,
    //         requestType: "payWithATM",
    //         amount: amount,
    //         orderId: orderId,
    //         orderInfo: orderInfo,
    //         redirectUrl: redirectUrl,
    //         ipnUrl: ipnUrl,
    //         lang: lang,
    //         autoCapture: autoCapture,
    //         extraData: extraData,
    //         paymentCode: paymentCode,
    //         signature: signature
    //     });
    //     console.log("requestBOdy", requestBody)

    //     return requestBody;
    // }

    // async sendPaymentRequest(requestBody) {
    //     const options = {
    //         hostname: 'test-payment.momo.vn',
    //         port: 443,
    //         path: '/v2/gateway/api/create',
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Content-Length': Buffer.byteLength(requestBody)
    //         }
    //     };
    //     console.log("da chay den day")

    //     return new Promise(async (resolve, reject) => {
    //         const req = await https.request(options, res => {
    //             console.log(`Status: ${res.statusCode}`);
    //             console.log(`Headers: ${JSON.stringify(res.headers)}`);
    //             let body = '';
    //             res.on('data', chunk => {
    //                 body += chunk;
    //             });
    //             res.on('end', () => {
    //                 console.log("body", body)
    //                 resolve(JSON.parse(body));
    //             });
    //         });

    //         req.on('error', e => {
    //             reject(e);
    //         });
    //         req.write(requestBody);
    //         req.end(); // Close the request
    //     });
    // }

    // vnpay service 









}

module.exports = PaymentService;