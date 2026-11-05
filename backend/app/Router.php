<?php

declare(strict_types=1);

namespace App;

use App\Middleware\AuthMiddleware;

class Router
{
    private array $routes = [];

    public function get(string $path, array|callable $handler, ?array $roles = null): void
    {
        $this->addRoute('GET', $path, $handler, $roles);
    }

    public function post(string $path, array|callable $handler, ?array $roles = null): void
    {
        $this->addRoute('POST', $path, $handler, $roles);
    }

    public function put(string $path, array|callable $handler, ?array $roles = null): void
    {
        $this->addRoute('PUT', $path, $handler, $roles);
    }

    public function patch(string $path, array|callable $handler, ?array $roles = null): void
    {
        $this->addRoute('PATCH', $path, $handler, $roles);
    }

    public function delete(string $path, array|callable $handler, ?array $roles = null): void
    {
        $this->addRoute('DELETE', $path, $handler, $roles);
    }

    private function addRoute(string $method, string $path, array|callable $handler, ?array $roles): void
    {
        $this->routes[] = [
            'method' => $method,
            'pattern' => $this->convertPathToRegex($path),
            'handler' => $handler,
            'roles' => $roles
        ];
    }

    private function convertPathToRegex(string $path): string
    {
        $escaped = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $escaped . '$#';
    }

    public function dispatch(string $method, string $uri): void
    {
        // Strip query string and base directory if routed through index.php
        $parsedUrl = parse_url($uri, PHP_URL_PATH);
        $path = '/' . trim($parsedUrl, '/');

        // Allow removing prefix if running under a subfolder e.g. /backend/public
        if (str_contains($path, '/api/')) {
            $path = '/api/' . substr($path, strpos($path, '/api/') + 5);
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                $currentUser = null;
                // If roles is defined (even empty array), authenticate
                if ($route['roles'] !== null) {
                    $currentUser = AuthMiddleware::authenticate($route['roles']);
                }

                $handler = $route['handler'];
                if (is_callable($handler)) {
                    call_user_func($handler, $params, $currentUser);
                    return;
                }

                if (is_array($handler) && count($handler) === 2) {
                    [$class, $action] = $handler;
                    $controller = new $class();

                    $reflection = new \ReflectionMethod($controller, $action);
                    $numParams = $reflection->getNumberOfParameters();

                    // Intelligent parameter passing:
                    // If method expects (params, currentUser), (currentUser), or (id, currentUser)
                    $args = [];
                    $paramNames = array_keys($params);

                    if (!empty($params) && count($params) === 1) {
                        $args[] = reset($params);
                    } elseif (!empty($params)) {
                        $args[] = $params;
                    }

                    if ($numParams > count($args) && $currentUser !== null) {
                        $args[] = $currentUser;
                    }

                    $reflection->invokeArgs($controller, $args);
                    return;
                }
            }
        }

        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "Endpoint não encontrado para {$method} {$path}"
        ]);
    }
}

