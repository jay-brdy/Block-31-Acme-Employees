// imports here for express and pg
const express = require('express');
const pg = require('pg');
const app = express();
const path = require('path');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/ acme_hr_db')

// static routes here (you only need these for deployment)
app.use(express.static(path.join(__dirname, '../client/dist')));

// app routes here
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')))
app.get('/api/employees', async (req, res, next) => {
    try{
        const SQL = `SELECT * from employees;`
        const result = await client.query(SQL)
        res.send(result.rows)

    }catch(error){
        next(error)
    }
});

// create your init function
// employees have a name, an id, and an is_admin field
const init = async () => {
    await client.connect()
    const SQL = `
      DROP TABLE IF EXISTS employees;

      CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE
      );

      INSERT INTO employees(name, is_admin) VALUES('Jay', true);
      INSERT INTO employees(name, is_admin) VALUES('Jessica', false);
      INSERT INTO employees(name, is_admin) VALUES('John', false);
    `
    await client.query(SQL)
    console.log('data seeded')
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

// init function invocation
init()