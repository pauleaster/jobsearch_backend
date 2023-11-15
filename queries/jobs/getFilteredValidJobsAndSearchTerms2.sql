),
AggregatedTerms AS (
    SELECT 
        job_id,
        job_number,
		STRING_AGG(term_text, ', ') AS matching_terms,
		COUNT(*) AS total_term_count
    FROM 
        FilteredJobTerms
    GROUP BY 
        job_id, job_number
)
SELECT 
    job_id,
    job_number,
	matching_terms
FROM 
    AggregatedTerms
ORDER BY 
    total_term_count DESC, matching_terms;
