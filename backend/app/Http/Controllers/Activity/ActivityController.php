<?php

namespace App\Http\Controllers\Activity;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ActivityController extends Controller
{
    public function daily(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $date = $request->input('date', now()->toDateString());
        $userId = $request->user()->id;

        $activities = Activity::where('user_id', $userId)
            ->whereDate('start_time', $date)
            ->orderBy('start_time')
            ->get();

        $totals = [
            'duration_seconds' => (int) $activities->sum('duration_seconds'),
            'distance_meters' => round((float) $activities->sum('distance_meters'), 2),
            'calories_kcal' => round((float) $activities->sum('calories_kcal'), 1),
        ];

        return response()->json([
            'date' => $date,
            'activities' => $activities->values(),
            'totals' => $totals,
        ]);
    }

    public function weekly(Request $request): JsonResponse
    {
        $request->validate([
            'from' => 'nullable|date_format:Y-m-d',
            'to' => 'nullable|date_format:Y-m-d',
        ]);

        $to = $request->input('to', now()->toDateString());
        $from = $request->input('from', now()->subDays(6)->toDateString());
        $userId = $request->user()->id;

        $activities = Activity::where('user_id', $userId)
            ->whereBetween('start_time', [
                Carbon::parse($from)->startOfDay(),
                Carbon::parse($to)->endOfDay(),
            ])
            ->get();

        $byDay = $activities->groupBy(fn ($a) => $a->start_time->toDateString())
            ->map(function ($dayActivities) {
                return [
                    'duration_seconds' => (int) $dayActivities->sum('duration_seconds'),
                    'distance_meters' => round((float) $dayActivities->sum('distance_meters'), 2),
                    'calories_kcal' => round((float) $dayActivities->sum('calories_kcal'), 1),
                    'activity_count' => $dayActivities->count(),
                ];
            });

        $period = Carbon::parse($from)->daysUntil(Carbon::parse($to));
        $days = [];
        foreach ($period as $day) {
            $dateStr = $day->toDateString();
            $days[$dateStr] = $byDay[$dateStr] ?? [
                'duration_seconds' => 0,
                'distance_meters' => 0,
                'calories_kcal' => 0,
                'activity_count' => 0,
            ];
        }

        $daysActive = collect($days)->filter(fn ($d) => $d['activity_count'] > 0)->count();

        $summary = [
            'total_duration_seconds' => (int) $activities->sum('duration_seconds'),
            'total_distance_meters' => round((float) $activities->sum('distance_meters'), 2),
            'total_calories_kcal' => round((float) $activities->sum('calories_kcal'), 1),
            'days_active' => $daysActive,
        ];

        return response()->json([
            'from' => $from,
            'to' => $to,
            'days' => $days,
            'summary' => $summary,
        ]);
    }

    public function destroy(Request $request, Activity $activity): JsonResponse
    {
        if ($activity->user_id !== $request->user()->id) {
            abort(403);
        }

        $activity->delete();

        return response()->json(['message' => 'Atividade removida com sucesso.']);
    }
}
