<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\Config;

class UpstashRedisClient
{
    private ?string $url;
    private ?string $token;
    private string $storagePath;
    private static ?self $instance = null;

    public function __construct()
    {
        $this->url = Config::get('UPSTASH_REDIS_REST_URL');
        $this->token = Config::get('UPSTASH_REDIS_REST_TOKEN');
        $this->storagePath = dirname(__DIR__, 2) . '/storage/redis_data.json';
        
        $storageDir = dirname($this->storagePath);
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0777, true);
        }
        if (!file_exists($this->storagePath)) {
            file_put_contents($this->storagePath, json_encode([
                'strings' => [],
                'sets' => [],
                'hashes' => [],
                'expirations' => []
            ], JSON_PRETTY_PRINT));
        }
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function isCloudConfigured(): bool
    {
        return !empty($this->url) && !empty($this->token);
    }

    /**
     * Execute a Redis command. If Upstash REST credentials exist, call Upstash.
     * Otherwise execute locally against redis_data.json.
     */
    public function execute(array $command): mixed
    {
        if ($this->isCloudConfigured()) {
            try {
                return $this->executeUpstash($command);
            } catch (\Throwable $e) {
                error_log("Upstash Cloud Error, falling back to local storage: " . $e->getMessage());
                return $this->executeLocal($command);
            }
        }

        return $this->executeLocal($command);
    }

    private function executeUpstash(array $command): mixed
    {
        $ch = curl_init();
        $postData = json_encode($command);

        curl_setopt_array($ch, [
            CURLOPT_URL => rtrim($this->url, '/'),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->token,
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 5
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err || $httpCode < 200 || $httpCode >= 300) {
            throw new \RuntimeException("Upstash HTTP error ({$httpCode}): " . ($err ?: $response));
        }

        $decoded = json_decode($response, true);
        if (isset($decoded['error'])) {
            throw new \RuntimeException("Upstash command error: " . $decoded['error']);
        }

        return $decoded['result'] ?? null;
    }

    private function executeLocal(array $command): mixed
    {
        $fp = fopen($this->storagePath, 'c+');
        if (!$fp) {
            return null;
        }

        flock($fp, LOCK_EX);
        rewind($fp);
        $content = stream_get_contents($fp);
        $data = json_decode($content ?: '', true);
        if (!is_array($data)) {
            $data = [
                'strings' => [],
                'sets' => [],
                'hashes' => [],
                'expirations' => []
            ];
        }

        $cmd = strtoupper((string)($command[0] ?? ''));
        $result = null;

        // Clean expired keys
        $now = time();
        if (!empty($data['expirations'])) {
            foreach ($data['expirations'] as $k => $exp) {
                if ($exp <= $now) {
                    unset($data['strings'][$k], $data['sets'][$k], $data['hashes'][$k], $data['expirations'][$k]);
                }
            }
        }

        switch ($cmd) {
            case 'PING':
                $result = 'PONG';
                break;

            case 'GET':
                $key = (string)($command[1] ?? '');
                $result = $data['strings'][$key] ?? null;
                break;

            case 'SET':
                $key = (string)($command[1] ?? '');
                $val = (string)($command[2] ?? '');
                $data['strings'][$key] = $val;
                
                // EX option support
                if (isset($command[3]) && strtoupper((string)$command[3]) === 'EX' && isset($command[4])) {
                    $ttl = (int)$command[4];
                    $data['expirations'][$key] = $now + $ttl;
                } else {
                    unset($data['expirations'][$key]);
                }
                $result = 'OK';
                break;

            case 'DEL':
                $deletedCount = 0;
                for ($i = 1; $i < count($command); $i++) {
                    $k = (string)$command[$i];
                    if (isset($data['strings'][$k]) || isset($data['sets'][$k]) || isset($data['hashes'][$k])) {
                        unset($data['strings'][$k], $data['sets'][$k], $data['hashes'][$k], $data['expirations'][$k]);
                        $deletedCount++;
                    }
                }
                $result = $deletedCount;
                break;

            case 'EXISTS':
                $key = (string)($command[1] ?? '');
                $result = (isset($data['strings'][$key]) || isset($data['sets'][$key]) || isset($data['hashes'][$key])) ? 1 : 0;
                break;

            case 'SADD':
                $key = (string)($command[1] ?? '');
                if (!isset($data['sets'][$key])) {
                    $data['sets'][$key] = [];
                }
                $added = 0;
                for ($i = 2; $i < count($command); $i++) {
                    $member = (string)$command[$i];
                    if (!in_array($member, $data['sets'][$key], true)) {
                        $data['sets'][$key][] = $member;
                        $added++;
                    }
                }
                $result = $added;
                break;

            case 'SREM':
                $key = (string)($command[1] ?? '');
                if (!isset($data['sets'][$key])) {
                    $result = 0;
                    break;
                }
                $removed = 0;
                for ($i = 2; $i < count($command); $i++) {
                    $member = (string)$command[$i];
                    $idx = array_search($member, $data['sets'][$key], true);
                    if ($idx !== false) {
                        array_splice($data['sets'][$key], $idx, 1);
                        $removed++;
                    }
                }
                $result = $removed;
                break;

            case 'SMEMBERS':
                $key = (string)($command[1] ?? '');
                $result = $data['sets'][$key] ?? [];
                break;

            case 'SISMEMBER':
                $key = (string)($command[1] ?? '');
                $member = (string)($command[2] ?? '');
                $result = (isset($data['sets'][$key]) && in_array($member, $data['sets'][$key], true)) ? 1 : 0;
                break;

            case 'HSET':
                $key = (string)($command[1] ?? '');
                if (!isset($data['hashes'][$key])) {
                    $data['hashes'][$key] = [];
                }
                $added = 0;
                // Support HSET key field value [field value ...]
                for ($i = 2; $i < count($command); $i += 2) {
                    if (isset($command[$i + 1])) {
                        $field = (string)$command[$i];
                        $val = (string)$command[$i + 1];
                        if (!isset($data['hashes'][$key][$field])) {
                            $added++;
                        }
                        $data['hashes'][$key][$field] = $val;
                    }
                }
                $result = $added;
                break;

            case 'HGET':
                $key = (string)($command[1] ?? '');
                $field = (string)($command[2] ?? '');
                $result = $data['hashes'][$key][$field] ?? null;
                break;

            case 'HGETALL':
                $key = (string)($command[1] ?? '');
                $result = $data['hashes'][$key] ?? [];
                break;

            case 'HDEL':
                $key = (string)($command[1] ?? '');
                $delCount = 0;
                if (isset($data['hashes'][$key])) {
                    for ($i = 2; $i < count($command); $i++) {
                        $f = (string)$command[$i];
                        if (isset($data['hashes'][$key][$f])) {
                            unset($data['hashes'][$key][$f]);
                            $delCount++;
                        }
                    }
                }
                $result = $delCount;
                break;

            case 'KEYS':
                $pattern = (string)($command[1] ?? '*');
                $allKeys = array_unique(array_merge(
                    array_keys($data['strings']),
                    array_keys($data['sets']),
                    array_keys($data['hashes'])
                ));
                if ($pattern === '*') {
                    $result = array_values($allKeys);
                } else {
                    $regex = '/^' . str_replace(['*', '?'], ['.*', '.'], preg_quote($pattern, '/')) . '$/';
                    $result = array_values(preg_grep($regex, $allKeys) ?: []);
                }
                break;

            case 'INCR':
                $key = (string)($command[1] ?? '');
                $current = isset($data['strings'][$key]) ? (int)$data['strings'][$key] : 0;
                $current++;
                $data['strings'][$key] = (string)$current;
                $result = $current;
                break;

            default:
                $result = null;
                break;
        }

        // Save back
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        return $result;
    }

    // Helper wrappers
    public function get(string $key): mixed
    {
        return $this->execute(['GET', $key]);
    }

    public function set(string $key, mixed $value, ?int $ttlSeconds = null): bool
    {
        $valStr = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);
        if ($ttlSeconds !== null && $ttlSeconds > 0) {
            $res = $this->execute(['SET', $key, $valStr, 'EX', (string)$ttlSeconds]);
        } else {
            $res = $this->execute(['SET', $key, $valStr]);
        }
        return $res === 'OK';
    }

    public function getJson(string $key): ?array
    {
        $raw = $this->get($key);
        if (!$raw) {
            return null;
        }
        if (is_array($raw)) {
            return $raw;
        }
        if (!is_string($raw)) {
            return null;
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : null;
    }

    public function setJson(string $key, array $data, ?int $ttlSeconds = null): bool
    {
        return $this->set($key, json_encode($data, JSON_UNESCAPED_UNICODE), $ttlSeconds);
    }

    public function del(string ...$keys): int
    {
        if (empty($keys)) {
            return 0;
        }
        return (int)$this->execute(array_merge(['DEL'], $keys));
    }

    public function sadd(string $key, string ...$members): int
    {
        if (empty($members)) {
            return 0;
        }
        return (int)$this->execute(array_merge(['SADD', $key], $members));
    }

    public function srem(string $key, string ...$members): int
    {
        if (empty($members)) {
            return 0;
        }
        return (int)$this->execute(array_merge(['SREM', $key], $members));
    }

    public function smembers(string $key): array
    {
        $res = $this->execute(['SMEMBERS', $key]);
        return is_array($res) ? $res : [];
    }

    public function sismember(string $key, string $member): bool
    {
        return (bool)$this->execute(['SISMEMBER', $key, $member]);
    }

    public function keys(string $pattern): array
    {
        $res = $this->execute(['KEYS', $pattern]);
        return is_array($res) ? $res : [];
    }

    public function incr(string $key): int
    {
        return (int)$this->execute(['INCR', $key]);
    }
}
