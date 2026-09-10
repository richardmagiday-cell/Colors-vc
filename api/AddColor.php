<?php

	require_once __DIR__ . '/db_config.php';

	$inData = getRequestInfo();

	$color = $inData["color"];
	$userId = $inData["userId"];

	$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("INSERT into Colors (UserId,Name) VALUES(?,?)");
		$stmt->bind_param("ss", $userId, $color);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

?>
