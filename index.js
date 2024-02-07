const express = require('express');
const bodyParser = require('body-parser');
const { createObjectCsvWriter } = require('csv-writer');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();

// Middleware to parse JSON bodies, with a limit of 50MB
app.use(bodyParser.json({ limit: '50mb' }));

app.use('/imports', express.static(path.join(__dirname, 'imports')));

app.post('/webhook', async (req, res) => {
  const { records, import_slug } = req.body;



  if(records.length === 0 && req.complete) {
    return
  }
  
  const dir = path.join(__dirname, 'imports', import_slug); // Adjust path as needed

  // Ensure the directory exists
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  // Prepare headers for CSV based on keys of the first record's data
  const headers = Object.keys(records[0].data).map(key => ({ id: key, title: key }));

  // Generate a UUID for the CSV file name
  const fileName = path.join(dir, `records-${uuidv4()}.csv`); // Ensure path is writable

  // Configure CSV writer with dynamic headers
  const csvWriter = createObjectCsvWriter({
      path: fileName,
      header: headers,
      append: false // Each call creates a new file
  });

  // Extract data from records for CSV
  const dataToWrite = records.map(record => record.data);

  // Write the extracted data to the CSV file
  try {
      await csvWriter.writeRecords(dataToWrite);
      console.log(`Records were written to ${fileName} successfully.`);
  } catch (error) {
      console.error('Error writing records to CSV file:', error);
      return res.status(500).send({ message: 'Error processing records' });
  }

  // Respond to the request indicating successful processing
  res.status(200).json({
      batch: {
          status: 'completed',
          validation_issues: []
      }
  });
});


// Start the server on the specified PORT
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
