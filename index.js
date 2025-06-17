require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// ✅ CORS setup
app.use(cors({
  origin: "http://localhost:5173", // Or replace with your actual frontend URL
  methods: ["POST"],
}));

app.use(express.json());

// --- Transporter for Order Emails ---
const orderTransporter = nodemailer.createTransport({
  host: "mail.uniqueclothing.co.za",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// --- Transporter for Booking Emails ---
const bookingTransporter = nodemailer.createTransport({
  host: "mail.uniqueclothing.co.za",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BOOKING_MAIL_USER,
    pass: process.env.BOOKING_MAIL_PASSWORD,
  },
});

// --- Order Email Route ---
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
    const info = await orderTransporter.sendMail(mailOptions);
    console.log("✅ Order email sent:", info.messageId);
    res.status(200).json({ message: "Order email sent successfully" });
  } catch (err) {
    console.error("❌ Order email error:", err.message);
    res.status(500).json({ error: "Failed to send order email" });
  }
});

// --- Booking Email Route ---
app.post("/send-manufacturing-booking", async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("📧 Sending manufacturing booking confirmation to:", email);

  const mailOptions = {
    from: `"Unique Scrubz Appointments" <${process.env.BOOKING_MAIL_USER}>`,
    to: email,
    subject: "Your Unique Scrubz Manufacturing Appointment Confirmation",
    html: `
      <h2 style="color: #333;">Thank you for your appointment request, ${name}!</h2>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Message:</strong> ${message}</li>
      </ul>
      <p>We'll get back to you soon!</p>
      <small>&copy; ${new Date().getFullYear()} Unique Scrubz</small>
    `,
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions);
    console.log("✅ Booking email sent:", info.messageId);
    res.status(200).json({ message: "Booking email sent successfully" });
  } catch (err) {
    console.error("❌ Booking email error:", err.message);
    res.status(500).json({ error: "Failed to send booking email" });
  }
});

// ✅ PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Email server running on port ${PORT}`));
