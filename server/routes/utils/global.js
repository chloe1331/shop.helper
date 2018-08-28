const nodeCrypto = require('crypto');
const aesEcbKey = 'irjfudjdkwlsidjc';

const Api = {
    parseObjectString: (str) => {
        const f = new Function(`return ${str}`);
        return f();
    },

    encodePassword: (cleardata) => {
        const iv = '';
        const clearEncoding = 'utf8';
        const cipherEncoding = 'base64';
        const cipherChunks = [];
        const cipher = nodeCrypto.createCipheriv('aes-128-ecb', aesEcbKey, iv);
        cipher.setAutoPadding(true);
        cipherChunks.push(cipher.update(cleardata, clearEncoding, cipherEncoding));
        cipherChunks.push(cipher.final(cipherEncoding));
        const securityStr = cipherChunks.join('');
        return securityStr.replace(/[\n]/g, '');
    },

    decodePassword: (secretdata) => {
        const iv = '';
        const clearEncoding = 'utf8';
        const cipherEncoding = 'base64';
        const cipherChunks = [];
        try {
            const decipher = nodeCrypto.createDecipheriv('aes-128-ecb', aesEcbKey, iv);
            decipher.setAutoPadding(true);
            cipherChunks.push(decipher.update(secretdata, cipherEncoding, clearEncoding));
            cipherChunks.push(decipher.final(clearEncoding));
            return cipherChunks.join('');
        } catch (e) {
            return secretdata;
        }
    },

    delay(time) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    },

    shuffle(input) {
        for (let i = input.length - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const itemAtIndex = input[randomIndex];
            input[randomIndex] = input[i];
            input[i] = itemAtIndex;
        }
        return input;
    },

    getRandomArray(arr, count) {
        var shuffled = arr.slice(0),
            i = arr.length,
            min = i - count,
            temp, index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    },

    getWordLength(str) {
        return str.replace(/[^\\u0000-\\u00ff]/g, 'aa').length;
    },

    cutStr(str, length) {
        let _str = '';
        for (let i = 0; i < str.length; i++) {
            const item = str[i];
            const temp = _str + item;
            if (Api.getWordLength(temp) == length) {
                _str = temp;
                break;
            }
            if (Api.getWordLength(temp) > length) break;

            _str = temp;
        }

        return _str.replace(/(^\s*)|(\s*$)/g, '');
    }
};

module.exports = Api;