import requests

# Endpoint URLs
search_terms_url = "http://localhost:3001/api/searchTerms"
filtered_jobs_url = "http://localhost:3001/api/filteredJobsAndSearchTerms"

# Fetch search terms
response = requests.get(search_terms_url)
search_terms = response.json()

# Modify the search terms array as needed
# For example, remove some items or select specific ones
modified_terms = search_terms[:5]  # Example: take only the first 5 terms

print("\n\n ************* valid request *************\n")

# Test the filteredJobsAndSearchTerms endpoint
json_payload = {"filterTerms": modified_terms}
print(f"json_payload:\n{json_payload}\n\n")
response = requests.post(filtered_jobs_url, json=json_payload)
filtered_jobs = response.json()

# Output the result
print(f"filtered_jobs[:10]:\n{filtered_jobs[:10]}\n\n")
print("************* test completed *************\n")