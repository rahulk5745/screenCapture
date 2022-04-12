/**
 * File: common.js
 * Description: implements some common functions
 * Author: Vageesh Kumar
 * Date: 09/12/2021
 */
const fsObj = require("fs");
const fs = fsObj.promises;

const common = {};

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
common.exec = async cmd => {
        const exec = require("child_process").exec;
        return new Promise(resolve => {
                exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                                console.warn(error);
                        }
                        resolve(stdout ? stdout : stderr);
                });
        });
};

common.fileCheck = async path => {
        try {
                await fs.access(path, fs.F_OK);
        } catch (e) {
                console.log("Exception in file access:" + e);
                return false;
        }
        return true;
};


module.exports = common;

