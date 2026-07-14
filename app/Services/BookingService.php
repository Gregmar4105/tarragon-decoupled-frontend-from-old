<?php

namespace App\Services;

use App\Mail\BookingConfirmation;
use App\Mail\NewBookingOwnerMail;
use App\Models\Booking;
use App\Models\User;
use App\Notifications\NewOnlineBookingNotification;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;

class BookingService
{
    /**
     * Create a new booking.
     *
     * @param  array  $data  Validated request data
     * @param  string  $source  The source of the booking (admin vs online)
     *
     * @throws Exception
     */
    public function createBooking(array $data, string $source): Booking
    {
        return DB::transaction(function () use ($data, $source) {
            $booking = $this->storeBookingRecord($data, $source);

            $this->storeBookingItems($booking, $data['items']);
            $this->storeInitialTransaction($booking, $data['total_price']);

            if (isset($data['images']) && is_array($data['images'])) {
                $photoPaths = [];
                foreach ($data['images'] as $image) {
                    $path = $image->store('bookings', 'public');
                    $photoPaths[] = $path;
                }
                $booking->update(['photos' => $photoPaths]);
            }

            // Send confirmation email to client
            try {
                Mail::to($booking->customer_email)->send(new BookingConfirmation($booking));
            } catch (Exception $e) {
                Log::error('Failed to send booking confirmation email: '.$e->getMessage());
            }

            // Send notification email to owner
            try {
                Mail::to('tarragonmanila@gmail.com')->send(new NewBookingOwnerMail($booking));
            } catch (Exception $e) {
                Log::error('Failed to send owner booking notification: '.$e->getMessage());
            }

            if ($source !== 'admin') {
                $this->notifyAdmins($booking);
            }

            return $booking;
        });
    }

    /**
     * Update an existing booking.
     *
     * @param  array  $data  Validated update data
     */
    public function updateBooking(Booking $booking, array $data): Booking
    {
        return DB::transaction(function () use ($booking, $data) {
            $oldStatus = $booking->status;

            $this->updateBookingDetails($booking, $data);

            if (isset($data['bags'])) {
                $this->syncBagsFromFrontend($booking, $data['bags']);
            } elseif (isset($data['items'])) {
                $this->syncStandardItems($booking, $data['items']);
            }

            // Handle photos update if provided
            if (isset($data['images']) && is_array($data['images'])) {
                $existingPhotos = $booking->photos ?? [];
                $newPhotos = [];
                foreach ($data['images'] as $image) {
                    // Check if it's already a path or a new file
                    if (is_string($image)) {
                        $newPhotos[] = $image;
                    } else {
                        $path = $image->store('bookings', 'public');
                        $newPhotos[] = $path;
                    }
                }
                $booking->update(['photos' => array_merge($existingPhotos, $newPhotos)]);
            }

            $this->syncTransactionUpdates($booking, $data);

            $booking->refresh();

            // Notify customer if status changed
            if ($oldStatus !== $booking->status) {
                try {
                    Mail::to($booking->customer_email)->send(new BookingConfirmation($booking));
                } catch (Exception $e) {
                    Log::error('Failed to send status update email: '.$e->getMessage());
                }
            }

            return $booking;
        });
    }

    /**
     * Create the primary booking record.
     */
    private function storeBookingRecord(array $data, string $source): Booking
    {
        // Require a valid plan to exist in the database.
        $plan = DB::table('plans')->where('is_active', 1)->first();
        if (! $plan) {
            throw new Exception('No active pricing plan found. Please set up a plan first.');
        }

        $bookingData = [
            'plan_id' => $plan->id,
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'customer_phone' => $data['customer_phone'] ?? null,
            'drop_off_time' => Carbon::parse($data['drop_off_time'])->format('Y-m-d H:i:s'),
            'pick_up_time' => Carbon::parse($data['pick_up_time'])->format('Y-m-d H:i:s'),
            'total_price' => $data['total_price'],
            'status' => $source === 'admin' ? 'checked-in' : 'pending',
            'payment_status' => 'pending',
            'source' => $source === 'admin' ? 'walk-in' : 'online',
            'booking_reference' => 'BK'.strtoupper(uniqid()),
            'tag_number' => $data['tag_number'] ?? null,
        ];

        // Assign default branch
        if (Schema::hasColumn('bookings', 'branch_id')) {
            $bookingData['branch_id'] = 1;
        }

        $booking = new Booking;
        $booking->forceFill($bookingData);
        $booking->save();

        return $booking;
    }

    /**
     * Store related items for the booking based on the quantities provided.
     */
    private function storeBookingItems(Booking $booking, array $items): void
    {
        $itemsToCreate = collect([
            'Small Bag' => $items['small'] ?? 0,
            'Medium Bag' => $items['medium'] ?? 0,
            'Large Bag' => $items['large'] ?? 0,
            'Plus Bag' => $items['plus'] ?? 0,
        ])->filter(fn ($count) => $count > 0)
            ->map(fn ($count, $type) => ['item_type' => $type, 'quantity' => $count])
            ->values()
            ->toArray();

        if (! empty($itemsToCreate)) {
            $booking->items()->createMany($itemsToCreate);
        }
    }

    /**
     * Create the initial pending transaction.
     */
    private function storeInitialTransaction(Booking $booking, float $amount): void
    {
        $booking->transactions()->create([
            'amount' => $amount,
            'type' => 'payment',
            'status' => 'pending',
            'payment_method' => 'cash',
            'transaction_reference' => 'TXN'.strtoupper(uniqid()),
        ]);
    }

    /**
     * Dispatch notification to all admins for online bookings.
     */
    private function notifyAdmins(Booking $booking): void
    {
        $admins = User::all();
        Notification::send($admins, new NewOnlineBookingNotification($booking));
    }

    /**
     * Helper to update standard booking fields.
     */
    private function updateBookingDetails(Booking $booking, array $data): void
    {
        if (isset($data['drop_off_time'])) {
            $data['drop_off_time'] = Carbon::parse($data['drop_off_time'])->format('Y-m-d H:i:s');
        }
        if (isset($data['pick_up_time'])) {
            $data['pick_up_time'] = Carbon::parse($data['pick_up_time'])->format('Y-m-d H:i:s');
        }
        if (isset($data['status'])) {
            $data['status'] = strtolower($data['status']);
        }

        $updateData = collect($data)->except(['items', 'bags'])->toArray();
        $booking->update($updateData);
    }

    /**
     * Wipe existing bags and rebuild them from the new state provided by the Edit Modal.
     */
    private function syncBagsFromFrontend(Booking $booking, array $bags): void
    {
        $booking->items()->delete();
        $this->storeBookingItems($booking, $bags);
    }

    /**
     * Alternative list-based item updating logic.
     */
    private function syncStandardItems(Booking $booking, array $items): void
    {
        $incomingIds = collect($items)->pluck('id')->filter()->toArray();
        $booking->items()->whereNotIn('id', $incomingIds)->delete();

        foreach ($items as $itemData) {
            $booking->items()->updateOrCreate(
                ['id' => $itemData['id'] ?? null],
                [
                    'item_type' => $itemData['item_type'],
                    'quantity' => $itemData['quantity'],
                    'description' => $itemData['description'] ?? null,
                ]
            );
        }
    }

    /**
     * Keep transaction payment amounts or statuses in sync.
     */
    private function syncTransactionUpdates(Booking $booking, array $data): void
    {
        if (isset($data['total_price']) || isset($data['payment_status'])) {
            $transaction = $booking->transactions()->first();
            if ($transaction) {
                $txnUpdates = [];
                if (isset($data['total_price'])) {
                    $txnUpdates['amount'] = $data['total_price'];
                }
                if (isset($data['payment_status'])) {
                    $txnUpdates['status'] = $data['payment_status'] === 'paid' ? 'completed' : 'pending';
                }
                $transaction->update($txnUpdates);
            }
        }
    }
}
