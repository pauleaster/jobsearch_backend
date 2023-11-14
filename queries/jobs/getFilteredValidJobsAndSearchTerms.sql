WITH ValidJobTerms AS (
    SELECT 
        j.job_id,
        j.job_number,
        st.term_text
    FROM 
        jobs j
    JOIN 
        job_search_terms jst ON j.job_id = jst.job_id
    JOIN 
        search_terms st ON jst.term_id = st.term_id
    WHERE 
        jst.valid = 1
)

, AggregatedTerms AS (
    SELECT 
        job_id,
        job_number,
        STRING_AGG(term_text, ', ' ORDER BY term_text) AS matching_terms,
        COUNT(*) AS total_term_count
    FROM 
        ValidJobTerms
    GROUP BY 
        job_id, job_number
    -- Adapt this part to handle the comma-separated string
    HAVING
        COUNT(term_text) FILTER (WHERE CHARINDEX(term_text, @filterTerms) > 0 OR @filterTerms IS NULL) > 0
)

SELECT 
    job_id,
    job_number,
    matching_terms
FROM 
    AggregatedTerms
ORDER BY 
    total_term_count DESC, matching_terms;
