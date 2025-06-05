import nodemailer from "nodemailer";
import multiparty from "multiparty";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).send("Failed to parse form");
    }

    const bookingId = fields.booking_id?.[0] || "Unknown Booking ID";
    const frontFile = files.front_card?.[0];
    const backFile = files.back_card?.[0];

    if (!frontFile || !backFile) {
      return res.status(400).send("Both front and back card images are required");
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Gracey Therapy" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself
      subject: `🎁 Gift Card Upload – Booking ID: ${bookingId}`,
      text: `Gift card images uploaded for booking ID: ${bookingId}.`,
      attachments: [
        {
          filename: frontFile.originalFilename,
          content: fs.createReadStream(frontFile.path),
        },
        {
          filename: backFile.originalFilename,
          content: fs.createReadStream(backFile.path),
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Gift card uploaded and sent to Gmail.");
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).send("Failed to send email.");
    }
  });
  }
