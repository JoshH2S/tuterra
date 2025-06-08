const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Environment variables
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = 'nhlsrtubyvggtkyrhkuu';
const FUNCTION_NAME = 'generate-internship-feedback';

// Function to deploy
const deployFunction = async () => {
  if (!SUPABASE_ACCESS_TOKEN) {
    console.error('Error: SUPABASE_ACCESS_TOKEN environment variable is required');
    process.exit(1);
  }

  try {
    // Read the function file
    const functionFilePath = path.join(__dirname, 'supabase', 'functions', FUNCTION_NAME, 'index.ts');
    const fileContent = fs.readFileSync(functionFilePath, 'utf8');
    
    console.log(`Read file: ${functionFilePath}`);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', fileContent, {
      filename: 'index.ts',
      contentType: 'application/typescript',
    });
    
    // Deploy the function
    console.log(`Deploying ${FUNCTION_NAME} function to project ${PROJECT_REF}...`);
    
    const response = await axios.post(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/${FUNCTION_NAME}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        },
      }
    );
    
    console.log('Deployment successful!');
    console.log(response.data);
  } catch (error) {
    console.error('Deployment failed:', error.response?.data || error.message);
  }
};

deployFunction(); 