SELECT 
    job_id, 
    job_number, 
    job_url, 
    title, 
    comments, 
    requirements, 
    follow_up, 
    highlight, 
    applied, 
    contact, 
    application_comments 
FROM 
    jobs 
WHERE 
    job_id = ?;
