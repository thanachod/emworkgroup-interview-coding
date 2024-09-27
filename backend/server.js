const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');

// multer's setting
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, "./images")
    },
    filename: (req, file, cb) => {
        return cb(null, file.originalname)
    }
})
const upload = multer({storage});

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors());
// app.use(express)
// app.use('/')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'emworkgroup',
    port: '3306'
})
db.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('MySQL is successfully connected.');
    
})

app.listen(port, () => {
    console.log(`NodeJS's port is ${port}`);
    
})

app.post('/user', upload.single('file'), (req, res) => {
    const {name_title, surename, lastname, birth_date, profile_pic} = JSON.parse(req.body.user_data);
    console.log(JSON.parse(req.body.user_data));

    try {
        
        db.query(
            "INSERT INTO users(name_title, surename, lastname, birth_date, profile_pic)\
            VALUES(?, ?, ?, ?, ?)",
            [name_title, surename, lastname, birth_date, profile_pic],
            (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                    
                } 
                return res.status(201).send();
            }
        )
    
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
    
})

app.get('/users', (req, res) => {
    const sql = `SELECT * FROM users`

    try {
        db.query(sql, (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send()
            }
            res.status(200).json(results);
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

app.get('/user/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM users WHERE id = ?`;
    try {
        db.query(sql, [id], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send()
            }
            res.status(200).json(results);
        })
    } catch(err) {
        return res.status(500).send();
    }
})

app.put('/user/:id', upload.single("file"), (req, res) => {
    const id = req.params.id;
    const {name_title, surename, lastname, birth_date, profile_pic} = JSON.parse(req.body.user_data);
    const sql = "UPDATE users\
    SET name_title = ?, surename = ?, lastname = ?, birth_date = ?\
    , profile_pic = ?, updated_at = ? \
    WHERE id = ?"
    const updated_at = new Date();
    console.log(JSON.parse(req.body.user_data));
    try {
        db.query(sql,
            [name_title, surename, lastname, birth_date, profile_pic, updated_at, id],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(results);
            })
        
    } catch (err) {
        console.log(err)
        return res.status(500).send();
    }
})

app.delete("/user/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?"
    try {
        db.query(sql, [id], (err, results, fields) => {
            if (err) {
                console.log(err);
                return res.status(400).send();
            }
            if (results.affectedRows === 0){
                return res.status(400).json({
                    message: "No item with that id."
                });
            }
            return res.status(200).json({
                message: "The item is deleted scuccessfully."
            })
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send();
    }
});