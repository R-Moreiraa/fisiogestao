<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\AuthService;

class AuthMiddleware
{
    public static function authenticate(?array $allowedRoles = null): array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Token de autorização não fornecido ou inválido.'
            ]);
            exit;
        }

        $token = $matches[1];
        $authService = new AuthService();
        $user = $authService->validateToken($token);

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Sessão expirada ou token inválido. Faça login novamente.'
            ]);
            exit;
        }

        if ($allowedRoles !== null && !empty($allowedRoles)) {
            $userRole = $user['role'] ?? 'guest';
            if (!in_array($userRole, $allowedRoles, true) && $userRole !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acesso negado. Seu perfil não possui permissão para esta operação.'
                ]);
                exit;
            }
        }

        return $user;
    }
}

