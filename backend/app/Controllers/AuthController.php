<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuthService;
use App\Services\AuditLogService;

class AuthController
{
    private RedisRepository $repo;
    private AuthService $auth;
    private AuditLogService $audit;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->auth = new AuthService();
        $this->audit = new AuditLogService();
    }

    public function login(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $email = trim($body['email'] ?? '');
        $password = (string)($body['password'] ?? '');

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Informe e-mail e senha.']);
            return;
        }

        $allUsers = $this->repo->all('users');
        $user = null;
        foreach ($allUsers as $u) {
            if (strcasecmp($u['email'] ?? '', $email) === 0) {
                $user = $u;
                break;
            }
        }

        if (!$user || !isset($user['password_hash']) || !$this->auth->verifyPassword($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Credenciais inválidas. Verifique seu e-mail e senha.']);
            return;
        }

        if (($user['status'] ?? 'ativo') !== 'ativo') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Esta conta de usuário está inativa.']);
            return;
        }

        // Only staff can login in management portal
        if ($user['role'] === 'paciente') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Usuário paciente. Por favor acesse o Portal do Paciente.']);
            return;
        }

        $payload = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'professional_id' => $user['professional_id'] ?? null
        ];

        $token = $this->auth->createToken($payload);
        $this->audit->log('login_gestao', 'users', $user['id'], ['email' => $email], $payload);

        unset($user['password_hash']);

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    }

    public function loginPatient(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $identifier = trim($body['identifier'] ?? ''); // CPF or email
        $password = (string)($body['password'] ?? '');

        if (empty($identifier) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Informe CPF/E-mail e sua senha.']);
            return;
        }

        $cleanIdentifier = preg_replace('/\D/', '', $identifier);
        $allUsers = $this->repo->all('users');
        $user = null;

        foreach ($allUsers as $u) {
            $userCpfClean = preg_replace('/\D/', '', $u['cpf'] ?? '');
            if (
                ($userCpfClean && $cleanIdentifier && $userCpfClean === $cleanIdentifier) ||
                (strcasecmp($u['email'] ?? '', $identifier) === 0)
            ) {
                if ($u['role'] === 'paciente') {
                    $user = $u;
                    break;
                }
            }
        }

        if (!$user || !isset($user['password_hash']) || !$this->auth->verifyPassword($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Acesso não encontrado ou senha incorreta.']);
            return;
        }

        if (($user['status'] ?? 'ativo') !== 'ativo') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Acesso do paciente suspenso ou inativo.']);
            return;
        }

        $payload = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => 'paciente',
            'patient_id' => $user['patient_id'] ?? null
        ];

        $token = $this->auth->createToken($payload);
        $this->audit->log('login_paciente', 'users', $user['id'], ['identifier' => $identifier], $payload);

        unset($user['password_hash']);

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    }

    public function me(array $currentUser): void
    {
        $user = $this->repo->find('users', $currentUser['id']);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
            return;
        }

        unset($user['password_hash']);
        echo json_encode(['success' => true, 'user' => $user]);
    }

    public function forgotPassword(): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $email = trim($body['email'] ?? '');

        // In a real email flow this sends an email with reset token.
        // We will simulate the receipt and return success message.
        echo json_encode([
            'success' => true,
            'message' => 'Se o e-mail estiver cadastrado, as instruções para redefinição foram enviadas com sucesso.'
        ]);
    }
}

