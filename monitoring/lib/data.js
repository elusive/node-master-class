/*
 *  Library for data i/o
 */

// deps
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// container for module (to be exported)
var lib = {};

// base directory for data
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to a file structure
// table = folder
// record = file
lib.create = (dir,file,data, callback) => {
    // try to open file for writing
    let filePath = path.join(lib.baseDir, dir, file+'.json');
    fs.open(filePath, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor){
            // convert data to string
            let stringData = JSON.stringify(data);

            // write data to file and close
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file.');
                        }
                    })
                } else {
                    callback('Error writing to new file.');
                }
            })
        } else {
            callback('Could not create new file, it may already exist.');
        }
    })
};

// read data from file
lib.read = (dir,file,callback) => {
    let filePath = path.join(lib.baseDir, dir, file+'.json');
    fs.readFile(filePath,'utf-8',(err,data) => {
        if (!err && data) {
            let parsed = helpers.parseJsonToObject(data);
            callback(false,parsed);
        } else {
            callback(err,data);
        }
    });
};

// update existing file with new data
lib.update = (dir,file,data,callback) => {
    // open file for writing    
    let filePath = path.join(lib.baseDir, dir, file+'.json');
    fs.open(filePath,'r+',(err, fd) => {
        if (!err && fd){
            // convert data to string
            let stringData = JSON.stringify(data);

            // truncate any existing content
            fs.ftruncate(fd, (err)=>{
                if(!err){
                    // write to file and close it
                    fs.writeFile(fd, stringData, (err) => {
                        if (!err){
                            fs.close(fd, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file.', err);
                                }
                            });
                        } else {
                            callback('Error writing to existing file.', err);
                        }
                    });
                } else {
                    callback('Error truncating file.', err);
                }
            });
        } else {
            callback('Could not open file for updating, it may not exist yet.');
        }
    })
};

lib.delete = (dir,file,callback) => {
    // unlink file from file system
    let filePath = path.join(lib.baseDir, dir, file+'.json');
    fs.unlink(filePath,(err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file', err);
        }
    });
};

module.exports = lib;