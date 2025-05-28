const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send("Method Not Allowed");
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    const params = new URLSearchParams(body);
    const bookingId = 'GTY-' + Math.floor(100000 + Math.random() * 900000);

    const emailBody = `
Booking ID: ${bookingId}
Time: ${params.get('booking_time')}
In/Outcall: ${params.get('location_type')}
Massage Type: ${params.get('massage_type')}
Client Location: ${params.get('client_location')}
Preferred Name: ${params.get('preferred_name')}
Meeting Point: ${params.get('meeting_point')}
Law Enforcement Affiliation: ${params.get('law_enforcement')}
Disease: ${params.get('disease')}
Payment Method: ${params.get('payment_method')}
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `New Booking Request - ${bookingId}`,
      text: emailBody,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.writeHead(302, { Location: `/thank-you.html?booking_id=${bookingId}` });
      res.end();
    } catch (error) {
      res.status(500).send("Failed to send email: " + error.message);
    }
  });
}
