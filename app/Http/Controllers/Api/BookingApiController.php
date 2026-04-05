<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BookingApiController extends Controller
{
    /**
     * Store a booking specifically requested by the AI Agent.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'customer_name'  => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone' => 'nullable|string|max:255',
                'drop_off_time'  => 'required|date',
                'pick_up_time'   => 'required|date',
                'billing_cycle'  => 'required|in:hourly,daily',
                'bags'           => 'required|array',
            ]);
            
            // Extract bags gracefully
            $smallCount = $request->input('bags.small', 0);
            $mediumCount = $request->input('bags.medium', 0) + $request->input('bags.regular', 0) + $request->input('bags.standard', 0);
            $largeCount = $request->input('bags.large', 0);
            $plusCount = $request->input('bags.plus', 0);

        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = collect($e->errors())->flatten()->implode(', ');
            return response()->json([
                'success' => false,
                'error' => "Booking failed due to missing or invalid data. Instruct the customer to provide missing info: " . $errors
            ], 200); // Return 200 so n8n doesn't crash and the AI can read this error
        }

        try {
            $bookingReference = null;

            DB::transaction(function () use ($validated, &$bookingReference, $smallCount, $mediumCount, $largeCount, $plusCount) {
                // Determine the correct plan based on the billing cycle required
                $plan = Plan::where('billing_cycle', $validated['billing_cycle'])
                            ->where('is_active', true)
                            ->first();

                // Fallback plan if missing
                if (!$plan) {
                    $plan = Plan::first();
                    if (!$plan) {
                        $plan = Plan::create([
                            'name' => ucfirst($validated['billing_cycle']) . ' Rate', 
                            'billing_cycle' => $validated['billing_cycle'],
                            'duration_hours' => $validated['billing_cycle'] === 'daily' ? 24 : 1, 
                            'price' => 5, 
                            'is_active' => true
                        ]);
                    }
                }

                // Security Math: Calculate the precise total cost purely from the backend to prevent AI hallucinated prices
                $totalPrice = 0;
                $durationHours = Carbon::parse($validated['drop_off_time'])->diffInHours(Carbon::parse($validated['pick_up_time']));
                
                // If duration is 0, bump to 1 hour minimum
                if ($durationHours < 1) $durationHours = 1;

                $unitsToBill = $plan->billing_cycle === 'daily' ? ceil($durationHours / 24) : $durationHours;
                if ($unitsToBill < 1) $unitsToBill = 1;



                // Base fallback price
                $basePrice = $plan->price ?? 0;

                $totalPrice += $smallCount * ($plan->price_small ?? $basePrice);
                $totalPrice += $mediumCount * ($plan->price_medium ?? $basePrice);
                $totalPrice += $largeCount * ($plan->price_large ?? $basePrice);
                $totalPrice += $plusCount * ($plan->price_plus ?? $basePrice);

                $totalPrice = $totalPrice * $unitsToBill;

                // Create the booking entry
                $bookingData = [
                    'plan_id' => $plan->id,
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'],
                    'customer_phone' => $validated['customer_phone'] ?? null,
                    'drop_off_time' => Carbon::parse($validated['drop_off_time'])->format('Y-m-d H:i:s'),
                    'pick_up_time' => Carbon::parse($validated['pick_up_time'])->format('Y-m-d H:i:s'),
                    'total_price' => $totalPrice,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'source' => 'online', // Booking created via AI Chat
                    'booking_reference' => 'BK' . strtoupper(uniqid()),
                ];

                $booking = Booking::create($bookingData);
                $bookingReference = $booking->booking_reference;

                // Format the items properly for the relationships
                $itemsToCreate = [];
                if ($smallCount > 0) $itemsToCreate[] = ['item_type' => 'Small Bag', 'quantity' => $smallCount];
                if ($mediumCount > 0) $itemsToCreate[] = ['item_type' => 'Medium Bag', 'quantity' => $mediumCount];
                if ($largeCount > 0) $itemsToCreate[] = ['item_type' => 'Large Bag', 'quantity' => $largeCount];
                if ($plusCount > 0) $itemsToCreate[] = ['item_type' => 'Plus Bag', 'quantity' => $plusCount];

                if (!empty($itemsToCreate)) {
                    $booking->items()->createMany($itemsToCreate);
                }

                // Setup the pending transaction so they can pay on-site
                $booking->transactions()->create([
                    'amount' => $totalPrice,
                    'type' => 'payment',
                    'status' => 'pending',
                    'payment_method' => 'cash',
                    'transaction_reference' => 'TXN' . strtoupper(uniqid()),
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Booking successfully created.',
                'booking_reference' => $bookingReference
            ], 201);

        } catch (\Exception $e) {
            Log::error('AI Booking Creation Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'API Error: ' . $e->getMessage() . '. Please tell the customer there was an internal issue.'
            ], 200); // Return 200 so n8n HTTP node processes the text instead of crashing
        }
    }
}
