<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Config;

class AuthService
{
    private string $secret;

    public function __construct()
    {
        $this->secret = Config::get('JWT_SECRET', 'fisio-jwt-super-secret-key-change-in-production-2025');
    }

    public function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    }

    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function createToken(array $payload, int $ttlSeconds = 86400): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + $ttlSeconds;

        $base64Header = $this->base64UrlEncode(json_encode($header));
        $base64Payload = $this->base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $this->secret, true);
        $base64Signature = $this->base64UrlEncode($signature);

        return "{$base64Header}.{$base64Payload}.{$base64Signature}";
    }

    public function validateToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$base64Header, $base64Payload, $base64Signature] = $parts;

        $expectedSig = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $this->secret, true);
        $expectedBase64Sig = $this->base64UrlEncode($expectedSig);

        if (!hash_equals($expectedBase64Sig, $base64Signature)) {
            return null;
        }

        $payloadJson = $this->base64UrlDecode($base64Payload);
        $payload = json_decode($payloadJson, true);

        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}

