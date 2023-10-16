// Create web server applicatio using express

// Import express module
const express = require('express');
// Create express application
const app = express();
// Import body-parser module
const bodyParser = require('body-parser');
// Import mongoose module
const mongoose = require('mongoose');
// Import Comments model
const Comments = require('../models/comments');
// Import authenticate module
const authenticate = require('../authenticate');
// Import cors module
const cors = require('./cors');

// Use body-parser module
app.use(bodyParser.json());

// Create route for comments
app.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// GET method
.get(cors.cors, (req, res, next) => {
    // Find all comments
    Comments.find(req.query)
    .populate('author')
    .then((comments) => {
        // Send response to client
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, (err) => next(err))
    .catch((err) => next(err));
})

// POST method
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Check if user is admin
    if(req.user.admin){
        // Send response to client
        res.statusCode = 403;
        res.end('POST operation not supported on /comments');
    }
    else{
        // Add author to request body
        req.body.author = req.user._id;
        // Create comment
        Comments.create(req.body)
        .then((comment) => {
            // Find comment
            Comments.findById(comment._id)
            .populate('author')
            .then((comment) => {
                // Send response to client
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
})

// PUT method
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Send response to client
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments');
})

// DELETE method
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Check if user is admin
    if(req.user.admin){
        // Delete all comments
        Comments.remove({})
        .then((resp) => {
            // Send response to client
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else{
        // Send response to client
        res.statusCode = 403;
        res.end('DELETE operation not supported on /comments');
    }
});

// Create route for comments/:commentId
app.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// GET method
.get(cors.cors, (req, res, next) => {
    // Find comment
    Comments.findById(req.params.commentId)
    .populate('author')
    .then((comment) => {
        // Send response to client
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
    }, (err) => next(err))
    .catch((err) => next(err));
})

// POST method
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Send response to client
    res.statusCode = 403;
    res.end('POST operation not supported on /comments/' + req.params.commentId);
})

// PUT method
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Find comment
    Comments.findById(req.params.commentId)
    .then((comment) => {
        // Check if user is author of comment
        if(comment.author.equals(req.user._id)){
            // Update comment
            Comments.findByIdAndUpdate(req.params.commentId, {
                $set: req.body
            }, { new: true })
            .then((comment) => {
                // Find comment
                Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
                    // Send response to client
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            // Send response to client
            res.statusCode = 403;
            res.end('You are not authorized to update this comment!');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

// DELETE method
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // Find comment
    Comments.findById(req.params.commentId)
    .then((comment) => {
        // Check if user is author of comment
        if(comment.author.equals(req.user._id)){
            // Delete comment
            Comments.findByIdAndRemove(req.params.commentId)
            .then((resp) => {
                // Send response to client
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            // Send response to client
            res.statusCode = 403;
            res.end('You are not authorized to delete this comment!');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

// Export comments router
module.exports = app;

// End of file





