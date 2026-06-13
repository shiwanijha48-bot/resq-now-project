import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export async function POST(req: Request) {
  try {
    const { requestId, category, location, description, urgency } = await req.json();

    // Use auth.admin to list all registered users — always has email
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Auth users fetch error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const volunteerEmails = (usersData?.users || [])
      .map((u: any) => u.email)
      .filter(Boolean);

    if (volunteerEmails.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: "No registered users found" });
    }

    const requestUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/requests`;

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚨 SOS EMERGENCY ALERT</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Immediate volunteer help needed</p>
        </div>
        <div style="background: #fff7f7; border: 2px solid #dc2626; padding: 24px; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Category</td>
              <td style="padding: 8px 0; text-transform: capitalize; font-weight: bold;">${category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Urgency</td>
              <td style="padding: 8px 0; color: #dc2626; font-weight: bold; text-transform: uppercase;">${urgency}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Location</td>
              <td style="padding: 8px 0;">${location || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Details</td>
              <td style="padding: 8px 0;">${description || "No additional details."}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="${requestUrl}" style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              View Request & Volunteer Now
            </a>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
            This SOS alert was sent to all registered volunteers on ResQNow. If you cannot help, please ignore this email.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"ResQNow SOS Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      bcc: volunteerEmails,
      subject: ` SOS EMERGENCY — ${category?.toUpperCase()} needed at ${location || "unknown location"}`,
      html: htmlBody,
    });

    console.log("SOS EMAIL SENT:", info.messageId, "to", volunteerEmails.length, "volunteers");

    return NextResponse.json({
      success: true,
      sent: volunteerEmails.length,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("SOS EMAIL ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}