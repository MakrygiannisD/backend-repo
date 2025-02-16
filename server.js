const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// ✅ Default Route to Fix "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Backend for Energy Consultant Website is running!');
});

// 📩 Handle Customer Submission with Invoice Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads/invoices');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ✅ API Route for Submitting Customer Data
app.post('/api/customers', upload.single('invoice'), (req, res) => {
  const customerData = req.body;
  customerData.invoicePath = req.file ? req.file.path : null;
  const dataFile = path.join(__dirname, 'data/customers.json');
  const existingData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile)) : [];
  existingData.push(customerData);
  fs.writeFileSync(dataFile, JSON.stringify(existingData, null, 2));
  res.status(201).send({ message: 'Customer data received.' });
});

// ✅ View All Customers
app.get('/api/customers', (req, res) => {
  const dataFile = path.join(__dirname, 'data/customers.json');
  const customers = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile)) : [];
  res.status(200).json(customers);
});

// 🚀 Start the Backend Server
app.listen(PORT, () => {
  console.log(`✅ Backend live at http://localhost:${PORT}`);
});