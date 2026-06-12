<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'source',
        'external_id',
        'activity_type',
        'activity_name',
        'start_time',
        'end_time',
        'duration_seconds',
        'distance_meters',
        'calories_kcal',
        'elevation_gain_meters',
        'elevation_loss_meters',
        'heart_rate_avg',
        'heart_rate_max',
        'heart_rate_min',
        'speed_avg_ms',
        'speed_max_ms',
        'cadence_avg',
        'step_count',
        'raw_data',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'duration_seconds' => 'integer',
        'distance_meters' => 'float',
        'calories_kcal' => 'float',
        'elevation_gain_meters' => 'float',
        'elevation_loss_meters' => 'float',
        'heart_rate_avg' => 'integer',
        'heart_rate_max' => 'integer',
        'heart_rate_min' => 'integer',
        'speed_avg_ms' => 'float',
        'speed_max_ms' => 'float',
        'cadence_avg' => 'integer',
        'step_count' => 'integer',
        'raw_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
