const http = require("http");
const https = require("https");
const line_login = require("line-login");

const httpsGet = (url) => {
    return new Promise((resolve, reject) => {
        url = encodeURI(url);
        https.get(url, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve(rawData);
            })
        }).on('error', (e) => {  
            reject(`${e.message}`); });
    });
}

const lineLogin = (UserProfile) => {
    return new Promise((resolve, reject) => {
        const login = new line_login({
            channel_id: "1655218874",
            channel_secret: "a343af5b1405609914bbab5f450fc397",
            callback_url: "https://8bdfabeda6d5.ngrok.io/login",
            scope: "openid profile",
            prompt: "consent",
            bot_prompt: "normal"
        });

        if (UserProfile.line_token != null) {
            httpsGet("https://api.line.me/oauth2/v2.1/verify?access_token=" + UserProfile.line_token)
                .then(results => {
                    console.log('result',results);
                })
                .catch(error => {
                    console.log('error',error);
                })
            //var obj = login.verify_access_token("eyJhbGciOiJIUzI1NiJ9.mVtLK4GMSg1CpRTLavd6UqbBPK0lCq7_RRGWK913Am6WNzuTtN1zH81q_hrhI88rEvtslsb85EnqYqf7Bzde299GZAWIkXAcZ24ZdYOZ47ITGv3cFWptpBbjTjqKv-qPZcciYzIQtmFgyTNSq_f2DPpUIkkA7jkNS7dQjl2KM8k.XN1nUHxbh-mUto7B4m0dFddRtlgKnR4gMZ3Q-oTxfxc");
            
            resolve();

        } else {

            reject(login);
        }
    });
}

module.exports = { httpsGet, lineLogin };