<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Services\UpstashRedisClient;

class RedisRepository
{
    protected UpstashRedisClient $redis;

    public function __construct()
    {
        $this->redis = UpstashRedisClient::getInstance();
    }

    public function generateUuid(string $prefix = ''): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
        $uuid = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
        return $prefix ? "{$prefix}_{$uuid}" : $uuid;
    }

    public function find(string $collection, string $id): ?array
    {
        return $this->redis->getJson("{$collection}:{$id}");
    }

    public function all(string $collection): array
    {
        $ids = $this->redis->smembers("{$collection}:all");
        $items = [];
        foreach ($ids as $id) {
            $item = $this->redis->getJson("{$collection}:{$id}");
            if ($item) {
                $items[] = $item;
            }
        }
        return $items;
    }

    public function save(string $collection, array $data): array
    {
        if (empty($data['id'])) {
            $data['id'] = $this->generateUuid(rtrim($collection, 's'));
        }
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('c');
        }
        $data['updated_at'] = date('c');

        $this->redis->setJson("{$collection}:{$data['id']}", $data);
        $this->redis->sadd("{$collection}:all", $data['id']);

        return $data;
    }

    public function delete(string $collection, string $id): bool
    {
        $this->redis->srem("{$collection}:all", $id);
        $this->redis->del("{$collection}:{$id}");
        return true;
    }

    public function getIndexMembers(string $indexKey): array
    {
        return $this->redis->smembers($indexKey);
    }

    public function addToIndex(string $indexKey, string $id): void
    {
        $this->redis->sadd($indexKey, $id);
    }

    public function removeFromIndex(string $indexKey, string $id): void
    {
        $this->redis->srem($indexKey, $id);
    }

    public function getByIndex(string $collection, string $indexKey): array
    {
        $ids = $this->redis->smembers($indexKey);
        $items = [];
        foreach ($ids as $id) {
            $item = $this->find($collection, $id);
            if ($item) {
                $items[] = $item;
            }
        }
        return $items;
    }
}

