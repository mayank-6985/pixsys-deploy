<?php
// 1. Get the endpoint parameter passed from .htaccess
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// 2. Preserve and build original query string parameters (e.g., category_id=35)
$query_params = $_GET;
unset($query_params['endpoint']); // Remove 'endpoint' key so it isn't duplicated
$query_string = http_build_query($query_params);

// 3. Construct full AWS backend API URL with query string attached
$aws_url = 'http://13.235.209.22/v1/api/' . $endpoint;
if (!empty($query_string)) {
    $aws_url .= '?' . $query_string;
}

// Initialize cURL session
$ch = curl_init($aws_url);

// Forward the exact HTTP Request Method (GET, POST, PUT, DELETE, etc.)
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward request body data (for POST, PUT, PATCH, DELETE payloads)
$input = file_get_contents('php://input');
if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

// Safely extract request headers (works on Apache, LiteSpeed, Nginx, FastCGI)
$request_headers = [];
if (function_exists('apache_request_headers')) {
    $request_headers = apache_request_headers();
} elseif (function_exists('getallheaders')) {
    $request_headers = getallheaders();
}

$headers = [];
foreach ($request_headers as $name => $value) {
    // Avoid forwarding original 'Host' header so AWS target responds properly
    if (strtolower($name) !== 'host') {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Capture response headers returning from Django
$response_headers = [];
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $header) use (&$response_headers) {
    $len = strlen($header);
    $parts = explode(':', $header, 2);
    if (count($parts) == 2) {
        $response_headers[trim($parts[0])] = trim($parts[1]);
    }
    return $len;
});

// Execute request to AWS backend
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Set status code matching Django's response
http_response_code($httpcode);

// Forward essential headers back to React frontend
$has_content_type = false;
foreach ($response_headers as $name => $value) {
    $lower_name = strtolower($name);
    
    if ($lower_name === 'content-encoding' || $lower_name === 'content-type') {
        header("$name: $value");
        if ($lower_name === 'content-type') {
            $has_content_type = true;
        }
    }
}

// Default Content-Type fallback if backend omitted it
if (!$has_content_type) {
    header('Content-Type: application/json');
}

// Send backend response body to client
echo $response;
?>