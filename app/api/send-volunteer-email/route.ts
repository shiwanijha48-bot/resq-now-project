import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const {
      requester_email,
      volunteerName,
      volunteerPhone,
      requestId,
    } = await req.json();

    console.log("EMAIL RECEIVED:", requester_email);

    const approveUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL}/approve/${requestId}`;

    const info = await transporter.sendMail({
      from: `"Sahyog Support" <${process.env.EMAIL_USER}>`,
      to: requester_email,
      subject: "Volunteer Available For Your Request",
      html: `
        <h2>A volunteer is ready to help</h2>

        <p><strong>Name:</strong> ${volunteerName}</p>
        <p><strong>Phone:</strong> ${volunteerPhone}</p>

        <p>
          <a href="${approveUrl}">
            Approve Volunteer
          </a>
        </p>
      `,
    });

    console.log("EMAIL SENT:", info.messageId);


    
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}


