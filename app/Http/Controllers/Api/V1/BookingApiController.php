<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Transaction;
use App\Services\BookingService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingApiController extends Controller
{
    private BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Get list of bookings with filtering.
     */
    public function index(Request $request)
    {
        $query = Booking::latest()->with(['items', 'transactions']);

        // Search filter (customer name, email, phone, reference)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('booking_reference', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'active') {
                $query->whereIn('status', ['pending', 'confirmed']);
            } elseif ($status === 'completed') {
                $query->where('status', 'checked-out');
            } else {
                $query->where('status', $status);
            }
        }

        // Payment status filter
        if ($request->filled('payment') && $request->payment !== 'all') {
            $payment = $request->payment;
            if ($payment === 'successful') {
                $query->where('payment_status', 'paid');
            } else {
                $query->where('payment_status', $payment);
            }
        }

        // Source filter
        if ($request->filled('source') && $request->source !== 'all') {
            $source = $request->source;
            if ($source === 'website') {
                $query->where('source', 'online');
            } elseif ($source === 'walk-in') {
                $query->where('source', 'walk-in');
            }
        }

        $bookings = $query->get();

        return response()->json([
            'data' => $bookings->map(fn ($b) => $this->formatBooking($b))->toArray(),
        ]);
    }

    /**
     * Store walk-in booking by admin.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:255',
            'dropoff' => 'required|date',
            'pickup' => 'required|date',
            'price' => 'required|numeric|min:0',
            'tag_number' => 'nullable|string|max:255',
            'size_counts' => 'required|array',
            'size_counts.small' => 'required|integer|min:0',
            'size_counts.regular' => 'required|integer|min:0',
            'size_counts.large' => 'required|integer|min:0',
            'size_counts.plus' => 'required|integer|min:0',
        ]);

        $data = [
            'customer_name' => $request->name,
            'customer_email' => $request->email,
            'customer_phone' => $request->phone,
            'drop_off_time' => $request->dropoff,
            'pick_up_time' => $request->pickup,
            'total_price' => $request->price,
            'tag_number' => $request->tag_number,
            'items' => [
                'small' => $request->input('size_counts.small', 0),
                'medium' => $request->input('size_counts.regular', 0), // Maps regular to medium in backend database
                'large' => $request->input('size_counts.large', 0),
                'plus' => $request->input('size_counts.plus', 0),
            ],
        ];

        // Create booking with source 'admin'
        $booking = $this->bookingService->createBooking($data, 'admin');

        // Force check-in status if requested
        if ($request->status === 'checked-in') {
            $booking->update(['status' => 'checked-in']);
        }

        // Set payment option on transactions if it's set
        if ($request->has('payment_option')) {
            $transaction = $booking->transactions()->first();
            if ($transaction) {
                // If paid now or pay at check-in is done, update
                if ($request->payment_option === 'pay-now') {
                    $booking->update(['payment_status' => 'paid']);
                    $transaction->update(['status' => 'completed']);
                }
            }
        }

        return response()->json([
            'data' => $this->formatBooking($booking->load(['items', 'transactions'])),
            'message' => 'Walk-in booking created successfully.',
        ], 201);
    }

    /**
     * Store public booking from website.
     */
    public function storePublic(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:255',
            'dropoff' => 'required|date',
            'pickup' => 'required|date',
            'price' => 'required|numeric|min:0',
            'size_counts' => 'required|array',
            'size_counts.small' => 'required|integer|min:0',
            'size_counts.regular' => 'required|integer|min:0',
            'size_counts.large' => 'required|integer|min:0',
            'size_counts.plus' => 'required|integer|min:0',
        ]);

        $data = [
            'customer_name' => $request->name,
            'customer_email' => $request->email,
            'customer_phone' => $request->phone,
            'drop_off_time' => $request->dropoff,
            'pick_up_time' => $request->pickup,
            'total_price' => $request->price,
            'items' => [
                'small' => $request->input('size_counts.small', 0),
                'medium' => $request->input('size_counts.regular', 0),
                'large' => $request->input('size_counts.large', 0),
                'plus' => $request->input('size_counts.plus', 0),
            ],
        ];

        // Create booking with source 'online'
        $booking = $this->bookingService->createBooking($data, 'online');

        // Construct response format exactly as required by Home.tsx congrats modal
        $sizeSummaryParts = [];
        $smallCount = $request->input('size_counts.small', 0);
        $regularCount = $request->input('size_counts.regular', 0);
        $largeCount = $request->input('size_counts.large', 0);
        $plusCount = $request->input('size_counts.plus', 0);

        if ($smallCount > 0) {
            $sizeSummaryParts[] = "Small (x{$smallCount})";
        }
        if ($regularCount > 0) {
            $sizeSummaryParts[] = "Regular (x{$regularCount})";
        }
        if ($largeCount > 0) {
            $sizeSummaryParts[] = "Large (x{$largeCount})";
        }
        if ($plusCount > 0) {
            $sizeSummaryParts[] = "Plus (x{$plusCount})";
        }
        $sizeSummary = implode(', ', $sizeSummaryParts);

        return response()->json([
            'data' => [
                'id' => $booking->booking_reference,
                'name' => $booking->customer_name,
                'email' => $booking->customer_email,
                'dropoff' => Carbon::parse($booking->drop_off_time)->format('Y-m-d H:i'),
                'pickup' => Carbon::parse($booking->pick_up_time)->format('Y-m-d H:i'),
                'size' => $sizeSummary,
                'price' => (float) $booking->total_price,
            ],
            'message' => 'Online booking created successfully.',
        ], 201);
    }

    /**
     * Update booking status or payment information.
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:checked-in,checked-out,cancelled,pending,confirmed',
            'payment_status' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'payment_date' => 'nullable',
            'transaction_id' => 'nullable|string',
        ]);

        $updateData = [];

        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }

        if ($request->has('payment_status')) {
            // Map frontend status 'successful' -> 'paid' on backend
            $updateData['payment_status'] = $request->payment_status === 'successful' ? 'paid' : $request->payment_status;
        }

        // Call booking service to perform the update and log event/send mail
        $booking = $this->bookingService->updateBooking($booking, $updateData);

        // Manually update transaction details if passed (payment processing)
        $transaction = $booking->transactions()->first();
        if ($transaction) {
            $txnUpdates = [];
            if ($request->has('payment_status')) {
                $txnUpdates['status'] = $request->payment_status === 'successful' ? 'completed' : 'pending';
            }
            if ($request->has('payment_method')) {
                $txnUpdates['payment_method'] = strtolower($request->payment_method);
            }
            if ($request->has('transaction_id')) {
                $txnUpdates['transaction_reference'] = $request->transaction_id;
            }
            if (! empty($txnUpdates)) {
                $transaction->update($txnUpdates);
            }
        }

        return response()->json([
            'data' => $this->formatBooking($booking->load(['items', 'transactions'])),
            'message' => 'Booking updated successfully.',
        ]);
    }

    /**
     * Format Booking model to frontend expectations.
     */
    protected function formatBooking(Booking $booking): array
    {
        $smallCount = (int) $booking->items->where('item_type', 'Small Bag')->sum('quantity');
        $mediumCount = (int) $booking->items->where('item_type', 'Medium Bag')->sum('quantity');
        $largeCount = (int) $booking->items->where('item_type', 'Large Bag')->sum('quantity');
        $plusCount = (int) $booking->items->where('item_type', 'Plus Bag')->sum('quantity');

        $totalBags = $smallCount + $mediumCount + $largeCount + $plusCount;

        // Size summary string (e.g. "1 Regular, 2 Large")
        $sizeSummaryParts = [];
        if ($smallCount > 0) {
            $sizeSummaryParts[] = "Small (x{$smallCount})";
        }
        if ($mediumCount > 0) {
            $sizeSummaryParts[] = "Regular (x{$mediumCount})";
        }
        if ($largeCount > 0) {
            $sizeSummaryParts[] = "Large (x{$largeCount})";
        }
        if ($plusCount > 0) {
            $sizeSummaryParts[] = "Plus (x{$plusCount})";
        }
        $sizeSummary = implode(', ', $sizeSummaryParts);

        $transaction = $booking->transactions()->first();

        // Map status for frontend: pending/confirmed -> active, checked-out -> completed
        $frontendStatus = 'active';
        if ($booking->status === 'checked-out') {
            $frontendStatus = 'completed';
        } elseif ($booking->status === 'cancelled') {
            $frontendStatus = 'cancelled';
        } elseif ($booking->status === 'checked-in') {
            $frontendStatus = 'checked-in';
        }

        return [
            'id' => $booking->booking_reference,
            'name' => $booking->customer_name,
            'email' => $booking->customer_email,
            'phone' => $booking->customer_phone ?? '',
            'dropoff' => Carbon::parse($booking->drop_off_time)->toIso8601String(),
            'pickup' => Carbon::parse($booking->pick_up_time)->toIso8601String(),
            'bags' => $totalBags,
            'size' => $sizeSummary ?: 'No luggage items',
            'price' => (float) $booking->total_price,
            'status' => $frontendStatus,
            'source' => $booking->source === 'online' ? 'website' : 'walk-in',
            'tag_number' => $booking->tag_number ?? '',
            'photos' => $booking->photos ?? [],
            'payment_status' => $booking->payment_status === 'paid' ? 'successful' : ($booking->payment_status === 'refunded' ? 'failed' : 'pending'),
            'payment_method' => $transaction ? ucfirst($transaction->payment_method) : 'Cash',
            'payment_date' => $booking->payment_status === 'paid' && $transaction ? $transaction->updated_at->toIso8601String() : null,
            'transaction_id' => $transaction ? $transaction->transaction_reference : null,
            'size_counts' => [
                'small' => $smallCount,
                'regular' => $mediumCount, // map medium back to regular for frontend
                'large' => $largeCount,
                'plus' => $plusCount,
            ],
        ];
    }
}
