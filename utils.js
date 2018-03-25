const util = require('util');
const exec = util.promisify(require('child_process').exec);
const entropy = require('./entropy');
const sha256 = require('js-sha256').sha256;

const ENTROPY_PATH = '/home/yash/drbg/entropy.js';

let binStringToBytes = (str) => {
    let res = [], len = str.length;
    for(let i = 0; i < len; i += 8){
        res.push(parseInt(str.substring(i, i + 8), 2));
    }
    return res;
};

let getEntropy = async (bits) => {
    try{
        let rawBits = await entropy(bits);
        let rawBytes = binStringToBytes(rawBits);
        return sha256.array(rawBits);
    }
    catch(err){
        return err.toString();
    }
};

let pad = (str, width) => {
    let clen = str.length, res = '', toPad = width - clen;
    for(let i = 0; i < toPad; i++)
        res = '0' + res;
    return res + str;
};

let range = (max) => {
    let res = [];
    for(let i = 0; i < max; i++)
        res.push(i);
    return res;
};

module.exports = {
    'getEntropy': getEntropy,
    'p': console.log,
    'binStringToBytes': binStringToBytes,
    'pad': pad
};