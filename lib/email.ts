import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey && resendApiKey !== 're_dev' ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Eswari Sound System <onboarding@resend.dev>';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@eswarisound.com';

/**
 * Sends a booking confirmation & advance payment receipt to customer
 */
export async function sendBookingReceiptEmail(params: {
  customerName: string;
  customerEmail: string;
  bookingId: string;
  packageName: string;
  eventDate: string;
  venueAddress: string;
  totalAmount: number;
  advanceAmount: number;
  balanceAmount: number;
}) {
  if (!resend) {
    console.log('[Email Simulation] sendBookingReceiptEmail to:', params.customerEmail);
    return { success: true, simulated: true };
  }

  try {
    const formattedAdvance = `₹${(params.advanceAmount / 100).toLocaleString('en-IN')}`;
    const formattedBalance = `₹${(params.balanceAmount / 100).toLocaleString('en-IN')}`;
    const formattedTotal = `₹${(params.totalAmount / 100).toLocaleString('en-IN')}`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      subject: `Official Booking Receipt — ${params.packageName} Date Locked (#${params.bookingId.slice(0, 8)})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0B0F; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #FFB11A33;">
          <div style="background: linear-gradient(135deg, #FFB11A, #E08E00); padding: 24px; text-align: center; color: #0B0B0F;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">ESWARI SOUND SYSTEM</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Concert Audio & Stage Rigging</p>
          </div>
          
          <div style="padding: 28px;">
            <div style="display: inline-block; background: #052e16; border: 1px solid #22c55e; color: #4ade80; font-size: 12px; font-weight: bold; padding: 4px 12px; rounded-full: 9999px; border-radius: 20px; margin-bottom: 16px;">
              ✓ 25% Advance Paid — Date Locked
            </div>

            <h2 style="color: #FFFFFF; font-size: 18px; margin: 0 0 12px 0;">Hello ${params.customerName},</h2>
            <p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Your date reservation has been officially locked on our master calendar. Our direct sound & rigging crew will arrive 4 hours prior to sound check.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #737373;">Booking Reference</td>
                <td style="padding: 10px 0; color: #FFB11A; font-weight: bold; text-align: right;">#${params.bookingId.slice(0, 8)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #737373;">Rig Package</td>
                <td style="padding: 10px 0; color: #FFFFFF; font-weight: bold; text-align: right;">${params.packageName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #737373;">Event Date</td>
                <td style="padding: 10px 0; color: #FFFFFF; font-weight: bold; text-align: right;">${params.eventDate}</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #737373;">Venue Location</td>
                <td style="padding: 10px 0; color: #FFFFFF; text-align: right;">${params.venueAddress}</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #737373;">Total Contract Value</td>
                <td style="padding: 10px 0; color: #FFFFFF; text-align: right;">${formattedTotal}</td>
              </tr>
              <tr style="border-bottom: 1px solid #262626;">
                <td style="padding: 10px 0; color: #4ade80;">25% Advance Paid</td>
                <td style="padding: 10px 0; color: #4ade80; font-weight: bold; text-align: right;">${formattedAdvance}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #737373;">75% Balance (Due At Venue)</td>
                <td style="padding: 10px 0; color: #FFB11A; font-weight: bold; text-align: right;">${formattedBalance}</td>
              </tr>
            </table>

            <div style="background: #171717; padding: 16px; border-radius: 12px; border: 1px solid #262626; text-align: center; margin-bottom: 24px;">
              <p style="color: #A3A3A3; font-size: 12px; margin: 0 0 8px 0;">Need to view invoice or update logistics?</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://eswari-sound-system.vercel.app'}/my-bookings" style="display: inline-block; background: #FFB11A; color: #0B0B0F; font-size: 12px; font-weight: bold; text-decoration: none; padding: 8px 18px; border-radius: 20px;">
                Check Live Booking Status
              </a>
            </div>

            <p style="color: #737373; font-size: 11px; text-align: center; margin: 0;">
              Eswari Sound System • Direct Depot Logistics Hub, Tamil Nadu • 24/7 Hotline: +91 98765 43210
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err };
  }
}

/**
 * Notifies admin when a new booking request is placed
 */
export async function sendAdminNewBookingAlert(params: {
  customerName: string;
  customerPhone: string;
  packageName: string;
  eventDate: string;
  venueAddress: string;
  bookingId: string;
}) {
  if (!resend) {
    console.log('[Email Simulation] sendAdminNewBookingAlert to admin:', adminEmail);
    return { success: true, simulated: true };
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Action Required: New Order Call Confirmation Needed (#${params.bookingId.slice(0, 8)})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0B0F; color: #FFFFFF; padding: 24px; border-radius: 12px;">
          <h2 style="color: #FFB11A; margin-top: 0;">New Stage Booking Request</h2>
          <p style="color: #E5E5E5; font-size: 14px;">A customer has requested to lock a stage production date. Please call the client to verify power supply and acoustic logistics.</p>
          
          <ul style="color: #A3A3A3; font-size: 13px; line-height: 1.8;">
            <li><strong>Client:</strong> ${params.customerName}</li>
            <li><strong>Phone:</strong> <a href="tel:${params.customerPhone}" style="color: #FFB11A;">${params.customerPhone}</a></li>
            <li><strong>Event Date:</strong> ${params.eventDate}</li>
            <li><strong>Rig Package:</strong> ${params.packageName}</li>
            <li><strong>Venue:</strong> ${params.venueAddress}</li>
          </ul>

          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://eswari-sound-system.vercel.app'}/admin" style="display: inline-block; background: #FFB11A; color: #0B0B0F; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 8px;">
              Open Admin Console to Confirm Order →
            </a>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (err) {
    console.error('Failed to notify admin:', err);
    return { success: false, error: err };
  }
}
