<?php

	require_once __DIR__ . '/db_config.php';

	$inData = getRequestInfo();

	$id = 0;
	$firstName = "";
	$lastName = "";

	// TODO: connect to the database and authenticate the user (see the
	// "Backend logic" commit for the full implementation).
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>
