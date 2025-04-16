
import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

const routes = express.Router();

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

routes.get('/get-job-post', async (req, res) => {
    try {
      // Extract query parameters for filtering
      const { 
        jobTitle, 
        companyName, 
        jobType, 
        location, 
        experienceLevel,
        minSalary,
        maxSalary 
      } = req.query;
  
      // Start building the query
      let query = 'SELECT * FROM jobpost WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;
  
      // Add filters based on provided query parameters
      if (jobTitle) {
        query += ` AND job_title ILIKE $${paramIndex}`;
        queryParams.push(`%${jobTitle}%`);
        paramIndex++;
      }
  
      if (companyName) {
        query += ` AND company_name ILIKE $${paramIndex}`;
        queryParams.push(`%${companyName}%`);
        paramIndex++;
      }
  
      if (jobType) {
        query += ` AND job_type = $${paramIndex}`;
        queryParams.push(jobType);
        paramIndex++;
      }
  
      if (location) {
        query += ` AND location ILIKE $${paramIndex}`;
        queryParams.push(`%${location}%`);
        paramIndex++;
      }
  
      if (experienceLevel) {
        query += ` AND experience_level = $${paramIndex}`;
        queryParams.push(experienceLevel);
        paramIndex++;
      }
  
      if (minSalary) {
        query += ` AND min_salary >= $${paramIndex}`;
        queryParams.push(minSalary);
        paramIndex++;
      }
  
      if (maxSalary) {
        query += ` AND max_salary <= $${paramIndex}`;
        queryParams.push(maxSalary);
        paramIndex++;
      }
  
      // Order by newest job posting first
      query += ' ORDER BY created_at DESC';
  
      // Execute the query
      const result = await pool.query(query, queryParams);
  
      // Return the results
      res.status(200).json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error retrieving job posts:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });
    routes.post('/set-job-post', async (req, res) => {
        try {
          // Extract job post data from request body
          const {
            job_title,
            company_name,
            job_type,
            location,
            experience_level,
            job_description,
            min_salary,
            max_salary,
            brand_logo_img_url,
            application_deadline
          } = req.body;
      
          // Validate required fields
          if (!job_title || !company_name || !job_type || !location || 
              !experience_level || !job_description || !min_salary || 
              !max_salary || !application_deadline) {
            return res.status(400).json({
              success: false,
              message: 'Please provide all required fields'
            });
          }
      
          // Insert the new job post into the database
          const query = `
            INSERT INTO jobpost (
              job_title, 
              company_name, 
              job_type, 
              location, 
              experience_level, 
              job_description, 
              min_salary, 
              max_salary, 
              brand_logo_img_url, 
              application_deadline
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
          `;
      
          const values = [
            job_title,
            company_name,
            job_type,
            location,
            experience_level,
            job_description,
            min_salary,
            max_salary,
            brand_logo_img_url,
            application_deadline
          ];
      
          const result = await pool.query(query, values);
      
          // Return the newly created job post
          res.status(201).json({
            success: true,
            message: 'Job post created successfully',
            data: result.rows[0]
          });
        } catch (error) {
          console.error('Error creating job post:', error);
          res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
          });
        }
      });
export default routes ;