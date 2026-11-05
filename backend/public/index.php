<?php

declare(strict_types=1);

// Automatic PSR-4 Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = dirname(__DIR__) . '/app/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

// Also include composer autoload if available
if (file_exists(dirname(__DIR__) . '/vendor/autoload.php')) {
    require_once dirname(__DIR__) . '/vendor/autoload.php';
}

use App\Config\Config;
use App\Middleware\CorsMiddleware;
use App\Services\SeedService;

// Set default headers
header('Content-Type: application/json; charset=utf-8');

// Handle CORS
CorsMiddleware::handle();

try {
    // Load config / .env
    Config::load();

    // Auto seed database if empty
    $seeder = new SeedService();
    $seeder->seedIfEmpty();

    // Load routes
    $router = require_once dirname(__DIR__) . '/routes/api.php';

    // Dispatch request
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $uri = $_SERVER['REQUEST_URI'] ?? '/';

    $router->dispatch($method, $uri);
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno no servidor: ' . $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

