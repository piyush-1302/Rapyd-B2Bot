//import { MongoClient } from "mongodb";
const { MongoClient, ServerApiVersion } = require("mongodb");
const { getRapyPayCheckoutId } = require("./signature");
const crypto = require('crypto');
const express = require("express");
const { randomUUID } = require("crypto");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
  res.json({
    msg: "Hello world",
  });
});

const getHumanDate = (date) => {
  return date.toLocaleDateString(undefined, {weekday: "short", day: "numeric", month: "short", year: "numeric"})
}

/*
 Request {
  "cartvalue": "@cartvalue",
  "paynow": true,
  "user_id": "1",
  "merchant_id": "1",
  "currency" : "USD",
}

Response {
  "status": "success",
  "link" : "https://blinkpay.com/pay/1"
}
1. Paynow -> Checkout Id Generation(Rapyd API) -> Checkout Id -> Paynow 
2. PayLater -> Checkout Id Generation(Rapyd API) 
3. DB storage of checkout id



Database Storage :
{
  "paymentId" : ":paymentId",
  "user_id": "1",
  "merchant_id": "1",
  "cartvalue": "@cartvalue",
  "checkoutId" : "RapidAPI",
  "dueDate" : "currentData + 45";
}

*/
app.post("/order", async (req, res) => {

  const uri =
    "mongodb+srv://shivam:shivam@cluster0.173wr.mongodb.net/payments?retryWrites=true&w=majority";

  const client = await MongoClient.connect(uri);
  const db = client.db();
  const collection = db.collection("checkout");
  let checkoutId = ''
  const paymentId = Math.floor(Math.random() * 1000000) + 1
  if (req.body.paynow === true) {
    checkoutId = await getRapyPayCheckoutId(req, res);
    console.log(checkoutId)
    collection.insertOne({
      paymentId: paymentId,
      user_id: req.body.user_id,
      merchant_id: req.body.merchant_id,
      cartvalue: req.body.cartvalue,
      checkoutId: checkoutId,
      dueDate: new Date().getTime(),
      humanDate: getHumanDate(new Date()),
      isPaid: "true",
      currency: req.body.currency
    });
  } else {
    collection.insertOne({
      paymentId: paymentId,
      user_id: req.body.user_id,
      merchant_id: req.body.merchant_id,
      cartvalue: req.body.cartvalue,
      //  checkoutId: checkoutId,
      dueDate: new Date().getTime() + (2 * 24 * 60 * 60 * 1000),
      humanDate: getHumanDate(new Date(new Date().getTime() + (45 * 24 * 60 * 60 * 1000))),
      isPaid: "false",
      currency: req.body.currency
    });
  }


  const cartValue = req.body.cartvalue;
  res.json({
    checkoutId: checkoutId,
    paymentId: paymentId
  });
});

/*

Request {
  "user_id": "1"
}

Response {
  "status": "success"
  "payments" : [] 
}
1. Fetch checkoutId from DB with date range and userId
*/
app.post("/retrive-outstanding-payment", async (req, res) => {
  // const cartValue = req.body.cartvalue;
  const userId = req.body.user_id;
  const currentDate = new Date().getTime();
  const futureDate = new Date().getTime() + (2 * 24 * 60 * 60 * 1000);
  const uri =
    "mongodb+srv://shivam:shivam@cluster0.173wr.mongodb.net/payments?retryWrites=true&w=majority";
  const client = await MongoClient.connect(uri);
  const db = client.db();
  const collection = db.collection("checkout");

  var data = await collection
    .find({ user_id: userId }, { dueDate: { $gt: currentDate, $lt: futureDate } })
    .toArray();

  // let paymentInfo1 = {
  //   merchantId: "950ae8c6-78",
  //   amount: 120,
  //   dueDate: new Date(2022, 05, 29),
  //   currency: "INR",
  // };
  // let paymentInfo2 = {
  //   merchantId: "950ae8c6-78",
  //   amount: 501,
  //   dueDate: new Date(2022, 05, 30),
  //   currency: "INR",
  // };
  // let paymentInfo3 = {
  //   merchantId: "950ae8c6-78",
  //   amount: 1102,
  //   dueDate: new Date(2022, 05, 29),
  //   currency: "INR",
  // };
  let r = []
  for (let i = 0; i < data.length; i++) {
    if ((data[i].isPaid === "false") && (data[i].dueDate < futureDate) && (data[i].dueDate >= currentDate)) {
      r.push({
        amount: data[i].cartvalue,
        currency: data[i].currency,
        merchantId: data[i].merchant_id,
        dueDate: data[i].humanDate,
        paymentId: data[i].paymentId,
        message: `${data[i].paymentId}: ${data[i].currency} ${data[i].cartvalue} due on ${data[i].humanDate} to merchant ABC.`,
      })
    }
  }
  const outstandingPayments = r;
  res.json({ outstandingPayments: r });
});

// /*
// Request {
// "paymentId"

// }
// */

app.post("/do-payment", async (req, res) => {
  const payId = req.body.payId;
  const uri =
    "mongodb+srv://shivam:shivam@cluster0.173wr.mongodb.net/payments?retryWrites=true&w=majority";
  const client = await MongoClient.connect(uri);
  const db = client.db();
  const collection = db.collection("checkout");

  var data = await collection
    .findOne({ paymentId: +payId });

  var body = {
    cartvalue: data.cartvalue,
    currency: data.currency,
    merchantId: data.merchant_id
  }

  var req1 = {
    body
  }

  let checkoutId = await getRapyPayCheckoutId(req1, res);
  console.log(checkoutId)
  collection.findOneAndUpdate({ paymentId: +payId }, {
    $set: {
      checkoutId: checkoutId,
      isPaid: "true"
    }
  });

  res.json({
    checkoutId: checkoutId
  });

});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
