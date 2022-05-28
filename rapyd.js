// // Note: Install the crypto-js module.


// const {signature} = require('./signature');

// var http_method = "post"; // get|put|post|delete - must be lowercase.
// var url_path = "/v1/checkout"; // Portion after the base URL. Hardkeyed for this example.
// // var salt = CryptoJS.lib.WordArray.random(12); // Randomly generated for each request.
// var timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();
// // Current Unix time (seconds).
// var access_key = process.env.access_key; // The access key received from Rapyd.
// var secret_key = process.env.secret_key; // Never transmit the secret key by itself.
// var request = require("request");

// /*function getSignature(request) {
//   body = JSON.stringify({
//     amount: request.amount,
//     complete_payment_url: process.env.complete_payment_url,
//     country: "IN",
//     currency: "INR",
//     error_payment_url: process.env.complete_payment_url,
//     merchant_reference_id: request.merchant_id,
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
//     expiration: new Date() + 2,
//     payment_method_types_exclude: [],
//   }); // JSON body goes here. Always empty for GET;
//   // strip nonfunctional whitespace.

//   if (JSON.stringify(request.data) !== "{}" && request.data !== "") {
//     body = JSON.stringify(JSON.parse(request.data));
//   }

//   var to_sign =
//     http_method + url_path + salt + timestamp + access_key + secret_key + body;

//   var signature = CryptoJS.enc.Hex.stringify(
//     CryptoJS.HmacSHA256(to_sign, secret_key)
//   );

//   signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(signature));
//   return signature;
// }
// */




// function getRapyPayCheckoutId(req, res) {
// var options = {method: "POST",
//   url: "https://sandboxapi.rapyd.net/v1/checkout",
//   headers: {
//     "Content-Type": "application/json",
//     access_key: access_key,
//     salt: salt,
//     timestamp: timestamp,
//     signature: signature(http_method, url_path, salt, timestamp, body),
//   },
//    body : JSON.stringify({
//     amount: request.amount,
//     complete_payment_url: process.env.complete_payment_url,
//     country: "IN",
//     currency: "INR",
//     error_payment_url: process.env.complete_payment_url,
//     merchant_reference_id: request.merchant_id,
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
//     expiration: new Date() + 2,
//     payment_method_types_exclude: [],
//   }) // JSON body goes here. Always 

// }
//   request(options, function (error, response, body) {
//     if (error) throw new Error(error);
//     res.json(JSON.parse(body));
//   });
// }


// module.exports = {
//     getRapyPayCheckoutId: getRapyPayCheckoutId
// }