<?php

declare(strict_types=1);

namespace App\Services;

class AuditLogService
{
    private UpstashRedisClient $redis;

    public function __construct()
    {
        $this->redis = UpstashRedisClient::getInstance();
    }

    public function log(string $action, string $entityType, string $entityId, array $details = [], ?array $user = null): void
    {
        $id = uniqid('log_', true);
        $entry = [
            'id' => $id,
            'timestamp' => date('c'),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'user_id' => $user['id'] ?? 'anonymous',
            'user_name' => $user['name'] ?? 'Sistema / Visitante',
            'user_role' => $user['role'] ?? 'guest',
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'details' => $details
        ];

        // Store log entity
        $this->redis->setJson("audit_logs:{$id}", $entry);
        // Add to main audit logs set
        $this->redis->sadd("audit_logs:all", $id);
        // Add to entity-specific log set
        $this->redis->sadd("audit_logs:entity:{$entityType}:{$entityId}", $id);
    }

    public function getRecent(int $limit = 50): array
    {
        $ids = $this->redis->smembers("audit_logs:all");
        $logs = [];
        foreach ($ids as $id) {
            $log = $this->redis->getJson("audit_logs:{$id}");
            if ($log) {
                $logs[] = $log;
            }
        }

        usort($logs, fn($a, $b) => strcmp($b['timestamp'], $a['timestamp']));
        return array_slice($logs, 0, $limit);
    }
}

