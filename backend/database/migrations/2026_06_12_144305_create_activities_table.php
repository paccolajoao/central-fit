<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('source')->default('manual'); // samsung_health | strava | manual
            $table->string('external_id')->nullable();   // datauuid da origem

            $table->string('activity_type')->nullable(); // run|walk|cycle|swim|workout|...
            $table->string('activity_name')->nullable(); // nome livre do comentário

            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();

            $table->decimal('distance_meters', 10, 2)->nullable();
            $table->decimal('calories_kcal', 8, 2)->nullable();
            $table->decimal('elevation_gain_meters', 8, 2)->nullable();
            $table->decimal('elevation_loss_meters', 8, 2)->nullable();

            $table->unsignedSmallInteger('heart_rate_avg')->nullable();
            $table->unsignedSmallInteger('heart_rate_max')->nullable();
            $table->unsignedSmallInteger('heart_rate_min')->nullable();

            $table->decimal('speed_avg_ms', 6, 3)->nullable(); // m/s
            $table->decimal('speed_max_ms', 6, 3)->nullable();
            $table->unsignedSmallInteger('cadence_avg')->nullable();
            $table->unsignedInteger('step_count')->nullable();

            $table->jsonb('raw_data')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'start_time']);
            $table->unique(['user_id', 'source', 'external_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
