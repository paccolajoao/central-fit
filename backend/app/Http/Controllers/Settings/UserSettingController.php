<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\UserSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSettingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $settings = $request->user()->settings ?? new UserSetting([
            'nutrition_goals' => null,
            'cronometer_email' => null,
        ]);

        return response()->json([
            'nutrition_goals' => $settings->nutrition_goals ?? [
                'calories' => 2000,
                'protein' => 150,
                'carbs' => 200,
                'fat' => 65,
            ],
            'activity_goals' => $settings->activity_goals ?? [
                'weekly_duration_minutes' => 150,
                'daily_calories' => 400,
                'daily_steps' => 8000,
            ],
            'cronometer_email' => $settings->cronometer_email,
            'cronometer_configured' => $settings->cronometer_configured ?? false,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'nutrition_goals' => 'nullable|array',
            'nutrition_goals.calories' => 'nullable|numeric|min:0|max:10000',
            'nutrition_goals.protein' => 'nullable|numeric|min:0|max:1000',
            'nutrition_goals.carbs' => 'nullable|numeric|min:0|max:2000',
            'nutrition_goals.fat' => 'nullable|numeric|min:0|max:1000',
            'activity_goals' => 'nullable|array',
            'activity_goals.weekly_duration_minutes' => 'nullable|integer|min:0|max:10000',
            'activity_goals.daily_calories' => 'nullable|integer|min:0|max:5000',
            'activity_goals.daily_steps' => 'nullable|integer|min:0|max:100000',
            'cronometer_email' => 'nullable|email|max:255',
            'cronometer_password' => 'nullable|string|min:1|max:255',
        ]);

        $settings = UserSetting::firstOrNew(['user_id' => $request->user()->id]);

        if ($request->has('nutrition_goals')) {
            $settings->nutrition_goals = $request->input('nutrition_goals');
        }

        if ($request->has('activity_goals')) {
            $settings->activity_goals = $request->input('activity_goals');
        }

        if ($request->has('cronometer_email')) {
            $settings->cronometer_email = $request->input('cronometer_email');
        }

        if ($request->filled('cronometer_password')) {
            $settings->setCronometerPassword($request->input('cronometer_password'));
        }

        $settings->save();

        return response()->json([
            'nutrition_goals' => $settings->nutrition_goals,
            'activity_goals' => $settings->activity_goals,
            'cronometer_email' => $settings->cronometer_email,
            'cronometer_configured' => $settings->cronometer_configured,
        ]);
    }
}
