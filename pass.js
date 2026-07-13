// ─────────────────────────────────────────────────────────────────────────────
// FarmConnect — Forgot Password Backend
// Stack: Node.js + Express + Firebase Admin SDK + Nodemailer
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

// ─── Firebase Admin Init ───────────────────────────────────────────────────
// Download your serviceAccountKey.json from Firebase Console:
// Project Settings → Service Accounts → Generate new private key
const serviceAccount = require('..//serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── Nodemailer Transporter ────────────────────────────────────────────────
// Uses Gmail SMTP. You can swap host/port for any SMTP provider.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // your Gmail address
    pass: process.env.EMAIL_PASS,    // Gmail App Password (not your normal password)
  },
});

// Verify SMTP connection on startup
transporter.verify((err) => {
  if (err) console.error('⚠  SMTP connection error:', err.message);
  else console.log('✅ SMTP ready');
});

// ─── Helper: generate 6-digit OTP ─────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Helper: OTP email HTML ────────────────────────────────────────────────
function buildEmailHTML(otp) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family:'DM Sans',Arial,sans-serif;background:#FBF6EC;margin:0;padding:20px;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8ddd0;">
      <div style="background:#5A7A4A;padding:28px 32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:600;">🌿 FarmConnect</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Account Security</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#3B2314;font-size:18px;margin:0 0 12px;">Password Reset Code</h2>
        <p style="color:#7A6050;font-size:14px;line-height:1.6;margin:0 0 24px;">
          We received a request to reset your FarmConnect password.
          Use the code below — it expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#F0E8D6;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
          <span style="font-size:38px;font-weight:700;letter-spacing:10px;color:#3B2314;">${otp}</span>
        </div>
        <p style="color:#7A6050;font-size:13px;line-height:1.6;margin:0;">
          If you didn't request this, you can safely ignore this email.
          Your password will not change.
        </p>
      </div>
      <div style="background:#FBF6EC;padding:16px 32px;text-align:center;">
        <p style="color:#B0A090;font-size:12px;margin:0;">© ${new Date().getFullYear()} FarmConnect. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 1: POST /api/forgot-password/send-otp
// Validates email exists in Firebase, generates OTP, sends email
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/forgot-password/send-otp', async (req, res) => {
  const { email } = req.body;

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  try {
    // ── Check user exists in Firebase Auth ──────────────────────────────
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
    } catch (e) {
      // Do NOT reveal whether email exists — security best practice
      // Return success-looking response to prevent email enumeration
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // ── Rate limiting: prevent OTP spam ─────────────────────────────────
    const otpRef = db.collection('password_resets').doc(email);
    const existing = await otpRef.get();

    if (existing.exists) {
      const data = existing.data();
      const secondsSinceLast = (Date.now() - data.createdAt) / 1000;
      if (secondsSinceLast < 60) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(60 - secondsSinceLast)} seconds before requesting another code.`
        });
      }
    }

    // ── Generate and store OTP ───────────────────────────────────────────
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);  // store hashed for security

    await otpRef.set({
      hashedOTP,
      attempts: 0,
      verified: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,  // 10 minutes
    });

    // ── Send email ────────────────────────────────────────────────────────
    await transporter.sendMail({
      from: `"FarmConnect 🌿" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your FarmConnect Password Reset Code',
      html: buildEmailHTML(otp),
    });

    console.log(`OTP sent to ${email}`);
    res.json({ message: 'Verification code sent successfully.' });

  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 2: POST /api/forgot-password/verify-otp
// Verifies the OTP entered by the user
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/forgot-password/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const otpRef = db.collection('password_resets').doc(email);
    const doc = await otpRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: 'No reset request found. Please start over.' });
    }

    const data = doc.data();

    // ── Check expiry ─────────────────────────────────────────────────────
    if (Date.now() > data.expiresAt) {
      await otpRef.delete();
      return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
    }

    // ── Brute-force protection: max 5 attempts ───────────────────────────
    if (data.attempts >= 5) {
      await otpRef.delete();
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new code.' });
    }

    // ── Verify OTP ───────────────────────────────────────────────────────
    const match = await bcrypt.compare(otp, data.hashedOTP);

    if (!match) {
      await otpRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
      const remaining = 4 - data.attempts;
      return res.status(400).json({
        message: `Incorrect code. ${remaining > 0 ? remaining + ' attempt(s) remaining.' : 'No attempts left.'}`
      });
    }

    // ── Mark as verified ─────────────────────────────────────────────────
    await otpRef.update({ verified: true });
    res.json({ message: 'OTP verified successfully.' });

  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 3: POST /api/forgot-password/reset-password
// Updates the user's password in Firebase Auth
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/forgot-password/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const otpRef = db.collection('password_resets').doc(email);
    const doc = await otpRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: 'Session expired. Please start the reset process again.' });
    }

    const data = doc.data();

    // ── Ensure OTP was verified ───────────────────────────────────────────
    if (!data.verified) {
      return res.status(403).json({ message: 'OTP not verified. Please complete verification first.' });
    }

    // ── Check session hasn't expired (extra safety) ───────────────────────
    if (Date.now() > data.expiresAt) {
      await otpRef.delete();
      return res.status(400).json({ message: 'Session expired. Please start over.' });
    }

    // ── Update password in Firebase Auth ────────────────────────────────
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });

    // ── Clean up OTP record ───────────────────────────────────────────────
    await otpRef.delete();

    console.log(`Password reset successful for ${email}`);
    res.json({ message: 'Password updated successfully.' });

  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ─── Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🌿 FarmConnect auth server running on port ${PORT}`));
