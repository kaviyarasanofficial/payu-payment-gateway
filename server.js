const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const merchantKey = "HCatrJ";  // Replace with your actual key
const salt = "5khamqVtzPVFz0dVBtKIwaJd7gm6CAsW";  // Replace with your actual salt
const apiEndpoint = "https://test.payu.in/_payment";

// Sample Payment Details
const amount = "100.00";
const productInfo = "Test Product";
const firstName = "John";
const email = "john@example.com";
const phone = "9999999999";
const txnId = "TXN" + Date.now();
const surl = "http://localhost:3000/success";
const furl = "http://localhost:3000/failure";

app.get("/", (req, res) => {
  res.send("Welcome to PayU Payment Gateway Integration!");
});

app.get("/pay", async (req, res) => {
  try {
    // Required Payment Parameters
    const params = {
      key: merchantKey,
      txnid: txnId,
      amount: amount,
      productinfo: productInfo,
      firstname: firstName,
      email: email,
      phone: phone,
      surl: surl,
      furl: furl,
      service_provider: "payu_paisa", // Required for PayU
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",
    };

    // Generate Secure Hash
    params["hash"] = generateHash(params, salt);

  

    // Render HTML Form for Payment
    res.send(`
      <html>
      <body onload="document.forms['payuForm'].submit()">
        <form id="payuForm" action="${apiEndpoint}" method="post">
          ${Object.keys(params)
            .map((key) => `<input type="hidden" name="${key}" value="${params[key]}" />`)
            .join("")}
          <input type="submit" value="Pay Now" />
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

function generateHash(params, salt) {
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1}|${params.udf2}|${params.udf3}|${params.udf4}|${params.udf5}||||||${salt}`;
  

  return sha512(hashString);
}

function sha512(str) {
  return crypto.createHash("sha512").update(str).digest("hex");
}


// Success & Failure Routes
app.post("/success", (req, res) => {
  res.send("Payment Successful! " + JSON.stringify(req.body));
});

app.post("/failure", (req, res) => {
  res.send("Payment Failed! " + JSON.stringify(req.body));
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
