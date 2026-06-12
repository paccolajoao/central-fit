<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Apenas as rotas usadas pela SPA recebem cabeçalhos CORS. Como a
    | autenticação é por cookie de sessão (Sanctum SPA), "supports_credentials"
    | precisa ser true e a origem é restrita ao frontend (FRONTEND_URL).
    |
    */

    'paths' => ['api/*', 'login', 'logout', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Necessário para o navegador enviar/receber os cookies de sessão.
    'supports_credentials' => true,

];
