<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification - Tarragon Manila</title>
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
            text-transform: uppercase;
            font-weight: 600;
        }

        .content {
            padding: 40px;
        }

        .notice-card {
            background-color: #fff7ed;
            border-left: 4px solid #f97316;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .notice-title {
            font-size: 16px;
            font-weight: 700;
            color: #ea580c;
            margin: 0 0 5px 0;
        }

        .notice-desc {
            font-size: 14px;
            color: #7c2d12;
            margin: 0;
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
            width: 150px;
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

        .item-list {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            margin-top: 5px;
            font-size: 14px;
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
            margin-top: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>TARRAGON MANILA</h1>
            <p>New Booking Notification</p>
        </div>

        <div class="content">
            <div class="notice-card">
                <div class="notice-title">Expecting Visitors 📅</div>
                <div class="notice-desc">A new booking has been registered. Please prepare for the visitors at the scheduled drop-off time.</div>
            </div>

            <div class="details-grid">
                <div class="details-row">
                    <span class="details-label">Reference</span>
                    <span class="details-value" style="font-weight: 700;">#{{ $booking->booking_reference }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Source</span>
                    <span class="details-value" style="text-transform: capitalize;">{{ $booking->source === 'online' ? 'Website (Online)' : 'Walk-in' }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Customer</span>
                    <span class="details-value">
                        <strong>{{ $booking->customer_name }}</strong><br>
                        Email: {{ $booking->customer_email }}<br>
                        Phone: {{ $booking->customer_phone ?? 'N/A' }}
                    </span>
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
                    <span class="details-label">Luggage Items</span>
                    <span class="details-value">
                        <div class="item-list">
                            @php
                                $items = $booking->items;
                                $parts = [];
                                foreach ($items as $item) {
                                    $parts[] = "{$item->item_type} (x{$item->quantity})";
                                }
                            @endphp
                            {{ empty($parts) ? 'No items specified' : implode(', ', $parts) }}
                        </div>
                    </span>
                </div>
                <div class="details-row">
                    <span class="details-label">Total Amount</span>
                    <span class="details-value" style="color: #f97316; font-weight: 700; font-size: 18px;">
                        ₱{{ number_format($booking->total_price * 58, 2) }}
                    </span>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <a href="{{ config('app.url') }}/dashboard" class="button" style="color: #ffffff;">Open Admin Dashboard</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>Tarragon Manila System Notification</strong></p>
            <p>© {{ date('Y') }} Tarragon Manila. All rights reserved.</p>
        </div>
    </div>
</body>

</html>
