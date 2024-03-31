const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra'); // Using fs-extra for async file reading

const app = express();
app.use(cors()); 
const port = 3000; // Or any desired port number

app.use(bodyParser.json()); // Parse incoming JSON data

// Read data from JSON file asynchronously
const filePath = './data.json'; // Adjust path if needed
fs.readJson(filePath)
  .then(dataArray => {
    // Pagination logic
    app.get('/users', async (req, res) => {
        const searchTerm = req.query.q?.toLowerCase() || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // Adjust as needed
      
        const domain = req.query.domain?.toLowerCase();
        const gender = req.query.gender?.toLowerCase();
        const availability = req.query.availability?.toLowerCase();
      
        const dataArray = JSON.parse(await fs.readFile(filePath));
      
        let filteredData = dataArray;
      
        if (searchTerm) {  
            filteredData = filteredData.filter(user => {
                const fullName = `${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`;
                return (
                  fullName.includes(searchTerm) ||
                  user.first_name.toLowerCase().includes(searchTerm) ||
                  user.last_name.toLowerCase().includes(searchTerm)
                );
            });
        }
      
        if (domain) {
          filteredData = filteredData.filter(user => user.domain.toLowerCase().includes(domain));
        }
      
        if (gender) {
          filteredData = filteredData.filter(user => user.gender.toLowerCase().includes(gender));
        }
      
        if (availability) {
            filteredData = filteredData.filter(user => {
              const userAvailability = typeof user.available === 'boolean' ? user.available : false; // Handle potential undefined values
              return availability === 'all' || userAvailability === (availability === 'true');
            });
        }          
      
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
      
        const paginatedData = filteredData.slice(startIndex, endIndex);
      
        const totalPages = Math.ceil(filteredData.length / limit);
      
        res.json({
          data: paginatedData,
          currentPage: page,
          totalPages,
          pageSize: limit
        });
      });
  })
  .catch(err => {
    console.error('Error reading JSON file:', err);
    return res.status(500).json({ message: 'Error loading data' });
  });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
