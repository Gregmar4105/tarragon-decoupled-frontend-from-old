<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use Auditable;

    protected $fillable = [
        'session_id',
        'user_id',
        'sent_messages',
        'ai_response',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
