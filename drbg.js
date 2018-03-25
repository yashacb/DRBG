const aesjs = require('aes-js');
const {p, getEntropy, binStringToBytes, pad} = require('./utils');

function Drbg(){
    this.key = 'wtf';
    this.reseedInterval = 5;
    this.usageCount = 0;
    this.totalCount = 0;

    this.init = async () => {
        let entropyIp = await getEntropy(256);
        let key = entropyIp.slice(0, 16), iv = entropyIp.slice(16, 32);
        let nonce = Array.from(aesjs.utils.utf8.toBytes(pad(Date.now().toString(), 16)));
        
        this.key = key;
        this.var = iv.concat(nonce);
        this.aesCtr = new aesjs.ModeOfOperation.ctr(this.key);
    };

    this.reseed = async () => {
        this.usageCount = 0;

        let entropyIp = await getEntropy(256);
        let key = entropyIp.slice(0, 16), newIv = entropyIp.slice(16, 32);
        
        this.key = key;
        this.var = newIv.concat(Array.from(this.var).slice(0, 16));
        this.aesCtr = new aesjs.ModeOfOperation.ctr(this.key);
    };

    this.generate = async () => {

        if(this.usageCount > this.reseedInterval){
            await (this.reseed());
        }

        this.totalCount++;
        this.usageCount++;

        let resBytes = this.aesCtr.encrypt(this.var), resStr = '';
        this.var = resBytes;
        
        for(let i = 0; i < resBytes.length; i++){
            resStr += pad(resBytes[i].toString(2), 8);
        }
        return resStr;
    }

    this.generateNums = async() => {
        let bits = await this.generate();
        let nums = [];
        for(let i = 0; i < bits.length; i += 32){
            nums.push(parseInt(bits.substring(i, i + 32), 2));
        }
        return nums;
    };
}

let test = async () => {
    try{
        let res = [];
        let a = new Drbg();
        await a.init();
        while(res.length <= 1000){
            let nums = await a.generateNums();
            res = res.concat(nums);
        }
        
        p(res.join('\n'));
    }
    catch(err){
        p(err);
    }
};

test();