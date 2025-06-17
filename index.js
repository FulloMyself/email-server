require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// ✅ CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["POST"],
}));

app.use(express.json());

// --- Define Transporters Separately ---

// Transporter for Order Confirmations
const orderTransporter = nodemailer.createTransport({
  host: "mail.uniqueclothing.co.za",
  port: 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.MAIL_USER, // 
    pass: process.env.MAIL_PASSWORD,
  },
});

// Transporter for Manufacturing Bookings
const bookingTransporter = nodemailer.createTransport({
  host: "mail.uniqueclothing.co.za", // Same outgoing server
  port: 465, // Using port 465 with SSL, as per your info
  secure: true, // Set to true for SSL on port 465
  auth: {
    user: process.env.BOOKING_MAIL_USER, //
    pass: process.env.BOOKING_MAIL_PASSWORD,
  },
});

// --- Routes ---

// ✅ Order confirmation route
app.post("/send-email", async (req, res) => {
  const { name, email, items, total } = req.body;
  console.log("📧 Attempting to send order confirmation email to:", email);

  const mailOptions = {
    from: `"Unique Scrubz Orders" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your Unique Scrubz Order Confirmation",
    html: `
      <h2 style="color: #333;">Thank you for your order, ${name}!</h2>
      <p><strong>Order Summary:</strong></p>
      <p>${items}</p>
      <p><strong>Total:</strong> ${total}</p>
      <p>We'll process your order shortly.</p>
      <br/>
      <small>&copy; ${new Date().getFullYear()} Unique Scrubz</small>
    `,
  };

  try {
    const info = await orderTransporter.sendMail(mailOptions); // Use orderTransporter
    console.log("✅ Order confirmation email sent:", info.messageId);
    res.status(200).json({ message: "Order confirmation email sent successfully" });
  } catch (err) {
    console.error("❌ Order email error:", err.message || err);
    res.status(500).json({ error: "Failed to send order confirmation email" });
  }
});

// ✅ Manufacturing booking route
app.post("/send-manufacturing-booking", async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("Client email from form:", email);
  console.log("📧 Attempting to send manufacturing booking confirmation to:", email);

  const mailOptions = {
    // Crucially, the 'from' email
    from: `"Unique Scrubz Appointments" <${process.env.BOOKING_MAIL_USER}>`,
    to: email,
    subject: "Your Unique Scrubz Manufacturing Appointment Confirmation",
    html: `
      <h2 style="color: #333;">Thank you for your appointment request, ${name}!</h2>
      <p><strong>Appointment Details:</strong></p>
      <p>We have received your manufacturing appointment request with the following details:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Message:</strong> ${message}</li>
      </ul>
      <p>We will review your request and get back to you shortly to confirm the details and schedule.</p>
      <br/>
      <small>&copy; ${new Date().getFullYear()} Unique Scrubz</small>
    `,
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions); // Use bookingTransporter
    console.log("✅ Manufacturing booking confirmation email sent to client:", info.messageId);
    res.status(200).json({ message: "Manufacturing booking confirmation email sent successfully" });
  } catch (err) {
    console.error("❌ Manufacturing booking email error:", err.message || err);
    res.status(500).json({ error: "Failed to send manufacturing booking confirmation email" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Email server running on port ${PORT}`));