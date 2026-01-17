require("dotenv").config();
const mysql = require('mysql2');

const express = require('express');
const app = express();
const path = require('path');

var con = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  port: process.env.SPORT,
  password: process.env.SPASS,
  database: process.env.SDNAME
});

con.connect(err => {
  if (err) {
      console.error("MySQL connection failed:", err);
  } else {
      console.log("MySQL connected");
  }
});

app.use((req, res, next) => {
  req.con = con;
  next();
});

// Import route modules
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const trackRoutes = require('./routes/track');
const regiRoutes = require('./routes/mechanic-registration');
const mechdash = require('./routes/mechanic-dashboard');
const officeRoutes = require('./routes/office');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/review');

// Use route modules
app.use('/', indexRoutes);
app.use('/track', trackRoutes);
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);
app.use('/review', reviewRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/mechanic-registration', regiRoutes);
app.use('/mechanic-dashboard', mechdash);
app.use('/office', officeRoutes);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 