#!/bin/bash


# Prompt user for job_id
read -rp "Enter job_id: " job_id


# Construct the curl command
curl_command="curl -X GET http://localhost:3001/api/job/$job_id"


eval "$curl_command"
