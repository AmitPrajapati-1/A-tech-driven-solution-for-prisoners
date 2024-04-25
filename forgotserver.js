const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware for parsing URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + 'forgot.html');
});

// Handle form submission
app.post('/reset-password', (req, res) => {
  const { userId, securityQuestion, newPassword, confirmPassword } = req.body;

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    res.send("Passwords do not match. Please try again.");
    return;
  }

  // Read user credentials from file
  fs.readFile('user_credentials.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.send("Error reading user credentials file.");
      return;
    }

    // Split file content into lines
    const lines = data.split('\n');

    // Flag to indicate if user was found
    let found = false;

    // Iterate over lines to find user
    for (const line of lines) {
      const [storedUserId, storedPassword, storedSecurityQuestion] = line.split(',');
      if (storedUserId === userId && storedSecurityQuestion.trim() === securityQuestion.trim()) {
        // Update password
        const updatedLine = `${userId},${newPassword},${securityQuestion}\n`;
        data = data.replace(line, updatedLine);
        found = true;
        break;
      }
    }

    if (found) {
      // Write updated data back to file
      fs.writeFile('user_credentials.txt', data, 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.send("Error updating password.");
          return;
        }
        res.send("Password updated successfully.");
      });
    } else {
      res.send("User ID or security question is incorrect. Please try again.");
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
