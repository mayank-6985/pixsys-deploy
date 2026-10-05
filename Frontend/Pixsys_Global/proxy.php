<?php
// Get the exact endpoint requested from the .htaccess file
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Your AWS IP address and base API path
$aws_url = 'http://13.235.209.22/v1/api/' . $endpoint;

// Initialize cURL to act as the middleman
$ch = curl_init($aws_url);

// Forward the exact request method (GET, POST, PUT, DELETE)
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward the body data (for POST/PUT requests)
$input = file_get_contents('php://input');
if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

// Forward the headers from React (including Accept-Encoding so Django knows to GZip)
$headers = [];
$request_headers = apache_request_headers();
foreach ($request_headers as $name => $value) {
    if (strtolower($name) !== 'host') {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Capture the response headers coming back from Django
$response_headers = [];
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function($curl, $header) use (&$response_headers) {
    $len = strlen($header);
    $parts = explode(':', $header, 2);
    if (count($parts) == 2) {
        $response_headers[trim($parts[0])] = trim($parts[1]);
    }
    return $len;
});

// Execute the request to AWS
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Send the exact HTTP status code back to React
http_response_code($httpcode);

// Forward crucial headers (like Content-Encoding and Content-Type) from Django to the browser
$has_content_type = false;
foreach ($response_headers as $name => $value) {
    $lower_name = strtolower($name);
    
    // Pass along GZip instructions and Content-Type
    if ($lower_name === 'content-encoding' || $lower_name === 'content-type') {
        header("$name: $value");
        if ($lower_name === 'content-type') {
            $has_content_type = true;
        }
    }
}

// Fallback just in case Django omits the Content-Type
if (!$has_content_type) {
    header('Content-Type: application/json');
}

// Output the data (The browser will automatically unzip it now)
echo $response;
?>