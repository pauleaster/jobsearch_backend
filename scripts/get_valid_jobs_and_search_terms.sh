#!/bin/bash

# Construct the curl command
curl_command="curl -X GET http://localhost:3001/api/validJobsAndSearchTerms"


eval "$curl_command" | more
