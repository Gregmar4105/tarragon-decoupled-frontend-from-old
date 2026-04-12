<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Tarragon Manila</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap');

        body {
            font-family: 'Instrument Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .header {
            background-color: #f97316;
            /* Brand Orange */
            padding: 40px 20px;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            letter-spacing: 2px;
            font-weight: 700;
        }

        .header p {
            color: #ffedd5;
            margin: 10px 0 0;
            font-size: 14px;
        }

        .content {
            padding: 40px;
        }

        .welcome {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            background-color: #f0fdf4;
            color: #166534;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 30px;
        }

        .details-grid {
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            padding: 24px 0;
            margin-bottom: 40px;
        }

        .details-row {
            display: flex;
            margin-bottom: 15px;
        }

        .details-label {
            width: 120px;
            color: #71717a;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .details-value {
            flex: 1;
            font-size: 15px;
            font-weight: 500;
        }

        .pass-card {
            background-color: #f97316;
            /* Brand Orange */
            color: #ffffff;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            position: relative;
        }

        .pass-card h2 {
            font-size: 14px;
            letter-spacing: 1px;
            color: #ffedd5;
            margin: 0 0 20px;
            font-weight: 600;
        }

        .qr-wrapper {
            background: #ffffff;
            padding: 15px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 15px;
        }

        .qr-wrapper img {
            display: block;
        }

        .booking-ref {
            font-family: 'Courier New', Courier, monospace;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 3px;
            margin-bottom: 5px;
        }

        .pass-instructions {
            font-size: 11px;
            color: #ffffff;
            opacity: 0.9;
            text-transform: uppercase;
            font-weight: 600;
        }

        .footer {
            padding: 30px 40px;
            background-color: #fafafa;
            text-align: center;
            font-size: 12px;
            color: #a1a1aa;
        }

        .footer p {
            margin: 5px 0;
        }

        .button {
            display: inline-block;
            background-color: #f97316;
            color: #ffffff;
            padding: 14px 28px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>TARRAGON MANILA</h1>
            <p>Luggage Storage Rentals</p>
        </div>

        <div class="content">
            <div class="welcome">Hi {{ $booking->customer_name }},</div>
            @if($booking->status === 'checked-out')
                <div class="status-badge" style="background-color: #dcfce7; color: #15803d;">BOOKING COMPLETED</div>
                <h2 style="font-size: 24px; color: #f97316; margin-top: 20px;">Congratulations! 🎉</h2>
                <p style="margin-bottom: 30px; color: #52525b;">Your luggage stay has ended. Thank you for choosing Tarragon Manila. Here is your digital receipt.</p>
            @elseif($booking->status === 'checked-in')
                <div class="status-badge" style="background-color: #dbeafe; color: #1e40af;">CHECKED IN</div>
                <p style="margin-bottom: 30px; color: #52525b;">Your items are safe with us! Your booking is now active. Use the QR code below for checkout later.</p>
            @else
                <div class="status-badge">BOOKING CONFIRMED</div>
                <p style="margin-bottom: 30px; color: #52525b;">Your booking is now secured. Use the pass below when dropping off your items at our facility.</p>
            @endif

            <div class="details-grid">
                <div class="details-row">
                    <span class="details-label">Reference</span>
                    <span class="details-value">#{{ $booking->booking_reference }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Drop-off</span>
                    <span
                        class="details-value">{{ \Carbon\Carbon::parse($booking->drop_off_time)->format('M d, Y h:i A') }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Pick-up</span>
                    <span
                        class="details-value">{{ \Carbon\Carbon::parse($booking->pick_up_time)->format('M d, Y h:i A') }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Total</span>
                    <span class="details-value"
                        style="color: #f97316; font-weight: 700; font-size: 18px;">₱{{ number_format($booking->total_price, 2) }}</span>
                </div>
            </div>

            @if($booking->status !== 'checked-out')
            <div class="pass-card">
                <h2>{{ $booking->status === 'checked-in' ? 'CHECK-OUT PASS' : 'CHECK-IN PASS' }}</h2>
                <div class="qr-wrapper">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data={{ $booking->booking_reference }}"
                        width="180" height="180" alt="QR Code">
                </div>
                <div class="booking-ref">{{ $booking->booking_reference }}</div>
                <div class="pass-instructions">SCAN THIS CODE AT THE COUNTER</div>
            </div>
            @else
            <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 30px; text-align: center;">
                <h2 style="font-size: 14px; color: #64748b; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Official Receipt</h2>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #1e293b; margin: 15px 0;">PAID</div>
                <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Transaction ID: #{{ $booking->transactions->first()->transaction_reference ?? 'N/A' }}</div>
            </div>
            @endif

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/confirmation/{{ $booking->booking_reference }}" class="button">View
                    Online Pass</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>Tarragon Manila</strong></p>
            <p>Luggage Storage Rentals in Villamor, Pasay City</p>
            <p style="margin-top: 20px;">© {{ date('Y') }} Tarragon Manila. All rights reserved.</p>
        </div>
    </div>
</body>

</html>