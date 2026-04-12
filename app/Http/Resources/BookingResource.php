<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $bags = [
            'small' => $this->items->where('item_type', 'Small Bag')->sum('quantity'),
            'medium' => $this->items->where('item_type', 'Medium Bag')->sum('quantity'),
            'large' => $this->items->where('item_type', 'Large Bag')->sum('quantity'),
            'plus' => $this->items->where('item_type', 'Plus Bag')->sum('quantity'),
        ];

        $paymentMethod = $this->transactions->first()?->payment_method ?? 'cash';

        return [
            'id' => $this->booking_reference,
            'customer' => $this->customer_name,
            'email' => $this->customer_email,
            'phone' => $this->customer_phone,
            'contact' => $this->customer_phone ?? ($this->customer_email ?? '-'),
            'bags' => $bags,
            'amount' => (float) $this->total_price,
            'status' => ucfirst($this->status),
            'payment_status' => ucfirst($this->payment_status ?? 'pending'),
            'payment_method' => ucfirst($paymentMethod),
            'source' => ucfirst($this->source),
            'checkIn' => $this->drop_off_time ? Carbon::parse($this->drop_off_time)->format('Y-m-d h:i A') : null,
            'checkOut' => $this->pick_up_time ? Carbon::parse($this->pick_up_time)->format('Y-m-d h:i A') : null,
            'tagNumber' => $this->tag_number ?? ($this->status !== 'pending' ? 'TAG-' . substr($this->booking_reference, -4) : null),
            'photos' => $this->photos ?? [],
            'notes' => $this->notes,
        ];
    }
}
