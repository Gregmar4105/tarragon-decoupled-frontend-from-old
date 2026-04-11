<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DashboardRecentBookingResource extends JsonResource
{
    public function toArray($request)
    {
        $transaction = $this->transactions->first();

        return [
            'id' => $this->booking_reference,
            'customer' => $this->customer_name,
            'status' => ucfirst($this->status),
            'payment' => $transaction ? ucfirst($transaction->payment_method) : 'N/A',
            'transactionId' => $transaction ? $transaction->transaction_reference : 'N/A',
        ];
    }
}
