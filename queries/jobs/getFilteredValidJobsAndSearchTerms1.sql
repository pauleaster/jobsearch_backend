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
),
FilteredJobTerms AS (
    SELECT 
        vjt.job_id,
        vjt.job_number,
        vjt.term_text
    FROM 
        ValidJobTerms vjt
    WHERE 
