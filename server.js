const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const dataFile = path.join(__dirname, "medicines.json");

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
}

// Get all medicines
app.get("/api/medicines", (req, res) => {
    const medicines = JSON.parse(
        fs.readFileSync(dataFile, "utf8")
    );

    res.json(medicines);
});

// Add medicine
app.post("/api/medicines", (req, res) => {
    const medicines = JSON.parse(
        fs.readFileSync(dataFile, "utf8")
    );

    const medicine = {
        id: Date.now(),
        name: req.body.name,
        dosage: req.body.dosage,
        time: req.body.time
    };

    medicines.push(medicine);

    fs.writeFileSync(
        dataFile,
        JSON.stringify(medicines, null, 2)
    );

    res.json(medicine);
});

// Delete medicine
app.delete("/api/medicines/:id", (req, res) => {
    let medicines = JSON.parse(
        fs.readFileSync(dataFile, "utf8")
    );

    medicines = medicines.filter(
        medicine => medicine.id != req.params.id
    );

    fs.writeFileSync(
        dataFile,
        JSON.stringify(medicines, null, 2)
    );

    res.json({
        message: "Medicine deleted"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});