import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER?.replace(/"/g, '') || '', // Remove quotes if present
      pass: process.env.SMTP_PASS?.replace(/"/g, '') || '', // Remove quotes if present
    },
  });
};

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
export const sendContactEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('✅ SMTP server is ready to send emails');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        message: 'Email service configuration error. Please contact support directly.',
        error: process.env.NODE_ENV === 'development' ? verifyError.message : undefined
      });
    }

    const fromEmail = process.env.SMTP_USER?.replace(/"/g, '') || process.env.FROM_EMAIL || 'noreply@obyyo.com';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@obyyo.com';

    // Email to admin
    const adminMailOptions = {
      from: `"${name}" <${fromEmail}>`,
      replyTo: email,
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This email was sent from the contact form on your website.
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the contact form on your website.
      `
    };

    // Confirmation email to user
    const userMailOptions = {
      from: `"Obyyo Support" <${fromEmail}>`,
      to: email,
      subject: `Thank you for contacting us - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank You for Contacting Us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>Our team typically responds within 24-48 hours.</p>
          <p>Best regards,<br>The Obyyo Team</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated confirmation email. Please do not reply to this email.
            If you need to contact us, please use the contact form on our website.
          </p>
        </div>
      `,
      text: `
Thank You for Contacting Us!

Dear ${name},

We have received your message and will get back to you as soon as possible.

Your Message:
${message}

Our team typically responds within 24-48 hours.

Best regards,
The Obyyo Team

---
This is an automated confirmation email. Please do not reply to this email.
      `
    };

    // Send both emails
    const [adminResult, userResult] = await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log('✅ Contact email sent successfully');
    console.log('Admin email messageId:', adminResult.messageId);
    console.log('User confirmation email messageId:', userResult.messageId);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      messageId: adminResult.messageId
    });

  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later or contact us directly at support@obyyo.com',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


