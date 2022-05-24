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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
