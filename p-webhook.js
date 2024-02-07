const express = require('express');
const bodyParser = require('body-parser');
const { createObjectCsvWriter } = require('csv-writer');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Add axios for making HTTP requests

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies, with a limit of '50mb'
app.use(bodyParser.json({ limit: '50mb' }));

app.use('/imports', express.static(path.join(__dirname, 'imports')));

const sleep = n => new Promise(resolve => setTimeout(resolve, n))

app.post('/webhook', async (req, res) => {
  const { records, import_slug, batch_slug } = req.body; // Extract batch_slug from the request

  if(records.length === 0 && req.complete) {
    return
  }

  // Immediately respond with a processing status
  res.status(202).json({
    batch: {
      status: 'processing'
    }
  });

    try {
      await processRecords(records, import_slug, batch_slug);
      console.log(`Batch ${batch_slug} processed successfully.`);
    } catch (error) {
      console.error(`Error processing batch ${batch_slug}:`, error);
    }
  }
  
);

// Function to process records and update Fuse on completion
async function processRecords(records, import_slug, batch_slug) {
  const dir = path.join(__dirname, 'imports', import_slug);

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  const headers = Object.keys(records[0].data).map(key => ({ id: key, title: key }));
  const fileName = path.join(dir, `${batch_slug}.csv`);
  const csvWriter = createObjectCsvWriter({
    path: fileName,
    header: headers,
    append: false
  });

  const dataToWrite = records.map(record => record.data);

  try {
    await csvWriter.writeRecords(dataToWrite);
    console.log(`Records were written to ${fileName} successfully.`);

    await sleep(2000);
    const requestBody = {
      batch: {
        status: 'completed',
        validation_issues: [{
          record_slug: records[0].slug,
          validation_type: 'error',
          column_name: 'first_name',
          issue_description: 'invalid name'
        }] // Add actual validation issues if any
      }
    }
    console.log(requestBody)
    console.log({recordSlug: records[0].slug})
    console.log(records[0].data)
    // Use JSONPlaceholder's /posts endpoint as an example
    // After processing, update Fuse with the batch status
    const res = await axios.put(`https://fuse-develop.flatirons.com/api/v1/webhooks/batches/${batch_slug}`, requestBody, {
      headers: {
        Authorization: `Bearer ${process.env.api_token}` // Replace {API_KEY_TOKEN} with actual API key token
      }
    });

    console.log('testlog');
  } catch (error) {
    console.error('Error processing records:', error);
    throw error; // Rethrow to handle in the calling function
  }
}

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
