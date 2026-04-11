<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DashboardRecentSaleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'name' => $this->customer_name,
            'email' => $this->customer_email ?? 'No email provided',
            'amount' => (float) $this->total_price,
        ];
    }
}
