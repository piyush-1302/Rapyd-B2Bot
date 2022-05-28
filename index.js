//import { MongoClient } from "mongodb";
const { MongoClient, ServerApiVersion } = require("mongodb");
const { getRapyPayCheckoutId } = require("./signature");

const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
  res.json({
    msg: "Hello world",
  });
});

async function mongoDb() {

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
 collection.insertOne({
    paymentId: ":paymentId",
    user_id: "1",
    merchant_id: "1",
    cartvalue: "@cartvalue",
    checkoutId: "RapidAPI",
    dueDate: "currentData + 45",
  });


 const checkoutId = await getRapyPayCheckoutId(req, res);
//console.log(checkoutId)


  

  const cartValue = req.body.cartvalue;
  res.json({
    msg: `Order processed successfully for an order of $${cartValue}`,
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
app.get("/retrive-outstanding-payment", (req, res) => {
  // const cartValue = req.body.cartvalue;
  let paymentInfo1 = {
    merchantId: "950ae8c6-78",
    amount: 120,
    dueDate: new Date(2022, 05, 29),
    currency: "INR",
  };
  let paymentInfo2 = {
    merchantId: "950ae8c6-78",
    amount: 501,
    dueDate: new Date(2022, 05, 30),
    currency: "INR",
  };
  let paymentInfo3 = {
    merchantId: "950ae8c6-78",
    amount: 1102,
    dueDate: new Date(2022, 05, 29),
    currency: "INR",
  };
  const outstandingPayments = [paymentInfo1, paymentInfo2, paymentInfo3];
  res.json({ outstandingPayments });
});

// /*
// Request {
// "paymentId"

// }
// */

// app.post("/do-payment", (req,res) =>{

// });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
