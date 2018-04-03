const aesjs = require('aes-js');
const {p, getEntropy, binStringToBytes, pad} = require('./utils');

function Drbg(){
    this.key = 'wtf';
    this.reseedInterval = 5;
    this.usageCount = 0;
    this.totalCount = 0;

    this.init = async () => {
        let entropyIp1 = await getEntropy(256);
        let entropyIp2 = await getEntropy(256);
        let key = entropyIp1.slice(0, 16), iv = entropyIp1.slice(16, 32);
        
        this.key = key;
        this.var = entropyIp2;
        this.aesCbc = new aesjs.ModeOfOperation.cbc(this.key, iv);
    };

    this.reseed = async () => {
        this.init();
    };

    this.generate = async () => {

        if(this.usageCount > this.reseedInterval){
            await (this.reseed());
        }

        this.totalCount++;
        this.usageCount++;

        let resBytes = this.aesCbc.encrypt(this.var), resStr = '';
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

const numRandoms = parseInt(process.argv[2]);

let test = async () => {
    try{
        let res = [];
        let a = new Drbg();
        await a.init();
        while(res.length <= numRandoms){
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