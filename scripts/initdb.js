#!/usr/bin/env node

// ---------------------------------------------------------------------------------------------------------------------
// Script to populate the database with initial data.
//
// @module initdb.js
// ---------------------------------------------------------------------------------------------------------------------

var _ = require('lodash');
var Promise = require('bluebird');

GLOBAL.programDesc = 'Initialize the database with data';
GLOBAL.extraHelp = ['    --production               production mode (skips populating development accounts)'];
var config = require('../config');

var models = require('../lib/models');

// Initial data files
var accounts = require('../data/accounts');
var characters = require('../data/characters');
var entities = require('../data/entities');
var templates = require('../data/templates');

// ---------------------------------------------------------------------------------------------------------------------

function loadClean(Model, initialData)
{
    console.log('Loading table "%s"...', Model.getTableName());

    return Model.delete().execute().then(function()
    {
        return Promise.all(_.reduce(initialData, function(results, data)
        {
            results.push((new Model(data)).save());
            return results;
        }, []));
    });
} // end loadClean

// ---------------------------------------------------------------------------------------------------------------------

// Delete all existing ship templates
var loadPromise = loadClean(models.Template, templates);

// Check to see if we're in production mode
if(!config.production)
{
    loadPromise = loadPromise
        .then(function()
        {
            return Promise.join(
                loadClean(models.Account, accounts),
                loadClean(models.Character, characters),
                loadClean(models.Entity, entities)
            );
        });
} // end if

// We're done loading
loadPromise
    .then(function()
    {
        console.log('Finished loading.');
        process.exit();
    });

//----------------------------------------------------------------------------------------------------------------------
