<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings.
     */
    public function index()
    {
        $bookings = Booking::with('items')->orderBy('created_at', 'desc')->get();

        $mappedBookings = $bookings->map(function ($booking) {
            $bags = [
                'small' => $booking->items->where('item_type', 'Small Bag')->sum('quantity'),
                'medium' => $booking->items->where('item_type', 'Medium Bag')->sum('quantity'),
                'large' => $booking->items->where('item_type', 'Large Bag')->sum('quantity'),
            ];

            return [
                'id' => $booking->booking_reference,
                'customer' => $booking->customer_name,
                'contact' => $booking->customer_phone ?? $booking->customer_email,
                'bags' => $bags,
                'amount' => (float) $booking->total_price,
                // Status mapping from database to UI expected labels
                'status' => ucfirst(str_replace('_', '-', $booking->status)), 
                'source' => $booking->user_id ? 'Online' : 'Walk-in',
                'checkIn' => Carbon::parse($booking->drop_off_time)->format('Y-m-d h:i A'),
                'checkOut' => Carbon::parse($booking->pick_up_time)->format('Y-m-d h:i A'),
            ];
        });

        return \Inertia\Inertia::render('bookings/index', [
            'initialBookings' => $mappedBookings,
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
        ]);

        try {
            DB::transaction(function () use ($validated, &$booking) {
                // No branches to check or insert

                $plan = \Illuminate\Support\Facades\DB::table('plans')->first();
                if (!$plan) {
                    $planId = \Illuminate\Support\Facades\DB::table('plans')->insertGetId([
                        'name' => 'Standard', 'duration_hours' => 24, 'price' => 100, 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()
                    ]);
                } else {
                    $planId = $plan->id;
                }

                $booking = Booking::create([
                    'plan_id' => $planId,
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'drop_off_time' => Carbon::parse($validated['drop_off_time'])->format('Y-m-d H:i:s'),
                    'pick_up_time' => Carbon::parse($validated['pick_up_time'])->format('Y-m-d H:i:s'),
                    'total_price' => $validated['total_price'],
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'booking_reference' => 'BK' . strtoupper(uniqid()),
                ]);

                // Create items based on the provided counts map
                $itemsToCreate = [];
                if ($validated['items']['small'] > 0) {
                    $itemsToCreate[] = ['item_type' => 'Small Bag', 'quantity' => $validated['items']['small']];
                }
                if ($validated['items']['medium'] > 0) {
                    $itemsToCreate[] = ['item_type' => 'Medium Bag', 'quantity' => $validated['items']['medium']];
                }
                if ($validated['items']['large'] > 0) {
                    $itemsToCreate[] = ['item_type' => 'Large Bag', 'quantity' => $validated['items']['large']];
                }

                if (!empty($itemsToCreate)) {
                    $booking->items()->createMany($itemsToCreate);
                }

                $booking->transactions()->create([
                    'amount' => $validated['total_price'],
                    'type' => 'payment',
                    'status' => 'pending',
                    'payment_method' => 'cash', // Default or mocked
                    'transaction_reference' => 'TXN' . strtoupper(uniqid()),
                ]);
            });

            if ($request->input('source') === 'admin') {
                return back()->with('success', 'Walk-in Booking created successfully.')->with('successBookingId', $booking->booking_reference);
            }

            // Redirect to confirmation using Inertia or return JSON depending on how frontend calls it
            // Assuming frontend calls this using Inertia (router.post or fetch API that expects a redirect)
            // Example response (Assuming router.post):
            return redirect()->route('confirmation', ['id' => $booking->booking_reference]);

        } catch (\Exception $e) {
            Log::error('Error creating booking: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to process booking. Please try again.']); // Use Inertia error passing
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
            'status' => 'sometimes|required|in:pending,confirmed,checked-in,checked-out,completed,cancelled',
            'payment_status' => 'sometimes|required|in:pending,paid,refunded',
            'total_price' => 'sometimes|required|numeric|min:0',
            
            // Bags structure directly from frontend Edit functionality
            'bags' => 'sometimes|array',
            'bags.small' => 'sometimes|integer|min:0',
            'bags.medium' => 'sometimes|integer|min:0',
            'bags.large' => 'sometimes|integer|min:0',
            
            // For standard item updates if used in future
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|exists:booking_items,id',
            'items.*.item_type' => 'required_with:items|string|max:255',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.description' => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($booking, $validated) {
                // Formatting dates if provided
                if (isset($validated['drop_off_time'])) {
                    $validated['drop_off_time'] = Carbon::parse($validated['drop_off_time'])->format('Y-m-d H:i:s');
                }
                if (isset($validated['pick_up_time'])) {
                    $validated['pick_up_time'] = Carbon::parse($validated['pick_up_time'])->format('Y-m-d H:i:s');
                }

                // Map 'checked-in' and 'checked-out' to database-compatible strings if needed (or keep as is)
                if (isset($validated['status'])) {
                    $validated['status'] = strtolower($validated['status']);
                }

                // Update basic booking details except items/bags
                $updateData = collect($validated)->except(['items', 'bags'])->toArray();
                $booking->update($updateData);

                // Update bags count if 'bags' is provided from UI
                if (isset($validated['bags'])) {
                    // Wipe existing items and recreate to reflect exact state
                    $booking->items()->delete();
                    
                    $itemsToCreate = [];
                    if (isset($validated['bags']['small']) && $validated['bags']['small'] > 0) {
                        $itemsToCreate[] = ['item_type' => 'Small Bag', 'quantity' => $validated['bags']['small']];
                    }
                    if (isset($validated['bags']['medium']) && $validated['bags']['medium'] > 0) {
                        $itemsToCreate[] = ['item_type' => 'Medium Bag', 'quantity' => $validated['bags']['medium']];
                    }
                    if (isset($validated['bags']['large']) && $validated['bags']['large'] > 0) {
                        $itemsToCreate[] = ['item_type' => 'Large Bag', 'quantity' => $validated['bags']['large']];
                    }

                    if (!empty($itemsToCreate)) {
                        $booking->items()->createMany($itemsToCreate);
                    }
                }

                // Update items if 'items' array is explicitly provided (fallback/alternative)
                if (isset($validated['items'])) {
                    $incomingIds = collect($validated['items'])->pluck('id')->filter()->toArray();
                    
                    // Delete removed items
                    $booking->items()->whereNotIn('id', $incomingIds)->delete();

                    foreach ($validated['items'] as $itemData) {
                        if (isset($itemData['id'])) {
                            $booking->items()->where('id', $itemData['id'])->update([
                                'item_type' => $itemData['item_type'],
                                'quantity' => $itemData['quantity'],
                                'description' => $itemData['description'] ?? null,
                            ]);
                        } else {
                            $booking->items()->create([
                                'item_type' => $itemData['item_type'],
                                'quantity' => $itemData['quantity'],
                                'description' => $itemData['description'] ?? null,
                            ]);
                        }
                    }
                }

                // Update Total Price in Transaction if Total Price changed
                if (isset($validated['total_price'])) {
                    $transaction = $booking->transactions()->first();
                    if ($transaction) {
                        $transaction->update(['amount' => $validated['total_price']]);
                    }
                }
            });

            // Redirect back or output JSON based on Inertia
            return back()->with('success', 'Booking updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating booking: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Failed to update booking. Please try again.']);
        }
    }
}
