<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Tarragon Manila</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #222222;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
            border: 1px solid #ebebeb;
        }

        .header {
            background-color: #ffffff;
            padding: 30px 40px;
            text-align: center;
            border-bottom: 1px solid #ebebeb;
        }

        .header h1 {
            color: #ff385c;
            margin: 0;
            font-size: 24px;
            letter-spacing: 1.5px;
            font-weight: 800;
        }

        .header p {
            color: #6a6a6a;
            margin: 5px 0 0;
            font-size: 13px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .content {
            padding: 40px;
        }

        .welcome {
            font-size: 18px;
            font-weight: 700;
            color: #222222;
            margin-bottom: 8px;
        }

        .status-badge {
            display: inline-block;
            background-color: #fff1f2;
            color: #ff385c;
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
        }

        .details-grid {
            border-top: 1px solid #ebebeb;
            border-bottom: 1px solid #ebebeb;
            padding: 24px 0;
            margin-bottom: 32px;
        }

        .details-row {
            display: flex;
            margin-bottom: 16px;
        }

        .details-row:last-child {
            margin-bottom: 0;
        }

        .details-label {
            width: 130px;
            color: #6a6a6a;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding-top: 2px;
        }

        .details-value {
            flex: 1;
            font-size: 15px;
            font-weight: 500;
            color: #222222;
        }

        .pass-card {
            background-color: #ff385c;
            color: #ffffff;
            border-radius: 16px;
            padding: 32px 24px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(255, 56, 92, 0.15);
        }

        .pass-card h2 {
            font-size: 13px;
            letter-spacing: 1.5px;
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 24px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .qr-wrapper {
            background: #ffffff;
            padding: 16px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .qr-wrapper img {
            display: block;
        }

        .booking-ref {
            font-family: 'Courier New', Courier, monospace;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 3px;
            margin-bottom: 8px;
            color: #ffffff;
        }

        .pass-instructions {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.85);
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .footer {
            padding: 30px 40px;
            background-color: #fafafa;
            border-top: 1px solid #ebebeb;
            text-align: center;
            font-size: 12px;
            color: #929292;
        }

        .footer p {
            margin: 4px 0;
        }

        .button {
            display: inline-block;
            background-color: #ff385c;
            color: #ffffff !important;
            padding: 14px 30px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            margin-top: 24px;
            box-shadow: 0 2px 8px rgba(255, 56, 92, 0.15);
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
                <div class="status-badge" style="background-color: #f0fdf4; color: #166534;">BOOKING COMPLETED</div>
                <h2 style="font-size: 22px; color: #ff385c; margin: 16px 0 8px; font-weight: 700;">Thank you! 🎉</h2>
                <p style="margin-bottom: 24px; color: #6a6a6a; font-size: 14px;">Your luggage stay has ended. Thank you for choosing Tarragon Manila. Here is your digital receipt.</p>
            @elseif($booking->status === 'checked-in')
                <div class="status-badge" style="background-color: #eff6ff; color: #1e40af;">GUEST CHECKED IN</div>
                <p style="margin-bottom: 24px; color: #6a6a6a; font-size: 14px;">Your items are safe with us! Your booking is now active. Use the QR code below for checkout later.</p>
            @else
                <div class="status-badge">BOOKING CONFIRMED</div>
                <p style="margin-bottom: 24px; color: #6a6a6a; font-size: 14px;">Your booking is now secured. Use the pass below when dropping off your items at our facility.</p>
            @endif

            <div class="details-grid">
                <div class="details-row">
                    <span class="details-label">Reference</span>
                    <span class="details-value" style="font-weight: 700; color: #222222;">#{{ $booking->booking_reference }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Drop-off</span>
                    <span class="details-value">{{ \Carbon\Carbon::parse($booking->drop_off_time)->format('M d, Y h:i A') }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Pick-up</span>
                    <span class="details-value">{{ \Carbon\Carbon::parse($booking->pick_up_time)->format('M d, Y h:i A') }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Total Price</span>
                    <span class="details-value" style="color: #ff385c; font-weight: 800; font-size: 18px;">₱{{ number_format($booking->total_price, 2) }}</span>
                </div>
            </div>

            @if($booking->status !== 'checked-out')
            <div class="pass-card">
                <h2>{{ $booking->status === 'checked-in' ? 'CHECK-OUT PASS' : 'CHECK-IN PASS' }}</h2>
                <div class="qr-wrapper">
                    <img src="{{ $message->embedData($qrCodePng, 'qrcode.png', 'image/png') }}"
                        width="180" height="180" alt="QR Code">
                </div>
                <div class="booking-ref">{{ $booking->booking_reference }}</div>
                <div class="pass-instructions">SCAN THIS CODE AT THE COUNTER</div>
            </div>
            @else
            <div style="background-color: #f7f7f7; border: 2px dashed #ebebeb; border-radius: 16px; padding: 30px; text-align: center;">
                <h2 style="font-size: 13px; color: #6a6a6a; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Official Receipt</h2>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #ff385c; margin: 12px 0;">PAID</div>
                <div style="color: #929292; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Transaction ID: #{{ $booking->transactions->first()->transaction_reference ?? 'N/A' }}</div>
            </div>
            @endif

            <div style="text-align: center; margin-top: 10px;">
                <a href="{{ config('app.url') }}/confirmation/{{ $booking->booking_reference }}" class="button">View Online Pass</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>Tarragon Manila</strong></p>
            <p>Luggage Storage Rentals in Villamor, Pasay City</p>
            <p style="margin-top: 16px;">© {{ date('Y') }} Tarragon Manila. All rights reserved.</p>
        </div>
    </div>
</body>

</html>