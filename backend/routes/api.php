<?php

use App\Http\Controllers\Activity\ActivityController;
use App\Http\Controllers\Activity\ActivityImportController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Nutrition\NutritionController;
use App\Http\Controllers\Nutrition\NutritionImportController;
use App\Http\Controllers\Settings\UserSettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas de API (prefixo /api)
|--------------------------------------------------------------------------
|
| Autenticação SPA via Sanctum: o frontend primeiro faz GET em
| /sanctum/csrf-cookie (rota registrada automaticamente pelo Sanctum) e
| depois envia o header X-XSRF-TOKEN nas requisições POST.
|
*/

// Pública — autenticação por e-mail + senha (com rate limiting interno).
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Protegidas — exigem sessão autenticada (cookie do Sanctum).
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me'])->name('user');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Nutrição
    Route::get('/nutrition/daily', [NutritionController::class, 'daily']);
    Route::get('/nutrition/weekly', [NutritionController::class, 'weekly']);
    Route::post('/nutrition/import', [NutritionImportController::class, 'import']);
    Route::delete('/nutrition/entries/{entry}', [NutritionController::class, 'destroy']);

    // Atividades
    Route::get('/activities/daily', [ActivityController::class, 'daily']);
    Route::get('/activities/weekly', [ActivityController::class, 'weekly']);
    Route::delete('/activities/{activity}', [ActivityController::class, 'destroy']);
    Route::post('/activities/import/samsung', [ActivityImportController::class, 'importSamsung']);

    // Configurações
    Route::get('/settings', [UserSettingController::class, 'show']);
    Route::put('/settings', [UserSettingController::class, 'update']);
});
