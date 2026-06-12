<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Cria o usuário administrador inicial.
     *
     * As credenciais vêm do .env (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME).
     * O uso de updateOrCreate torna o seeder idempotente (seguro reexecutar).
     * A senha é hasheada automaticamente pelo cast 'hashed' no model User.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@centralfit.com')],
            [
                'name' => env('ADMIN_NAME', 'Administrador'),
                'password' => env('ADMIN_PASSWORD', 'password'),
            ],
        );
    }
}
