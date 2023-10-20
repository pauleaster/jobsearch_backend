#!/bin/bash

# Function to prompt for user confirmation (returns 0 for yes, 1 for no)
confirm1() {
  while true; do
    read -rp "Are these the correct field names? (yes/no): " choice
    case "$choice" in
      [Yy]* ) return 0;;
      [Nn]* ) return 1;;
      * ) echo "Please answer yes or no.";;
    esac
  done
}

# Function to prompt for user confirmation (returns 0 for yes, 1 for no)
confirm2() {
  while true; do
    read -rp "Do you want to execute this command? (yes/no): " choice
    case "$choice" in
      [Yy]* ) return 0;;
      [Nn]* ) return 1;;
      * ) echo "Please answer yes or no.";;
    esac
  done
}

# Prompt user for job_id
read -rp "Enter job_id: " job_id

# Prompt user for field name
read -rp "Enter field name: " field_name

# Prompt user for value
read -rp "Enter value: " value

echo "Entered job_id: \"$job_id\""
echo "Entered field names: \"$field_name\""
echo "Entered value: \"$value\""

# Ask for confirmation about the fields
if confirm1; then
  # Execute the curl command
  echo "Data confirmed."
else
  echo "Data not confirmed."
  exit 0
fi


# Construct the curl command
curl_command="curl -X PATCH http://localhost:3001/api/job/$job_id -H \"Content-Type: application/json\" -d '{\"field\": \"$field_name\", \"value\": \"$value\"}'"

# Display the curl command
echo "Curl command:"
echo "$curl_command"

# Ask for confirmation before executing
if confirm2; then
  # Execute the curl command
  eval "$curl_command"
  echo "Curl command executed."
else
  echo "Curl command not executed."
  exit 0
fi
