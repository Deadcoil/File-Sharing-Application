
const express = require("express");
const multer = require("multer");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const File = require("./models/File.js");
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const upload = multer({ dest: "uploads" });

mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB error:", err));

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname,
    };

    if (req.body.password && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10);
    }

    const file = await File.create(fileData);
    res.render("index", {
        fileLink: `${req.headers.origin}/file/${file.id}`,
    });
});

app.get("/file/:id", async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");

    if (file.password != null) {
        return res.render("password", { error: false, id: file.id });
    }

    file.downloadCount++;
    await file.save();
    res.download(file.path, file.originalName);
});

app.post("/file/:id", async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");

    if (file.password != null) {
        if (!req.body.password) {
            return res.render("password", { error: true, id: file.id });
        }

        const match = await bcrypt.compare(req.body.password, file.password);
        if (!match) {
            return res.render("password", { error: true, id: file.id });
        }
    }

    file.downloadCount++;
    await file.save();
    res.download(file.path, file.originalName);
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
