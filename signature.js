const https = require('https');
const crypto = require('crypto');
const accessKey = "4A20E11B9E9C6E60A075";
const secretKey = "509be94b9b26449f41c7254e7ae802ddbdf2eabf84bb7ec72158410d9ee995592477caf141f06c7e";
const log = false;

async function getRapyPayCheckoutId(req,res) {

  var body = {
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
    expiration: (Math.round(new Date().getTime() / 1000) + 86400),
    payment_method_types_exclude: [],
  };

  try {
      httpMethod = 'post';
      httpBaseURL = "sandboxapi.rapyd.net";
      httpURLPath = '/v1/checkout';
      salt = generateRandomString(8);
      // idempotency = new Date().getTime().toString();
      timestamp = Math.round(new Date().getTime() / 1000);
      signature = sign(httpMethod, httpURLPath, salt, timestamp, body)

      const options = {
          hostname: httpBaseURL,
          port: 443,
          path: httpURLPath,
          method: httpMethod,
          headers: {
              'Content-Type': 'application/json',
              salt: salt,
              timestamp: timestamp,
              signature: signature,
              access_key: accessKey
          }
      }

      return await httpRequest(options, body, log)
      // console.log(id);
      // return id;
  }
  catch (error) {
      console.error("Error generating request options");
      throw error;
  }
}

function sign(method, urlPath, salt, timestamp, body) {

  try {
      let bodyString = "";
      if (body) {
          bodyString = JSON.stringify(body);
          bodyString = bodyString == "{}" ? "" : bodyString;
      }

      let toSign = method.toLowerCase() + urlPath + salt + timestamp + accessKey + secretKey + bodyString;
      log && console.log(`toSign: ${toSign}`);

      let hash = crypto.createHmac('sha256', secretKey);
      hash.update(toSign);
      const signature = Buffer.from(hash.digest("hex")).toString("base64")
      log && console.log(`signature: ${signature}`);
      console.log(signature);
      return signature;
  }
  catch (error) {
      console.error("Error generating signature");
      throw error;
  }
}

function generateRandomString(size) {
  try {
      return crypto.randomBytes(size).toString('hex');
  }
  catch (error) {
      console.error("Error generating salt");
      throw error;
  }
}


async function httpRequest(options, body) {

  return new Promise((resolve, reject) => {

      try {
          
          let bodyString = "";
          if (body) {
              bodyString = JSON.stringify(body);
              bodyString = bodyString == "{}" ? "" : bodyString;
          }

          log && console.log(`httpRequest options: ${JSON.stringify(options)}`);
          const req = https.request(options, (res) => {
              let response = {
                  statusCode: res.statusCode,
                  headers: res.headers,
                  body: ''
              };

              res.on('data', (data) => {
                  response.body += data;
              });

              res.on('end', () => {

                  response.body = response.body ? JSON.parse(response.body) : {}
                  log && console.log(`httpRequest response: ${JSON.stringify(response)}`);
                  console.log("Response : ",response)

                  if (response.statusCode !== 200) {
                      return reject(response);
                  }
                  console.log(response.body.data.redirect_url);
                  return resolve(response.body.data.redirect_url);
              });
          })
          
          req.on('error', (error) => {
              return reject(error);
          })
          
          req.write(bodyString)
          req.end();
      }
      catch(err) {
          return reject(err);
      }
  })

}

module.exports = {
  getRapyPayCheckoutId: getRapyPayCheckoutId
}
