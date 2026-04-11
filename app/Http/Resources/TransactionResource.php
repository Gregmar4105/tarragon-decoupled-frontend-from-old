<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->transaction_reference,
            'date' => Carbon::parse($this->created_at)->format('Y-m-d h:i A'),
            'customer' => $this->booking ? $this->booking->customer_name : 'Unknown',
            'email' => $this->booking ? $this->booking->customer_email : '-',
            'source' => $this->booking ? ucfirst($this->booking->source) : 'Unknown',
            'bookingId' => $this->booking ? $this->booking->booking_reference : '-',
            'amount' => (float)$this->amount,
            'method' => ucfirst($this->payment_method),
            'status' => ucfirst(str_replace('_', '-', $this->status)),
        ];
    }
}
