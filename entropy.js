const fs = require('fs');
const si = require('systeminformation');
const bs = require('math-float32-to-binary-string');

const pad = (str, toLen) => {
    let curLen = str.length;
    let res = '';
    for(let i = 0; i < toLen - curLen; i++){
        res += '0';
    }
    return res + str;
};

let data = JSON.parse(fs.readFileSync('/home/yash/drbg/entropy_data'));
// console.log(data);

/**
 * format of 'entropy_data':
 * {
 *     'mem': {
 *         'accept': [<bits to accept>],
 *         'map': {<entropy map>}
 *      },
 *      'temp/load': [{
 *         'accept': [<bits to accept>],
 *         'entropy': [entropy of corresponding bits]
 *      }]
 * }
 */

const cores = 4;

let compute = async (req_entropy) => {
    let res = '', cur_entropy = 0.0, fields = ['temp', 'load', 'mem'];

    while(cur_entropy <= req_entropy){
        const memMaxLen = 32;
        let mem_accept = data['mem']['accept'];
        let mem_entropy = data['mem']['entropy'];
        let memData = await si.mem();
        let freeMem = pad(memData.free.toString(2), memMaxLen);
        mem_accept.forEach((idx, ix) => {
            res += freeMem[idx];
            cur_entropy += mem_entropy[ix];
        });


        let coreLoads = await si.currentLoad();
        let binLoads = coreLoads['cpus'].map(cpu => bs(cpu.load));
        for(let core = 0; core < cores; core++){
            let load_accept = data['load'][core]['accept'];
            let load_entropy = data['load'][core]['entropy']
            load_accept.forEach((idx, ix) => {
                res += binLoads[core][idx];
                cur_entropy += load_entropy[ix]
            })
        }

        let coreTemps = await si.cpuTemperature(), tempMaxLen = 7;
        let binTemps = coreTemps['cores'].map(temp => pad(temp.toString(2), tempMaxLen));
        for(let core = 0; core < cores; core++){
            let temp_accept = data['temp'][core]['accept'];
            let temp_entropy = data['temp'][core]['entropy']
            temp_accept.forEach((idx, ix) => {
                res += binTemps[core][idx];
                cur_entropy += temp_entropy[ix]
            })
        }
        // console.log(res);
    }

    return res;
}

module.exports = compute;