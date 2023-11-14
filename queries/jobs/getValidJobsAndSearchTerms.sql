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
        jst.valid = True
)

, AggregatedTerms AS (
    SELECT 
        job_id,
        job_number,
        STRING_AGG(term_text, ', ') AS matching_terms,
        COUNT(term_text) AS term_count
    FROM 
        ValidJobTerms
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
    term_count DESC, matching_terms;
