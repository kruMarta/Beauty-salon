const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const {EMAIL, PASSWORD, DB_PASSWORD, DATABASE} = require('../script/env.js');
const Mailgen = require('mailgen');

const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: DB_PASSWORD,
    database: DATABASE
});

db.connect((err) =>{
    if(err){
        console.log('not connected');
        throw err;
    }
    console.log('MySQL connected...');
});
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/data/:id', (req, res) => {
    const id = req.params.id;

    // Query the MySQL database based on the clicked element ID
    db.query('SELECT * FROM services WHERE idservices = ?', [id], (err, results) => {
      if (err) throw err;
      const jsonData = JSON.stringify(results);
      res.header('Content-Type', 'application/json');
      res.send(jsonData);
    });
});

app.post('/addpost', (req, res) => {
    const { name, price, imgPath } = req.body;
    let post = { name, price, imgPath };
    let sql = `INSERT INTO cart(name, price, imgPath) VALUES(\"${name}\", \"${price}\", \"${imgPath}\")`;
    let query = db.query(sql, post, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error occurred during insertion.'); 
      } else {
        console.log(result);
        res.send('Post added successfully.'); 
     }
  });
});

app.get('/getposts', (req, res)=>{
  let sql = 'SELECT * FROM cart';
  let query = db.query(sql, (err, result) =>{
      if (err) throw err;
      res.send(result);
  });
});

app.get('/deletepost/:id', (req, res)=>{
  let sql = `DELETE FROM cart WHERE id = ${req.params.id}`;
  let query = db.query(sql, (err, result) =>{
      if (err) throw err;
      console.log(result);
      res.send('Post deleted...');
  });
});

app.get('/countSum', (req, res)=>{
  let sql = 'SELECT SUM(price) FROM cart';
  let query = db.query(sql, (err, result) =>{
      if (err) throw err;
      res.send(result);
  });
});


app.post('/getService', (req, res) => {
  const {name, dayOfWeek} = req.body;
  let sql = `SELECT name 
  FROM artists 
  WHERE service LIKE (
    SELECT service 
    FROM service_types 
    WHERE name = '${name}')
    AND (
      CASE 
        WHEN ${dayOfWeek} = '1' THEN true
        ELSE false
      END
    );
  `;
  let query = db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred during searching.'); 
    } else {
      res.send(result); 
   }
});
});

app.post('/getTime', (req, res) => {
  const {name} = req.body;
  let sql = `SELECT start_hour, end_hour FROM artists WHERE name = '${name}'`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred during searching.'); 
    } else {
      res.send(result); 
   }
});
});


app.post('/checkReservedTime', (req, res) => {
  const {name, date} = req.body;
  let sql = `SELECT time FROM schedule WHERE artist = '${name}' and date = '${date}'`;
  let query = db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred during searching.'); 
    } else {
      res.send(result); 
   }
});
});

app.post('/confirmBooking', (req, res) => {
  const { name, phone, email, service, date, artist, time, price, wishes } = req.body;
  let post = { name, phone, email, service, date, artist, time, price, wishes };
  let sql = `INSERT INTO schedule(name, phone, email, service, date, artist, time, price, wishes) 
  VALUES(\"${name}\", \"${phone}\", \"${email}\", \"${service}\", \"${date}\", \"${artist}\", \"${time}\", \"${price}\", \"${wishes}\")`;
  let query = db.query(sql, post, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred during insertion.'); 
    } else {
      res.send('Post added successfully.'); 
   }
});
});

app.get('/cleanTable', (req, res) =>{
  let sql = `TRUNCATE cart`;
    let query = db.query(sql, (err, result) =>{
        if (err) throw err;
        console.log(result);
        res.send('Table truncated');
    });
})

app.post('/sendEmail', (req, res) =>{
  const {mailOptions, response }= req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: EMAIL, 
      pass: PASSWORD 
    }
  });

  let MailGenerator = new Mailgen({
    theme: "default",
    product :{
      name:"Chic & Charmed",
      link: 'https://mailgen.js'
    }
  })

  let mail = MailGenerator.generate(response);

  let message = {
    from: EMAIL,
    to: mailOptions.to,
    subject: "Chic & Charmed",
    html: mail
  }

  transporter
  .sendMail(message)
  .then(() => {
    return res.status(201).json({
      msg: "You should receive an email"
    })
  })
  .catch(error => {
    return res.status(500).json({error})
  })
});


app.listen('3000', () =>{
    console.log('Server started on port 3000');
});