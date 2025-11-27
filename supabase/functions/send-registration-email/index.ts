import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userEmail,
      userName,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
    }: RegistrationEmailRequest = await req.json();

    console.log("Sending registration email to:", userEmail);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PESCOE EVENT HUB <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Registration Confirmed: ${eventTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Registration Confirmed!</h1>
            <p>Hi ${userName},</p>
            <p>Thank you for registering for <strong>${eventTitle}</strong>!</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #666; margin-top: 0;">Event Details</h2>
              <p><strong>📅 Date:</strong> ${eventDate}</p>
              <p><strong>🕐 Time:</strong> ${eventTime}</p>
              <p><strong>📍 Location:</strong> ${eventLocation}</p>
            </div>
            
            <p>We look forward to seeing you at the event!</p>
            <p>Best regards,<br>The PESCOE EVENT HUB Team</p>
          </div>
        `,
      }),
    });

    const data = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending registration email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
