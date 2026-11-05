<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\RedisRepository;
use App\Services\AuditLogService;
use App\Services\UpstashRedisClient;

class SettingController
{
    private RedisRepository $repo;
    private AuditLogService $audit;
    private UpstashRedisClient $redis;

    public function __construct()
    {
        $this->repo = new RedisRepository();
        $this->audit = new AuditLogService();
        $this->redis = UpstashRedisClient::getInstance();
    }

    public function getPublicClinicInfo(): void
    {
        $clinic = $this->redis->getJson('settings:clinic') ?: [];
        $landing = $this->redis->getJson('settings:landing_page') ?: [];
        $professionals = $this->repo->all('professionals');

        // Only active professionals for the public website
        $publicPros = array_values(array_filter($professionals, fn($p) => ($p['status'] ?? 'ativo') === 'ativo'));

        echo json_encode([
            'success' => true,
            'clinic' => $clinic,
            'landing' => $landing,
            'professionals' => $publicPros
        ]);
    }

    public function getSettings(): void
    {
        $clinic = $this->redis->getJson('settings:clinic') ?: [];
        $landing = $this->redis->getJson('settings:landing_page') ?: [];
        $auditLogs = $this->audit->getRecent(30);

        echo json_encode([
            'success' => true,
            'clinic' => $clinic,
            'landing' => $landing,
            'audit_logs' => $auditLogs,
            'upstash_status' => [
                'cloud_configured' => $this->redis->isCloudConfigured(),
                'status' => 'Conectado e operacional'
            ]
        ]);
    }

    public function updateClinicSettings(array $currentUser): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $existing = $this->redis->getJson('settings:clinic') ?: [];

        $merged = array_merge($existing, $body, ['updated_at' => date('c')]);
        $this->redis->setJson('settings:clinic', $merged);

        $this->audit->log('update_clinic_settings', 'settings', 'clinic', [], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Configurações da clínica atualizadas com sucesso.',
            'clinic' => $merged
        ]);
    }

    public function updateLandingCms(array $currentUser): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $existing = $this->redis->getJson('settings:landing_page') ?: [];

        $merged = array_merge($existing, $body, ['updated_at' => date('c')]);
        $this->redis->setJson('settings:landing_page', $merged);

        $this->audit->log('update_landing_cms', 'settings', 'landing_page', [], $currentUser);

        echo json_encode([
            'success' => true,
            'message' => 'Conteúdo da Landing Page atualizado com sucesso.',
            'landing' => $merged
        ]);
    }
}

