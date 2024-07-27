const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(express.static('.'));

let documents = [];

app.post('/documents', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'actionPdf', maxCount: 1 }]), (req, res) => {
    const newDoc = req.body;
    newDoc.serialNumber = documents.length + 1;
    
    if (req.files.pdf) {
        newDoc.pdfPath = req.files.pdf[0].path;
    }
    if (req.files.actionPdf) {
        newDoc.actionPdfPath = req.files.actionPdf[0].path;
    }
    
    documents.push(newDoc);
    res.json({ message: 'Document added successfully', document: newDoc });
});

app.get('/documents', (req, res) => {
    res.json(documents);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});