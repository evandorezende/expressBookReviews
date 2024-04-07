const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        username: 'evan',
        password: '123'
    },
    {
        username: 'intern',
        password: '456'
    },
];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
}

const findBookByIsbn = (books, isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            for (const [key, book] of Object.entries(books)) {
                // Check if the ISBN matches
                if (key === isbn) {
                    resolve({ id: key, ...book }); // Return the book object with its ID
                    return;
                }
            }
            resolve(null);
        }, 1000); // Simulating a delay of 1 second
    });
}

const authenticatedUser = (username, password) => { //returns boolean
    let verifiedUsers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (verifiedUsers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.query.username;
    const password = req.query.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 3600 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;

    const book = findBookByIsbn(books, req.params.isbn);

    if (!book) return res.status(404).res("Book not found.");

    const newReview = {
        updated_at: new Date(),
        comment: req.body.review,
    };

    for (const isbn in books) {
        if (isbn === book.id) {
            if (!books[isbn].reviews.hasOwnProperty(username)) {
                books[isbn].reviews[username] = {};
            }
            // Set the new review under the username key
            // This way, new entries from the same user will easily overwrite
            books[isbn].reviews[username] = newReview;
            break;
        }
    }

    return res.status(200).json({ message: "Review succesfully Updated" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;

    const book = findBookByIsbn(books, req.params.isbn);

    if (!book) return res.status(404).res("Book not found.");

    for (const isbn in books) {
        if (isbn === book.id) {
            if (books[isbn].reviews.hasOwnProperty(username)) {
                delete books[isbn].reviews[username];
            }
            break;
        }
    }

    return res.status(200).json({ message: "Review succesfully Deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.findBookByIsbn = findBookByIsbn;
