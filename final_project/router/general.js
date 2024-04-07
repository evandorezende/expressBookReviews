const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let findBookByIsbn = require("./auth_users.js").findBookByIsbn
const public_users = express.Router();

function getBooks() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 1000); // Simulating a delay of 1 second
    });
}

const findBooksByAuthor = (books, author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let results = [];
            for (const [key, book] of Object.entries(books)) {
                // Check if the author matches
                if (book.author === author) {
                    results.push({ id: key, ...book }); // Add the book object with its ID to the results array
                }
            }
            resolve(results);
        }, 1000);
    });
};

const findBooksByTitle = (books, title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let results = [];
            for (const [key, book] of Object.entries(books)) {
                // Check if the title matches
                if (book.title === title) {
                    results.push({ id: key, ...book }); // Add the book object with its ID to the results array
                }
            }
            resolve(results);
        }, 1000);
    });
}

const isObjEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

//Function to check if the user exists
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const results = await getBooks();

        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ message: "Smt went wrong!" });
    }
});

public_users.post("/register", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Username and/or Password not provided." });
    }

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }

    return res.status(404).json({ message: "Unable to register user." });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const results = await findBookByIsbn(books, req.params.isbn);

        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ error: `Smt went wrong: ${error}` });
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const results = await findBooksByAuthor(books, req.params.author)

        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ error: `Smt went wrong: ${error}` });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const results = await findBooksByTitle(books, req.params.title);

        return res.status(200).json(results);
    } catch (error) {
        return res.status(404).json({ error: `Smt went wrong: ${error}` });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const results = findBookByIsbn(books, req.params.isbn);

    if (!results) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const { reviews } = results;

    if (isObjEmpty(reviews)) {
        return res.status(404).json({ error: 'No reviews. Be the first to add a review' });
    }

    return res.status(200).json(reviews);
});

module.exports.general = public_users;
