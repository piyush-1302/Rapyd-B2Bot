const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    msg: "Hello world",
  });
});

app.post("/order", (req, res) => {
  res.json({
    msg: "Order processed successfully",
  })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
