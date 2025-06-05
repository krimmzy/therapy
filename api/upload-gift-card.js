import formidable from 'formidable';
import nodemailer from 'nodemailer';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });

    const bookingId = fields.booking_id || "Unknown ID";

    const attachments = [];
    if (files.front_card) {
      attachments.push({
        filename: `Front-${bookingId}.jpg`,
        path: files.front_card.filepath,
      });
    }
    if (files.back_card) {
      attachments.push({
        filename: `Back-${bookingId}.jpg`,
        path: files.back_card.filepath,
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'YOUR_GMAIL@gmail.com',
        pass: 'YOUR_APP_PASSWORD',
      },
    });

    await transporter.sendMail({
      from: '"Gift Card Upload" <YOUR_GMAIL@gmail.com>',
      to: 'YOUR_GMAIL@gmail.com',
      subject: `Gift Card Images for Booking ID: ${bookingId}`,
      text: `Client has uploaded gift card images for Booking ID: ${bookingId}`,
      attachments,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  });
        }
