// ✅ Update email-server/index.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: "https://fullomyself.github.io", // ✅ Your deployed frontend
  methods: ["POST"],
}));
app.use(express.json());

// Shared transport for both types
const transporter = nodemailer.createTransport({
  host: "mail.uniqueclothing.co.za",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// ✅ Route: Order Emails
app.post("/send-email", async (req, res) => {
  const { name, email, items, total } = req.body;

  const customerMail = {
    from: `Unique Scrubz <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your Unique Scrubz Order Confirmation",
    html: `
      <h2>Thank you for your order, ${name}!</h2>
      <p><strong>Items:</strong> ${items}</p>
      <p><strong>Total:</strong> ${total}</p>
      <p>We’ll process your order shortly.</p>
    `,
  };

  const adminMail = {
    from: `Unique Scrubz <${process.env.MAIL_USER}>`,
    to: process.env.ADMIN_EMAIL, // 👈 admin inbox
    subject: `🛒 New Order from ${name}`,
    html: `
      <h3>New Order Received</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Items:</strong> ${items}</p>
      <p><strong>Total:</strong> ${total}</p>
    `,
  };

  try {
    await transporter.sendMail(customerMail);
    await transporter.sendMail(adminMail);
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (err) {
    console.error("Order email error:", err);
    res.status(500).json({ error: "Failed to send order emails" });
  }
});

// ✅ Route: Manufacturing Bookings
app.post("/send-manufacturing-booking", async (req, res) => {
  const { name, email, phone, message } = req.body;

  const clientMail = {
    from: `Unique Scrubz <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Manufacturing Appointment Confirmation",
    html: `
      <h2>Hello ${name},</h2>
      <p>We’ve received your booking. We’ll get back to you shortly.</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  const adminMail = {
    from: `Unique Scrubz <${process.env.MAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📆 New Appointment Request from ${name}`,
    html: `
      <h3>New Manufacturing Appointment</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(clientMail);
    await transporter.sendMail(adminMail);
    res.status(200).json({ message: "Appointment emails sent successfully" });
  } catch (err) {
    console.error("Appointment email error:", err);
    res.status(500).json({ error: "Failed to send appointment emails" });
  }
});


// ✅ PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Email server running on port ${PORT}`));
