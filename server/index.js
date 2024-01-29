const express = require("express");
const app = express();
const WSServer = require("express-ws")(app);
const cors = require("cors");
const aWss = WSServer.getWss();
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    msg = JSON.parse(msg);
    switch (msg.method) {
      case "connection":
        connectionHandler(ws, msg);

        break;

      case "draw":
        broadcastConnection(ws, msg);
        break;
    }
  });
});

const IMAGES_DIRECTORY = path.resolve(__dirname, "files");

app.post("/image", (req, res) => {
  try {
    const data = req.body.img.replace("data:image/png;base64,", "");

    // Ensure the directory exists
    if (!fs.existsSync(IMAGES_DIRECTORY)) {
      fs.mkdirSync(IMAGES_DIRECTORY);
    }

    const imagePath = path.join(IMAGES_DIRECTORY, `${req.query.id}.png`);

    fs.writeFileSync(imagePath, data, "base64");

    return res.status(200).json({ message: "Image saved successfully" });
  } catch (e) {
    console.error("Error saving image:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/image", (req, res) => {
  try {
    const file = fs.readFileSync(
      path.resolve(__dirname, "files", `${req.query.id}.png`)
    );
    const data = `data:image/png;base64,` + file.toString("base64");
    res.json(data);
  } catch (e) {
    console.log(e);
    return res.status(200).json("error");
  }
});

app.listen(PORT, () => console.log(`server started on PORT ${PORT}`));

const connectionHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastConnection(ws, msg);
};

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg));
    }
  });
};
