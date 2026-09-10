<?php

	require_once __DIR__ . '/db_config.php';

	$inData = getRequestInfo();

	$color = $inData["color"];
	$userId = $inData["userId"];

	// TODO: insert the color into the database (see the "Backend logic"
	// commit for the full implementation).
	returnWithError( "Not implemented" );

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
