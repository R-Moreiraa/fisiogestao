<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;
use App\Services\AuthService;

class ProfessionalController
{
    private RedisRepository $repo;
    private AuditLogService $audit;
    private AuthService $auth;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
        $this->auth = new AuthService();
    }

    public function index(): void
    {
        $all = $this->repo->all('professionals');
        $appointments = $this->repo->all('appointments');
        $treatments = $this->repo->all('treatment_plans');

        // Calculate productivity per professional
        $withProductivity = array_map(function($pro) use ($appointments, $treatments) {
            $proId = $pro['id'];
            $proApts = array_filter($appointments, fn($a) => ($a['professional_id'] ?? '') === $proId);
            $completedApts = array_filter($proApts, fn($a) => ($a['status'] ?? '') === 'realizado');
            $activePlans = array_filter($treatments, fn($t) => ($t['professional_id'] ?? '') === $proId && ($t['status'] ?? '') === 'em_andamento');

            $pro['total_appointments'] = count($proApts);
            $pro['completed_appointments'] = count($completedApts);
            $pro['active_treatment_plans'] = count($activePlans);

            return $pro;
        }, $all);

        usort($withProductivity, fn($a, $b) => strcmp($a['name'] ?? '', $b['name'] ?? ''));

        echo json_encode(['success' => true, 'data' => $withProductivity]);
    }

    public function store(array $currentUser): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];

        $name = trim($body['name'] ?? '');
        $crefito = trim($body['crefito'] ?? '');
        $specialty = trim($body['specialty'] ?? '');
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');

        if (empty($name) || empty($crefito) || empty($specialty)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nome, CREFITO e especialidade são obrigatórios.']);
            return;
        }

        $proData = [
            'name' => $name,
            'cpf' => $body['cpf'] ?? '',
            'crefito' => $crefito,
            'specialty' => $specialty,
            'phone' => $phone,
            'email' => $email,
            'avatar' => $body['avatar'] ?? 'https://images.unsplash.com/photo-1594824813583-4318c4c77ea1?w=300&auto=format&fit=crop&q=80',
            'bio' => $body['bio'] ?? '',
            'status' => $body['status'] ?? 'ativo',
            'available_hours' => $body['available_hours'] ?? 'Seg-Sex: 08:00 - 18:00'
        ];

        $saved = $this->repo->save('professionals', $proData);

        // Optionally create user account for login
        if (!empty($email)) {
            $userPassword = 'fisio' . substr(preg_replace('/\D/', '', $crefito) ?: '123', 0, 4);
            $userData = [
                'id' => 'user_pro_' . $saved['id'],
                'name' => $name,
                'email' => $email,
                'cpf' => $body['cpf'] ?? '',
                'password_hash' => $this->auth->hashPassword($userPassword),
                'role' => 'fisioterapeuta',
                'professional_id' => $saved['id'],
                'status' => 'ativo'
            ];
            $this->repo->save('users', $userData);
        }

        $this->audit->log('create_professional', 'professionals', $saved['id'], ['name' => $name, 'crefito' => $crefito], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Profissional cadastrado com sucesso!',
            'data' => $saved
        ]);
    }

    public function update(string $id, array $currentUser): void
    {
        $existing = $this->repo->find('professionals', $id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Profissional não encontrado.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        foreach ($body as $key => $val) {
            if ($key !== 'id' && $key !== 'created_at') {
                $existing[$key] = $val;
            }
        }

        $saved = $this->repo->save('professionals', $existing);
        $this->audit->log('update_professional', 'professionals', $id, ['name' => $saved['name']], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Dados do profissional atualizados com sucesso.',
            'data' => $saved
        ]);
    }
}

