//const https = require("https");
const crypto = require("crypto");
const { request } = require("https");
const accessKey = '4A20E11B9E9C6E60A075';
const secretKey ='509be94b9b26449f41c7254e7ae802ddbdf2eabf84bb7ec72158410d9ee995592477caf141f06c7e';
const log = false;
const timestamp = Math.round(new Date().getTime() / 1000);



function sign(method, urlPath, salt, timestamp, body) {
  try {
    let bodyString = "";
    if (body) {
      bodyString = JSON.stringify(body);
      bodyString = bodyString == "{}" ? "" : bodyString;
    }

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

    return signature;
  } catch (error) {
    console.error("Error generating signature");
    throw error;
  }
}

function generateRandomString(size) {
  try {
    return crypto.randomBytes(size).toString("hex");
  } catch (error) {
    console.error("Error generating salt");
    throw error;
  }
}


async function getRapyPayCheckoutId(req, res) {
    
      body = JSON.stringify({
        amount: req.body.cartvalue,
        complete_payment_url: "https://static-web-app-01.herokuapp.com/",
        country: "IN",
        currency: req.body.currency,
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
        expiration: Math.round(new Date().getTime() / 1000) + 86000,
        payment_method_types_exclude: [],
      });

        httpMethod = 'post';
        httpBaseURL = 'https://sandboxapi.rapyd.net';
        httpURLPath = 'v1/checkout';
        salt = generateRandomString(8);
        //idempotency = new Date().getTime().toString();
        //timestamp = Math.round(new Date().getTime() / 1000);

        console.log(salt)

  var options = {
    method: "POST",
    url: "https://sandboxapi.rapyd.net/v1/checkout",
    headers: {
      "Content-Type": "application/json",
      access_key: accessKey,
      salt: salt,
      timestamp: Math.round(new Date().getTime() / 1000),
      signature: sign(httpMethod, httpURLPath, salt, timestamp, body),
    },
    body: body, // JSON body goes here. Always
  };
  request(options, function (error, response, body) {
    
    if (error) throw new Error(error);
    console.log(body);
    console.log(response)
    res.json(JSON.parse(body));
  });
}




module.exports = {
    getRapyPayCheckoutId: getRapyPayCheckoutId
}
