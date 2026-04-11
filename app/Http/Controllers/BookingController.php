<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Services\BookingService;
use App\Repositories\BookingRepository;
use App\Http\Resources\BookingResource;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    private BookingService $bookingService;
    private BookingRepository $bookingRepository;

    public function __construct(BookingService $bookingService, BookingRepository $bookingRepository)
    {
        $this->bookingService = $bookingService;
        $this->bookingRepository = $bookingRepository;
    }

    /**
     * Display a listing of bookings.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'payment', 'source']);
        $paginatedBookings = $this->bookingRepository->getPaginatedList($filters);

        return Inertia::render('bookings/index', [
            // Return flat array mapped correctly for existing UI compatibility
            'initialBookings' => BookingResource::collection($paginatedBookings->items())->resolve(),
        ]);
    }

    /**
     * Display the specified booking.
     */
    public function show(Booking $booking)
    {
        $booking->load('items', 'transactions');

        return Inertia::render('bookings/show', [
            'booking' => (new BookingResource($booking))->resolve(),
        ]);
    }

    /**
     * Store a newly created booking in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'drop_off_time' => 'required|date',
            'pick_up_time' => 'required|date',
            'total_price' => 'required|numeric|min:0',
            'items' => 'required|array',
            'items.small' => 'required|integer|min:0',
            'items.medium' => 'required|integer|min:0',
            'items.large' => 'required|integer|min:0',
            'items.plus' => 'required|integer|min:0',
        ]);

        try {
            $source = $request->input('source', 'online');
            $booking = $this->bookingService->createBooking($validated, $source);

            if ($source === 'admin') {
                return back()->with('success', 'Walk-in Booking created successfully.')->with('successBookingId', $booking->booking_reference);
            }

            return redirect()->route('confirmation', ['id' => $booking->booking_reference]);
        } catch (\Exception $e) {
            Log::error('Error creating booking: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to process booking. ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified booking in storage.
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'customer_name' => 'sometimes|string|max:255',
            'customer_email' => 'sometimes|nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:255',
            'drop_off_time' => 'sometimes|required|date',
            'pick_up_time' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:pending,confirmed,checked-in,checked-out,cancelled',
            'payment_status' => 'sometimes|required|in:pending,paid,refunded',
            'total_price' => 'sometimes|required|numeric|min:0',
            'bags' => 'sometimes|array',
            'bags.small' => 'sometimes|integer|min:0',
            'bags.medium' => 'sometimes|integer|min:0',
            'bags.large' => 'sometimes|integer|min:0',
            'bags.plus' => 'sometimes|integer|min:0',
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|exists:booking_items,id',
            'items.*.item_type' => 'required_with:items|string|max:255',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.description' => 'nullable|string',
        ]);

        try {
            $this->bookingService->updateBooking($booking, $validated);
            return back()->with('success', 'Booking updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating booking: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to update booking. Please try again.']);
        }
    }
}
