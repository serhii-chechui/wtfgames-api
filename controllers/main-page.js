const express = require("express");
const { default: mongoose } = require("mongoose");

const MainPage = require('../models/main-page');

exports.getMainPageSettings = (req, res) => {
    MainPage
    .findOne()
    .select('-_id title subtitle headerImage')
    .then(result => {
        if(result){
            res.send(result);
        }
    })
    .catch(error => {
        console.error(error);
        res.status(500).json({error: error.message});
    });
};

exports.getSubTitle = (req, res) => {
    
};

exports.getHeaderImage = (req, res) => {
    
};

exports.setMainPage = (req, res) => {

    let mainPage = new MainPage({
        _id: mongoose.Types.ObjectId(),
        title: req.body.title,
        subtitle: req.body.subtitle,
        headerImage: req.file.path
    });

    mainPage
    .save()
    .then(result => {
        if(result){
            res.status(201).json({message: 'New MainPage settings has been created.'});
        }
    })
    .catch(error => {
        console.error(error);
        res.status(500).json({error: error.message});
    });
};