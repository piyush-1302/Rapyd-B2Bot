//const https = require("https");
const crypto = require("crypto");
const CryptoJS = require("crypto-js")
const { request } = require("http");
const accessKey = '4A20E11B9E9C6E60A075';
const secretKey = '509be94b9b26449f41c7254e7ae802ddbdf2eabf84bb7ec72158410d9ee995592477caf141f06c7e';
const log = false;
const timestamp = Math.round(new Date().getTime() / 1000);

var https = require('follow-redirects').https;
var fs = require('fs');

// function sign(actualBody, actualSalt) {
//   var method = 'post';                // get|put|post|delete - must be lowercase.
//   var url_path = '/v1/checkout';    // Portion after the base URL. Hardkeyed for this example.
//   var salt = actualSalt; // Randomly generated for each request.
//   var timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();
//   console.log(timestamp);
//   // Current Unix time (seconds).
//   var access_key = accessKey;     // The access key received from Rapyd.
//   var secret_key = secretKey;     // Never transmit the secret key by itself.
//   var body = '';                          // JSON body goes here. Always empty for GET; 
//   // strip nonfunctional whitespace.

//   console.log(actualBody.length)
//   actualBody.replace(/\s/g, "")

//   if (JSON.stringify(actualBody) !== '{}' && actualBody !== '') {
//     body = JSON.stringify(JSON.parse(actualBody));
//   }
//   console.log(actualBody.length)

//   body.trim()
//   let toSign = method.toLowerCase() + url_path + salt + timestamp + accessKey + secretKey + body;
//   log && console.log(`toSign: ${toSign}`);

//   let hash = crypto.createHmac('sha256', secretKey);
//   hash.update(toSign);
//   const signature = Buffer.from(hash.digest("hex")).toString("base64")

//   console.log(signature)
//   console.log(signature.trim())
//   console.log(signature.replace(/\s/g, ''))

//   return signature.replace(/\s/g, '');
// }

function sign(method, urlPath, salt, timestamp, body) {
  try {
    let bodyString = "";
    if (body) {
      bodyString = JSON.stringify(body);
      bodyString = bodyString == "{}" ? "" : bodyString;
    }

    bodyString.replaceAll(' ','')

    let toSign =
      method.toLowerCase() +
      urlPath +
      salt +
      timestamp +
      accessKey +
      secretKey +
      bodyString;
    log && console.log(`toSign: ${toSign}`);

    let hash = crypto.createHmac("sha256", secretKey);
    hash.update(toSign);
    const signature = Buffer.from(hash.digest("hex")).toString("base64");
    log && console.log(`signature: ${signature}`);

    return signature.replaceAll(' ','');
  } catch (error) {
    console.error("Error generating signature");
    throw error;
  }
}

function generateRandomString(size) {
  try {
    // return CryptoJS.lib.WordArray.random(12);
    return crypto.randomBytes(size).toString("hex");
  } catch (error) {
    console.error("Error generating salt");
    throw error;
  }
}

async function getRapyPayCheckoutId(req, res) {
  httpMethod = 'get';
  httpBaseURL = 'sandboxapi.rapyd.net';
  httpURLPath = '/v1/data/countries';
  salt = generateRandomString(8);
  console.log(salt);

  var body = JSON.stringify({
    amount: req.body.cartvalue.toString(),
    complete_payment_url: "https://static-web-app-01.herokuapp.com/ ",
    country: "IN",
    currency: req.body.currency.toString(),
    error_payment_url: "https://static-web-app-01.herokuapp.com/",
    merchant_reference_id: req.body.merchantId,
    cardholder_preferred_currency: true,
    language: "en",
    metadata: {
      merchant_defined: true,
    },
    payment_method_types_include: [
      "in_visa_credit_card",
      "in_dhanlaxmi_bank",
      "in_paytm_ewallet",
    ],
    expiration: (Math.round(new Date().getTime() / 1000) + 86400).toString(),
    payment_method_types_exclude: [],
  });

  var options = {
    'method': 'get',
    'hostname': 'sandboxapi.rapyd.net',
    'path':  '/v1/data/countries',
    'headers': {
      'Content-Type': 'application/json',
      access_key: accessKey,
      salt: salt,
      timestamp : (Math.floor(new Date().getTime() / 1000) - 10).toString(),
      signature: sign(httpMethod,httpURLPath, salt,timestamp,''),
    },
    'maxRedirects': 20
  };

  var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });

    res.on("error", function (error) {
      console.error(error);
    });
  });

  req.write(body);

  req.end();
}

// async function getRapyPayCheckoutId(req, res) {

//   body = JSON.stringify({
//     amount: req.body.cartvalue,
//     complete_payment_url: "https://static-web-app-01.herokuapp.com/",
//     country: "IN",
//     currency: req.body.currency,
//     error_payment_url: "https://static-web-app-01.herokuapp.com/",
//     merchant_reference_id: req.body.merchantId,
//     cardholder_preferred_currency: true,
//     language: "en",
//     metadata: {
//       merchant_defined: true,
//     },
//     payment_method_types_include: [
//       "in_visa_credit_card",
//       "in_dhanlaxmi_bank",
//       "in_paytm_ewallet",
//     ],
//     expiration: Math.round(new Date().getTime() / 1000),
//     payment_method_types_exclude: [],
//   });

//   httpMethod = 'post';
//   httpBaseURL = 'https://sandboxapi.rapyd.net';
//   httpURLPath = 'v1/checkout';
//   salt = generateRandomString(8);
//   //idempotency = new Date().getTime().toString();
//   //timestamp = Math.round(new Date().getTime() / 1000);

//   console.log(salt)

//   var options = {
//     method: "POST",
//     url: "https://sandboxapi.rapyd.net/v1/checkout",
//     headers: {
//       "Content-Type": "application/json",
//       access_key: accessKey,
//       salt: salt,
//       timestamp: Math.round(new Date().getTime() / 1000),
//       signature: sign(httpMethod, httpURLPath, salt, timestamp, body),
//     },
//     body: body, // JSON body goes here. Always
//   };
//   // await request(options, function (error, response, body) {

//   //   if (error) throw new Error(error);
//   //   console.log(body);
//   //   console.log(response)
//   //   res.json(JSON.parse(body));
//   // });
// }






module.exports = {
  getRapyPayCheckoutId: getRapyPayCheckoutId
}
