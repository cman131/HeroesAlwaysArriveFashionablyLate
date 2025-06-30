// server.js
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

// Database connection pool
const pool = new Pool({
user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: process.env.DB_PORT,
});

const getScenes = async () => {
  const result = await pool.query('SELECT scene_id, roles.id role_id, roles.name FROM scene_roles join roles on role_id = roles.id');
  const scenes = {};
  result.rows.forEach(row => {
    if (row.scene_id in scenes) {
      scenes[row.scene_id] = [...scenes[row.scene_id], row.role_id];
    } else {
      scenes[row.scene_id] = [row.role_id];
    }
  });
  return Object.keys(scenes).map(key => ({ scene_id: key, roles: scenes[key] }));
}

const getSchedule = async () => {
  const result = await pool.query('SELECT date, roles.id FROM date_signups join roles on role_id = roles.id');
  const dates = {};
  result.rows.forEach(row => {
    const key = row.date.toDateString();
    if (key in dates) {
      dates[key].roles.push(row.id);
    } else {
      dates[key] = { date: row.date, roles: [row.id] };
    }
  });
  const scenes = await getScenes();
  Object.keys(dates).forEach(key => {
    dates[key].sceneCount = scenes.reduce((prev, cur) => cur.roles.every(role => dates[key].roles.includes(role)) ? prev + 1 : prev, 0);
  });
  return dates;
};

app.use(express.json()); // Enable JSON body parsing

// Schedule person for a date
app.post('/api/schedule', async (req, res) => {
  try {
    const postBody = req.body;
    await pool.query('INSERT INTO date_signups(date, role_id) VALUES($1, $2)', [postBody.date, postBody.id]);

    const result = await getSchedule();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// Unschedule person for a date
app.delete('/api/schedule', async (req, res) => {
  try {
    const postBody = req.body;
    await pool.query('DELETE FROM date_signups WHERE date = $1 AND role_id = $2', [postBody.date, postBody.id]);

    const result = await getSchedule();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get the current schedule
app.get('/api/schedule', async (req, res) => {
  try {
    const result = await getSchedule();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get the current scenes
app.get('/api/scenes', async (req, res) => {
  try {
    const scenes = getScenes();
    res.json(scenes);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

// Get the current roles
app.get('/api/roles', async (req, res) => {
  try {
      const result = await pool.query('SELECT id, name FROM roles');
      res.json({ roles: result.rows });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
console.log(`Server running on port ${port}`);
});
