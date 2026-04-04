<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Transaction extends Model
{
    use Auditable;

    protected $fillable = [
        'booking_id',
        'amount',
        'type',
        'status',
        'payment_method',
        'transaction_reference',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
