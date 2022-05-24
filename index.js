const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
  res.json({
    msg: "Hello world",
  });
});

app.post("/order", (req, res) => {
  const cartValue = req.body.cartvalue;
  res.json({
    msg: `Order processed successfully for an order of $${cartValue}`,
  })
})

app.get("/retrive-outstanding-payment", (req, res) => {
  // const cartValue = req.body.cartvalue;
  let paymentInfo1 = {merchantId:"950ae8c6-78", amount:120, dueDate:new Date(2022, 05, 29), currency:"INR"};
  let paymentInfo2 = {merchantId:"950ae8c6-78", amount:501, dueDate:new Date(2022, 05, 30), currency:"INR"};
  let paymentInfo3 = {merchantId:"950ae8c6-78", amount:1102, dueDate:new Date(2022, 05, 29), currency:"INR"};
  const outstandingPayments = [paymentInfo1,paymentInfo2,paymentInfo3];
  res.json({outstandingPayments})
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
