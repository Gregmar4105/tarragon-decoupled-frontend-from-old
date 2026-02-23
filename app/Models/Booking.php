<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'branch_id',
        'location_id',
        'plan_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'drop_off_time',
        'pick_up_time',
        'total_price',
        'status',
        'payment_status',
        'booking_reference',
        'qr_code_path',
    ];

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
