// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./db'); // Import the database connection setup

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Start the server and listen on the configured port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Route to fetch all flavors
// GET /api/flavors
app.get('/api/flavors', async (req, res) => {
    try {
        // Query the database to select all flavors
        const { rows } = await db.query('SELECT * FROM flavors');
        // Send the fetched rows as JSON response
        res.json(rows);
    } catch (error) {
        // Log and send server error message if query fails
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to fetch a single flavor by ID
// GET /api/flavors/:id
app.get('/api/flavors/:id', async (req, res) => {
    const { id } = req.params; // Extract the flavor ID from the URL parameters
    try {
      // Query the database to select the flavor with the given ID
      const { rows } = await db.query('SELECT * FROM flavors WHERE id = $1', [id]);
      // Check if a flavor was found
      if (rows.length === 0) {
        // If not found, send a 404 Not Found response
        return res.status(404).send('Flavor not found');
      }
      // If found, send the flavor as JSON response
      res.json(rows[0]);
    } catch (err) {
      // Log and send server error message if query fails
      console.error(err);
      res.status(500).send('Server error');
    }
});

// Route to create a new flavor
// POST /api/flavors
app.post('/api/flavors', async (req, res) => {
    const { name, is_favorite } = req.body; // Extract flavor details from the request body
    try {
      // Insert the new flavor into the database and return the created flavor
      const { rows } = await db.query(
        'INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *',
        [name, is_favorite]
      );
      // Send the created flavor as JSON response with a 201 Created status
      res.status(201).json(rows[0]);
    } catch (err) {
      // Log and send server error message if query fails
      console.error(err);
      res.status(500).send('Server error');
    }
});

// Route to update an existing flavor by ID
// PUT /api/flavors/:id
app.put('/api/flavors/:id', async (req, res) => {
    const { id } = req.params; // Extract the flavor ID from the URL parameters
    const { name, is_favorite } = req.body; // Extract updated flavor details from the request body
  
    try {
      // First, check if the flavor exists in the database
      const checkFlavor = await db.query('SELECT * FROM flavors WHERE id = $1', [id]);
      if (checkFlavor.rows.length === 0) {
        // If not found, send a 404 Not Found response
        return res.status(404).send('Flavor not found');
      }
  
      // Update the flavor in the database with the new details
      const { rows } = await db.query(
        'UPDATE flavors SET name = $1, is_favorite = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [name, is_favorite, id]
      );
  
      // Send the updated flavor as JSON response
      res.json(rows[0]);
    } catch (err) {
      // Log and send server error message if query fails
      console.error(err);
      res.status(500).send('Server error');
    }
});

// Route to delete a flavor by ID
// DELETE /api/flavors/:id
app.delete('/api/flavors/:id', async (req, res) => {
    const { id } = req.params; // Extract the flavor ID from the URL parameters
  
    try {
      // First, check if the flavor exists in the database
      const checkFlavor = await db.query('SELECT * FROM flavors WHERE id = $1', [id]);
  
      if (checkFlavor.rows.length === 0) {
        // If not found, send a 404 Not Found response
        return res.status(404).send('Flavor not found');
      }
  
      // Delete the flavor from the database
      await db.query('DELETE FROM flavors WHERE id = $1', [id]);
  
      // Send a 204 No Content response to indicate successful deletion
      res.status(204).send();
    } catch (err) {
      // Log and send server error message if query fails
      console.error(err);
      res.status(500).send('Server error');
    }
});
