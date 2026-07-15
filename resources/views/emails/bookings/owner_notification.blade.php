<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification - Tarragon Manila</title>
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

        .notice-card {
            background-color: #fff1f2;
            border-left: 4px solid #ff385c;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
        }

        .notice-title {
            font-size: 16px;
            font-weight: 700;
            color: #ff385c;
            margin: 0 0 5px 0;
        }

        .notice-desc {
            font-size: 14px;
            color: #222222;
            margin: 0;
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
            width: 140px;
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

        .item-list {
            background-color: #f7f7f7;
            border-radius: 12px;
            padding: 16px;
            margin-top: 6px;
            font-size: 14px;
            border: 1px solid #ebebeb;
            color: #222222;
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
            margin-top: 10px;
            box-shadow: 0 2px 8px rgba(255, 56, 92, 0.15);
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
                    <span class="details-value" style="font-weight: 700; color: #222222;">#{{ $booking->booking_reference }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Source</span>
                    <span class="details-value" style="text-transform: capitalize;">{{ $booking->source === 'online' ? 'Website (Online)' : 'Walk-in' }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Customer</span>
                    <span class="details-value">
                        <strong style="color: #222222;">{{ $booking->customer_name }}</strong><br>
                        <span style="color: #6a6a6a; font-size: 13px;">
                            Email: {{ $booking->customer_email }}<br>
                            Phone: {{ $booking->customer_phone ?? 'N/A' }}
                        </span>
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
                    <span class="details-value" style="color: #ff385c; font-weight: 800; font-size: 18px;">
                        ₱{{ number_format($booking->total_price, 2) }}
                    </span>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <a href="{{ config('app.url') }}/dashboard" class="button">Open Admin Dashboard</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>Tarragon Manila System Notification</strong></p>
            <p>© {{ date('Y') }} Tarragon Manila. All rights reserved.</p>
        </div>
    </div>
</body>

</html>
