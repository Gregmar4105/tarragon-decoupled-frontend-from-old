<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    use Auditable;

    protected $fillable = [
        'booking_id',
        'item_type',
        'quantity',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
