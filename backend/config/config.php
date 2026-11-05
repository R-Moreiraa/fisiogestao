<?php

declare(strict_types=1);

namespace App\Config;

class Config
{
    private static array $env = [];

    public static function load(): void
    {
        $envFile = dirname(__DIR__) . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                $parts = explode('=', $line, 2);
                if (count($parts) === 2) {
                    $key = trim($parts[0]);
                    $val = trim($parts[1]);
                    // Strip quotes if any
                    $val = trim($val, "\"'");
                    self::$env[$key] = $val;
                    $_ENV[$key] = $val;
                    putenv("{$key}={$val}");
                }
            }
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        // First check server system environment variables (Docker, Railway, Render, etc.)
        $systemVal = getenv($key);
        if ($systemVal !== false && $systemVal !== '') {
            return $systemVal;
        }
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
            return $_ENV[$key];
        }
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
            return $_SERVER[$key];
        }

        // Then check parsed .env file if non-empty
        if (isset(self::$env[$key]) && self::$env[$key] !== '') {
            return self::$env[$key];
        }

        return $default;
    }
}

