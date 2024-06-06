require("dotenv").config();
const express = require("express");
const mainController = require("./controller");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api", mainController);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
