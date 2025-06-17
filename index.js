require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// ✅ CORS setup
app.use(cors({
  origin: ["http://localhost:5173", "https://fullomyself.github.io"],
  methods: ["POST"],
}));

app.use(express.json());

// --- Order Transporter ---
const orderTransporter = nodemailer.createTransport({
  host: "mail.uniqueclothing.co.za",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// --- Booking Transporter ---
const bookingTransporter = nodemailer.createTransport({
  host: "mail.uniqueclothing.co.za",
  port: 465,
  secure: true,
  auth: {
    user: process.env.BOOKING_MAIL_USER,
    pass: process.env.BOOKING_MAIL_PASSWORD,
  },
});

// Send to customer
await orderTransporter.sendMail({
  from: `"Unique Scrubz Orders" <${process.env.MAIL_USER}>`,
  to: email,
  subject: "Your Unique Scrubz Order Confirmation",
  html: `
    <h2>Thank you for your order, ${name}!</h2>
    <p><strong>Order Summary:</strong></p>
    <p>${items}</p>
    <p><strong>Total:</strong> ${total}</p>
    <p>We'll process your order shortly.</p>
    <br/>
    <small>&copy; ${new Date().getFullYear()} Unique Scrubz</small>
  `,
});

// Send copy to admin
await orderTransporter.sendMail({
  from: `"Order Notification" <${process.env.MAIL_USER}>`,
  to: process.env.ORDERS_EMAIL,
  subject: `🛒 New Order Received from ${name}`,
  html: `
    <h2>New order received</h2>
    <ul>
      <li><strong>Customer:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Items:</strong> ${items}</li>
      <li><strong>Total:</strong> ${total}</li>
    </ul>
  `,
});

// Send to client
await bookingTransporter.sendMail({
  from: `"Unique Scrubz Appointments" <${process.env.BOOKING_MAIL_USER}>`,
  to: email,
  subject: "Your Unique Scrubz Manufacturing Appointment Confirmation",
  html: `
    <h2>Thank you for your appointment request, ${name}!</h2>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone}</li>
      <li><strong>Message:</strong> ${message}</li>
    </ul>
    <p>We'll get back to you soon!</p>
    <small>&copy; ${new Date().getFullYear()} Unique Scrubz</small>
  `,
});

// Notify admin
await bookingTransporter.sendMail({
  from: `"Appointment Notification" <${process.env.BOOKING_MAIL_USER}>`,
  to: process.env.APPOINTMENTS_EMAIL,
  subject: `📅 New Manufacturing Appointment from ${name}`,
  html: `
    <h2>New manufacturing appointment request</h2>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone}</li>
      <li><strong>Message:</strong> ${message}</li>
    </ul>
  `,
});

// ✅ PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Email server running on port ${PORT}`));
