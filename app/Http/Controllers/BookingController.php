<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\User;
use App\Notifications\NewOnlineBookingNotification;
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
                'plus' => $booking->items->where('item_type', 'Plus Bag')->sum('quantity'),
            ];

            return [
                'id' => $booking->booking_reference,
                'customer' => $booking->customer_name,
                'contact' => $booking->customer_phone ?? $booking->customer_email,
                'bags' => $bags,
                'amount' => (float) $booking->total_price,
                // Status mapping from database to UI expected labels
                'status' => ucfirst(str_replace(['dropped_off', 'completed', '_'], ['checked-in', 'checked-out', '-'], $booking->status)), 
                'payment_status' => ucfirst($booking->payment_status ?? 'pending'),
                'source' => ucfirst($booking->source),
                'checkIn' => Carbon::parse($booking->drop_off_time)->format('Y-m-d h:i A'),
                'checkOut' => Carbon::parse($booking->pick_up_time)->format('Y-m-d h:i A'),
            ];
        });

        return \Inertia\Inertia::render('bookings/index', [
            'initialBookings' => $mappedBookings,
        ]);
    }

    /**
     * Display the specified booking.
     */
    public function show(Booking $booking)
    {
        $booking->load('items', 'transactions');

        $bags = [
            'small' => $booking->items->where('item_type', 'Small Bag')->sum('quantity'),
            'medium' => $booking->items->where('item_type', 'Medium Bag')->sum('quantity'),
            'large' => $booking->items->where('item_type', 'Large Bag')->sum('quantity'),
            'plus' => $booking->items->where('item_type', 'Plus Bag')->sum('quantity'),
        ];

        /* Need payment method */
        $paymentMethod = $booking->transactions->first()?->payment_method ?? 'cash';
        
        $mappedBooking = [
            'id' => $booking->booking_reference,
            'customer' => $booking->customer_name,
            'email' => $booking->customer_email,
            'phone' => $booking->customer_phone,
            'contact' => $booking->customer_phone ?? $booking->customer_email,
            'bags' => $bags,
            'amount' => (float) $booking->total_price,
            'status' => ucfirst(str_replace(['dropped_off', 'completed', '_'], ['checked-in', 'checked-out', '-'], $booking->status)),
            'payment_status' => ucfirst($booking->payment_status ?? 'pending'),
            'payment_method' => ucfirst($paymentMethod),
            'source' => ucfirst($booking->source),
            'checkIn' => Carbon::parse($booking->drop_off_time)->format('Y-m-d h:i A'),
            'checkOut' => Carbon::parse($booking->pick_up_time)->format('Y-m-d h:i A'),
            'tagNumber' => $booking->status !== 'pending' ? 'TAG-' . substr($booking->booking_reference, -4) : null,
            'notes' => null, // Not strongly modelled yet
        ];

        return \Inertia\Inertia::render('bookings/show', [
            'booking' => $mappedBooking,
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
            DB::transaction(function () use ($validated, $request, &$booking) {
                // Dynamic fallback for branch/plan setup
                $branch = \Illuminate\Support\Facades\DB::table('branches')->first();
                if (!$branch) {
                    $branchId = \Illuminate\Support\Facades\DB::table('branches')->insertGetId([
                        'name' => 'Main', 'slug' => 'main', 'address' => '123 Main', 'city' => 'MNL', 'zip' => '1000', 'country' => 'PH', 'capacity' => 100, 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()
                    ]);
                } else {
                    $branchId = $branch->id;
                }

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
                    'branch_id' => $branchId,
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'drop_off_time' => Carbon::parse($validated['drop_off_time'])->format('Y-m-d H:i:s'),
                    'pick_up_time' => Carbon::parse($validated['pick_up_time'])->format('Y-m-d H:i:s'),
                    'total_price' => $validated['total_price'],
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'source' => $request->input('source') === 'admin' ? 'walk-in' : 'online',
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
                if ($validated['items']['plus'] > 0) {
                    $itemsToCreate[] = ['item_type' => 'Plus Bag', 'quantity' => $validated['items']['plus']];
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

            // Dispatch notification if the booking is from the website instead of the admin panel
            if ($request->input('source') !== 'admin') {
                $admins = User::all(); // Broadcast to everyone in the Users table per user request
                \Illuminate\Support\Facades\Notification::send($admins, new NewOnlineBookingNotification($booking));
            }

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
            'bags.plus' => 'sometimes|integer|min:0',
            
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

                // Map UI statuses to database-compatible strings
                if (isset($validated['status'])) {
                    $statusStr = strtolower($validated['status']);
                    if ($statusStr === 'checked-in') {
                        $statusStr = 'dropped_off';
                    }
                    if ($statusStr === 'checked-out') {
                        $statusStr = 'completed';
                    }
                    $validated['status'] = $statusStr;
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
                    if (isset($validated['bags']['plus']) && $validated['bags']['plus'] > 0) {
                        $itemsToCreate[] = ['item_type' => 'Plus Bag', 'quantity' => $validated['bags']['plus']];
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
                if (isset($validated['total_price']) || isset($validated['payment_status'])) {
                    $transaction = $booking->transactions()->first();
                    if ($transaction) {
                        $txnUpdates = [];
                        if (isset($validated['total_price'])) $txnUpdates['amount'] = $validated['total_price'];
                        if (isset($validated['payment_status'])) {
                            // Map 'paid' to 'completed' for transaction status if needed, 
                            // but currently system uses 'pending'/'completed'/'failed' for txns typically.
                            $txnUpdates['status'] = $validated['payment_status'] === 'paid' ? 'completed' : 'pending';
                        }
                        $transaction->update($txnUpdates);
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
