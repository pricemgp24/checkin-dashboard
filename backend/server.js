const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const moment = require('moment');  // Use moment.js to handle week calculations

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://mongo:27017/checkins', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Schema and Model
const checkinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
  week: { type: String, required: true } // Stores the week number and year, e.g. "2024-W09"
});
const Checkin = mongoose.model('Checkin', checkinSchema);

// API route to handle check-ins
app.post('/checkin', async (req, res) => {
  try {
    const { name, email } = req.body;
    const currentWeek = moment().format('YYYY-[W]WW'); // Current week and year, e.g. "2024-W09"

    const checkin = new Checkin({ name, email, week: currentWeek });
    await checkin.save();
    res.status(201).send('Check-in successful');
    console.log(`New check-in: ${name} (${email})`);
  } catch (err) {
    console.error('Error saving check-in:', err);
    res.status(500).send('Failed to check-in');
  }
});

// GET current week's check-ins
app.get('/checkins/current', async (req, res) => {
  try {
    const currentWeek = moment().format('YYYY-[W]WW');  // Current week format, e.g. "2024-W09"
    const checkins = await Checkin.find({ week: currentWeek });  // Fetch check-ins for the current week
    res.json(checkins);
  } catch (err) {
    console.error('Error retrieving check-ins:', err);
    res.status(500).send('Error retrieving current week check-ins');
  }
});

// GET historic check-ins by week
app.get('/checkins/history/:week', async (req, res) => {
  try {
    const { week } = req.params;
    const checkins = await Checkin.find({ week });  // Fetch check-ins for a specific week
    res.json(checkins);
  } catch (err) {
    console.error('Error retrieving historical check-ins:', err);
    res.status(500).send('Error retrieving historical check-ins');
  }
});

// Delete prior week check-ins (archive them instead of removing)
app.delete('/checkins/clear', async (req, res) => {
  try {
    const currentWeek = moment().format('YYYY-[W]WW');  // Get current week
    const priorWeek = moment().subtract(1, 'weeks').format('YYYY-[W]WW');  // Get prior week
    
    // Remove check-ins from prior week (or archive them in a separate database/collection if needed)
    await Checkin.deleteMany({ week: priorWeek });
    res.status(200).send(`Prior week's check-ins (${priorWeek}) cleared.`);
    console.log(`Cleared check-ins for week ${priorWeek}`);
  } catch (err) {
    console.error('Error clearing prior week check-ins:', err);
    res.status(500).send('Failed to clear prior week check-ins');
  }
});

// Start the server and listen on port 5000
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
