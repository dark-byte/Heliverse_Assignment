const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra"); // Using fs-extra for async file reading

const app = express();
app.use(cors());
const port = 3000; // Or any desired port number

app.use(bodyParser.json()); // Parse incoming JSON data

// Read data from JSON file asynchronously
const filePath = "./data.json"; // Adjust path if needed

const readData = async () => {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading JSON file:", err);
    throw new Error("Error loading data"); // Re-throw for centralized error handling
  }
};

// Function to write data to JSON file (for future updates)
const writeData = async (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2); // Pretty-print for readability
    await fs.writeFile(filePath, jsonData);
  } catch (err) {
    console.error("Error writing JSON file:", err);
    throw new Error("Error saving data"); // Re-throw for centralized error handling
  }
};


// GET /api/users/:id (Retrieve a user by ID)
app.get("/api/users/:id", async (req, res) => {
  const dataArray = await readData();
  try {
    const userId = req.params.id;
    const user = dataArray.find((user) => user.id === parseInt(userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.json({ error: err });
  }
});

app.get("/api/users", async (req, res) => {
  const dataArray = await readData();
  const searchTerm = req.query.q?.toLowerCase() || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12; // Adjust as needed

  const domain = req.query.domain?.toLowerCase();
  const gender = req.query.gender?.toLowerCase();
  const availability = req.query.availability?.toLowerCase();

  let filteredData = dataArray;

  if (searchTerm) {
    filteredData = filteredData.filter((user) => {
      const fullName = `${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`;
      return (
        fullName.includes(searchTerm) ||
        user.first_name.toLowerCase().includes(searchTerm) ||
        user.last_name.toLowerCase().includes(searchTerm)
      );
    });
  }

  if (domain) {
    filteredData = filteredData.filter((user) =>
      user.domain.toLowerCase().includes(domain)
    );
  }

  if (gender) {
    filteredData = filteredData.filter((user) =>
      user.gender.toLowerCase().includes(gender)
    );
  }

  if (availability) {
    filteredData = filteredData.filter((user) => {
      const userAvailability =
        typeof user.available === "boolean" ? user.available : false; // Handle potential undefined values
      return (
        availability === "all" || userAvailability === (availability === "true")
      );
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
    pageSize: limit,
  });
});



app.post('/api/users', async (req, res) => {
  try {
    const dataArray = await readData();
    const newUser = req.body;

    // Basic validation (replace with more comprehensive validation)
    if (!newUser.first_name || !newUser.last_name || !newUser.domain || !newUser.available || !newUser.email || !newUser.gender || !newUser.avatar) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    newUser.id = dataArray.length ? dataArray[dataArray.length - 1].id + 1 : 1; // Generate ID

    dataArray.push(newUser);
    await writeData(dataArray); // Write updated data to JSON file

    res.status(201).json({ message: 'User created successfully', user: newUser }); // Include created user in response
  } catch (err) {
    next(err); // Pass error to centralized error handling middleware
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const dataArray = await readData();
    const updates = req.body;

    // Basic validation (replace with more comprehensive validation)
    if (!updates.first_name && !updates.last_name && !updates.domain) {
      return res.status(400).json({ message: 'Missing update data' });
    }

    const userIndex = dataArray.findIndex(user => user.id === parseInt(userId));

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    dataArray[userIndex] = { ...dataArray[userIndex], ...updates }; // Merge updates with existing data
    await writeData(dataArray); // Write updated data to JSON file

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    next(err); // Pass error to centralized error handling middleware
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const dataArray = await readData();

    const userIndex = dataArray.findIndex(user => user.id === parseInt(userId));

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    dataArray.splice(userIndex, 1); // Remove the user from the array
    await writeData(dataArray); // Write updated data to JSON file

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err); // Pass error to centralized error handling middleware
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
