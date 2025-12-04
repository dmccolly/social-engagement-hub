// netlify/functions/send-contact-form.js
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { firstName, lastName, email, phone, message, recipients } = JSON.parse(event.body);

    // Validate required fields
    if (!firstName || !lastName || !email || !message || !recipients || recipients.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get SMTP configuration from environment variables
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 587;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error('SMTP configuration missing');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Email service not configured',
          details: 'Please set SMTP environment variables in Netlify'
        })
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    // Build email content
    const emailSubject = `Contact Form: Message from ${firstName} ${lastName}`;
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <hr>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        This message was sent via the History of Idaho Broadcasting Foundation website contact form.
      </p>
    `;

    const emailText = `
New Contact Form Submission

From: ${firstName} ${lastName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

---
This message was sent via the History of Idaho Broadcasting Foundation website contact form.
    `.trim();

    // Send email to each recipient
    const sendPromises = recipients.map(recipient => {
      return transporter.sendMail({
        from: SMTP_FROM,
        to: recipient.email,
        replyTo: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      });
    });

    await Promise.all(sendPromises);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Message sent successfully',
        recipientCount: recipients.length
      })
    };

  } catch (error) {
    console.error('Send contact form error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: false,
        error: 'Failed to send message',
        message: error.message 
      })
    };
  }
};
