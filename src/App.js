const connection = require('./db-config');
const express = require('express');
const app = express();

const port = process.env.PORT || 3001;

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
  } else {
    console.log('connected as id ' + connection.threadId);
  }
});

app.use(express.json())
// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
app.get('/api/books', (req, res) => {
  const isFavourite = req.params.isFavourite;
  const isRead = req.params.isRead;
  let filter = ""
  if (isFavourite) {
    filter = " WHERE isFavourite"
  }
  if (isRead) {
    filter = " WHERE isRead"
  }
  connection.query('SELECT * FROM books'+filter, (err, result) => {
    if (err) {
      res.status(500).send('Error retrieving data from database');
    } else {
      res.json(result);
    }
  });
});
app.get('/api/books/:id', (req, res) => {
  const bookId = req.params.id;
  let filter = ""
  if (bookId) {
    filter = " WHERE id = "+bookId
  }
  connection.query('SELECT * FROM books'+filter, (err, result) => {
    if (err) {
      res.status(500).send('Error retrieving data from database');
    } else {
      res.json(result);
    }
  });
});

app.get('/api/search', (req, res) => {
  const query = req.params.query;
  let filter = ""
  if (query) {
    filter = " WHERE title Like '%"+query+"%'"
  }
  connection.query('SELECT * FROM books'+filter, (err, result) => {
    if (err) {
      res.status(500).send('Error retrieving data from database');
    } else {
      res.json(result);
    }
  });
});

app.post('/api/books', (req, res) => {
  const { title, year, author, genre, cover_url, rating, pdf_url, description} = req.body;
  connection.query(
    'INSERT INTO books (title, year, author, genre, cover_url, rating, pdf_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, year, author, genre, cover_url, rating, pdf_url, description],
    (err, result) => {
      if (err) {
        res.status(500).send('Book not saved - '+err);
      } else {
        res.status(201).send('Book successfully saved');
      }
    }
  );
});

app.post('/api/books/update', (req, res) => {
  const bookId = req.query.id;
  const isFavourite = req.query.isFavourite;
  const isRead = req.query.isRead;
  let query = ""
  if (bookId) {
    query += "UPDATE books"
    if (isFavourite && isRead) {
      query += " SET isFavourite = 1, isRead = 1"
    } else if ( isFavourite ) {
      query += " SET isFavourite = 1, isRead = 0"
    } else if ( isRead ) {
      query += " SET isFavourite = 0, isRead = 1"
    } else {
      query += " SET isFavourite = 0, isRead = 0"
    }
    query += " WHERE id="+bookId
  }
  connection.query(query,
    (err, result) => {
      if (err) {
        res.status(500).send('Book not updated - '+req.params.id+' '+err);
      } else {
        res.status(201).send('Book successfully updated');
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});