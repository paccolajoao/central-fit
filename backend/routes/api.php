<?php

use App\Http\Controllers\Auth\AuthController;
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
});
