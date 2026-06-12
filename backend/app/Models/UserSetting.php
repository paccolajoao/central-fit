<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'nutrition_goals',
        'activity_goals',
        'cronometer_email',
        'cronometer_password_encrypted',
    ];

    protected $casts = [
        'nutrition_goals' => 'array',
        'activity_goals' => 'array',
    ];

    protected $hidden = [
        'cronometer_password_encrypted',
    ];

    protected $appends = [
        'cronometer_configured',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getCronometerConfiguredAttribute(): bool
    {
        return !empty($this->cronometer_email) && !empty($this->cronometer_password_encrypted);
    }

    public function setCronometerPassword(string $password): void
    {
        $this->cronometer_password_encrypted = Crypt::encrypt($password);
    }

    public function getCronometerPassword(): ?string
    {
        if (empty($this->cronometer_password_encrypted)) {
            return null;
        }

        return Crypt::decrypt($this->cronometer_password_encrypted);
    }
}
