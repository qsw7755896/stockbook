// import modules
const express = require('express')
const exphbs = require('express-handlebars')
const http = require("http");
const https = require("https")
const CSVToJSON = require('csvtojson');
const io = require('socket.io');
const fs = require('fs');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const line = require('@line/bot-sdk');  // 引用linebot SDK
const lineRouter = require('./routes/line');
//變數設定
const app = express();
const port = process.env.PORT || 3000;
const personal = require('./personal.json')
const stock = personal[0];
var identityKey = 'skey';

// create LINE SDK client
const config = {
  channelAccessToken: "VuaCF72mdINcaEFGS+CHDgJ1jzZRrKKmyPZemKGqWMU+Cd/SCh/y3dCxANkLecWB27535gLPwPn8tT3y4qbF9zUNezxZ4lVTotmoUb5kPZ+GoO8ObkA1zrmV/ie/UDAIdRw1X9UH/lNergpaqiO41wdB04t89/1O/w1cDnyilFU=",
  channelSecret: "d17ba8d36d5b4c110426501b41b19e7e",
};
const client = new line.Client(config);


/**
 * use 設定
 */
app.use(express.static('public'))
app.use(require('body-parser')());
app.use(session({
  name: identityKey,
  secret: 'chyingp', // 用來對session id相關的cookie進行簽名
  store: new FileStore(), // 本地儲存session（文字檔案，也可以選擇其他store，比如redis的）
  saveUninitialized: false, // 是否自動儲存未初始化的會話，建議false
  resave: false, // 是否每次都重新儲存會話，建議false
  cookie: {
    maxAge: 10 * 1000 // 有效期，單位是毫秒
  }
}));
app.use('/line', lineRouter);
/**
 * 路由設定
 */
//首頁
app.get('/', function (req, res, next) {
  console.log('req.session', req.session)
  if (req.session.username) { //判斷session 狀態，如果有效，則返回主頁，否則轉到登入頁面
    var url = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=";
    for (let index = 0; index < stock.ownStock.length; index++) {
      url += "tse_" + stock.ownStock[index].stockNum + ".tw|"
    }
    // 取得即時股價
    https.get(url, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          writeCSV(parsedData.msgArray, true);  //寫入csv
          CorrectionCSV()  //校正 csv
        } catch (e) {
          console.error(e.message);
        }
      });
    }).on('error', (e) => { console.log(`Got error: ${e.message}`); });

    res.render('index');
  } else {
    res.redirect('login');
  }
});
//股票細項
app.get('/stockDetail/:id', (req, res) => {
  res.render('stockDetail');
})
//登記買賣
app.get('/register/transaction', (req, res) => {
  res.render('transaction');
})
//買賣紀錄儲存
app.post('/insStock', (req, res) => {
  console.log('CSRF token (from hidden form field): ' + req.body.InputStockNum);
  fs.readFile('./personal.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      var obj = JSON.parse(data); //now it an object
      obj[0].ownStock.push(
        {
          "stockNum": req.body.InputStockNum,
          "cost": req.body.InputPrice,
          "purchaseDate": req.body.InputDate,
          "sellDate": "",
          "income": ""
        }
      )
      var json = JSON.stringify(obj);
      fs.writeFile('./personal.json', json, 'utf8', function () {
        res.redirect('/');
      }); // write it back 
    }
  });
})
// 獲取登入頁面
app.get('/login', function (req, res) {
  res.render('login', { layout: false });
});
// 登入
app.post('/login', function (req, res, next) {
  if (req.body.username == 'admin' && req.body.pwd == 'admin123') {
    req.session.username = req.body.username; // 登入成功，設定 session
    res.redirect('/');
  }
  else {
    res.json({ ret_code: 1, ret_msg: '賬號或密碼錯誤' });// 若登入失敗，重定向到登入頁面
  }
});
// 退出登入
app.get('/logout', function (req, res, next) {
  // 備註：這裡用的 session-file-store 在destroy 方法裡，並沒有銷燬cookie
  // 所以客戶端的 cookie 還是存在，導致的問題 --> 退出登陸後，服務端檢測到cookie
  // 然後去查詢對應的 session 檔案，報錯
  // session-file-store 本身的bug  
  req.session.destroy(function (err) {
    if (err) {
      res.json({ ret_code: 2, ret_msg: '退出登入失敗' });
      return;
    }
    // req.session.loginUser = null;
    res.clearCookie(identityKey);
    res.redirect('/');
  });
});
// line bot
// app.post('/line', (req, res) => {
//   Promise
//     .all(req.body.events.map(handleEvent))
//     .then((result) => res.json(result))
//     .catch((err) => {
//       console.error(err);
//       res.status(500).end();
//     });
// });
/**
 * create server
 */
server = http.createServer(app)
server.listen(port, () => {
  console.log(`server listen to http://localhost:${port}`)
})

/**
 * 設定 webSocket
 */
var servIo = io.listen(server);
servIo.on('connection', function (socket) {
  /* 設定首頁圖表 */
  for (let index = 0; index < stock.ownStock.length; index++) {
    //convert users.csv file to JSON array
    CSVToJSON().fromFile('stockList_' + stock.ownStock[index].stockNum + '.csv').then(array => {
      socket.emit('priceSet', array);

    }).catch(err => { console.log(err); });
  }


});

/**
 * 設定 template engine
 */
app.engine('handlebars', exphbs('defaultLayout: main'))
app.set('view engine', 'handlebars')

/**
 * function writeCSV
 * 寫入 csv檔
 */
function writeCSV(jsdata, appendflag) {
  //const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  var createCsvWriter = require('csv-writer').createObjectCsvWriter;

  if (appendflag) {
    for (let index = 0; index < jsdata.length; index++) {
      var tmp = 'stockList_' + jsdata[index].c + '.csv';
      var CsvWriter = createCsvWriter({
        path: tmp,
        header: [
          { id: 'stockNum', title: 'stockNum' },  //股票代號
          { id: 'stockName', title: 'stockName' },  //股票名稱
          { id: 'cost', title: 'cost' },  //買進成本
          { id: 'strikePrice', title: 'strikePrice' }, //成交價
          { id: 'lastFinalPrice', title: 'lastFinalPrice' },  //昨日收盤價
          { id: 'date', title: 'date' },  //year
        ],
        append: appendflag
      });

      var newobj = stock.ownStock.find(obj => obj.stockNum === jsdata[index].c);
      if (fs.existsSync('stockList_' + jsdata[index].c + '.csv')) {
        var element = [{
          stockNum: jsdata[index].c,
          stockName: jsdata[index].nf,
          cost: newobj.cost,
          strikePrice: jsdata[index].pz,
          lastFinalPrice: jsdata[index].y,
          date: jsdata[index].d
        }];
      } else {
        var element = [
          {
            stockNum: "stockNum",
            stockName: "stockName",
            cost: "cost",
            strikePrice: "strikePrice",
            lastFinalPrice: "lastFinalPrice",
            date: "date"
          },
          {
            stockNum: jsdata[index].c,
            stockName: jsdata[index].nf,
            cost: newobj.cost,
            strikePrice: jsdata[index].pz,
            lastFinalPrice: jsdata[index].y,
            date: jsdata[index].d
          }
        ];
      }

      //console.log(data);
      CsvWriter
        .writeRecords(element)
        .then(() => console.log('The' + tmp + ' was written successfully'));
    }
  }
  else {
    var tmp = 'stockList_' + jsdata[0].stockNum + '.csv';
    var CsvWriter = createCsvWriter({
      path: tmp,
      header: [
        { id: 'stockNum', title: 'stockNum' },  //股票代號
        { id: 'stockName', title: 'stockName' },  //股票名稱
        { id: 'cost', title: 'cost' },  //買進成本
        { id: 'strikePrice', title: 'strikePrice' }, //成交價
        { id: 'lastFinalPrice', title: 'lastFinalPrice' },  //昨日收盤價
        { id: 'date', title: 'date' },  //year
      ],
      append: appendflag
    });
    //console.log(data);
    CsvWriter
      .writeRecords(jsdata)
      .then(() => console.log('The' + tmp + ' was written successfully'));
  }

}

/**
 * function CorrectionCSV
 * 校正 csv檔
 */
function CorrectionCSV() {
  for (let y = 0; y < stock.ownStock.length; y++) {
    //convert users.csv file to JSON array
    CSVToJSON().fromFile('stockList_' + stock.ownStock[y].stockNum + '.csv').then(array => {
      var arraytmp = [];
      var date_flag = "";
      for (let i = 0; i < array.length; i++) {
        if (date_flag == array[i].date) {
          arraytmp.pop()
        }
        arraytmp.push({
          stockNum: array[i].stockNum,
          stockName: array[i].stockName,
          cost: array[i].cost,
          strikePrice: i + 1 == array.length ? array[i].lastFinalPrice : array[i + 1].lastFinalPrice,
          lastFinalPrice: array[i].lastFinalPrice,
          date: array[i].date
        })

        date_flag = array[i].date;
      }
      arraytmp = arraytmp.slice(arraytmp.length - 7, arraytmp.length);
      writeCSV(arraytmp, false);
    }).catch(err => { console.log(err); });
  }
}

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: "444" };

  // use reply API
  return client.replyMessage(event.replyToken, [
    {
      type: 'imagemap',
      baseUrl: 'https://github.com/line/line-bot-sdk-nodejs/raw/master/examples/kitchensink/static/rich',
      altText: 'Imagemap alt text',
      baseSize: {
        width: 1040,
        height: 1040
      },
      actions: [
        {
          area: {
            x: 0,
            y: 0,
            width: 520,
            height: 520
          },
          type: 'uri',
          linkUri: 'https://store.line.me/family/manga/en'
        },
        {
          area: {
            x: 520,
            y: 0,
            width: 520,
            height: 520
          },
          type: 'uri',
          linkUri: 'https://store.line.me/family/music/en'
        },
        {
          area: {
            x: 0,
            y: 520,
            width: 520,
            height: 520
          },
          type: 'uri',
          linkUri: 'https://store.line.me/family/play/en'
        },
        {
          area: {
            x: 520,
            y: 520,
            width: 520,
            height: 520
          },
          type: 'message',
          text: 'URANAI!'
        },
      ],
      video: {
        originalContentUrl: 'https://github.com/line/line-bot-sdk-nodejs/raw/master/examples/kitchensink/static/imagemap/video.mp4',
        previewImageUrl: 'https://github.com/line/line-bot-sdk-nodejs/raw/master/examples/kitchensink/static/imagemap/preview.jpg',
        area: {
          x: 280,
          y: 385,
          width: 480,
          height: 270,
        },
        externalLink: {
          linkUri: 'https://line.me',
          label: 'LINE'
        }
      },
    },
    {
      type: 'template',
      altText: 'Buttons alt text',
      template: {
        type: 'buttons',
        thumbnailImageUrl: 'https://github.com/line/line-bot-sdk-nodejs/raw/master/examples/kitchensink/static/buttons/1040.jpg',
        title: 'My button sample',
        text: 'Hello, my button',
        actions: [
          {
            label: 'Go to line.me',
            type: 'uri',
            uri: 'https://line.me'
          },
          {
            label: 'Say hello1',
            type: 'postback',
            data: 'hello こんにちは'
          },
          {
            label: '言 hello2',
            type: 'postback',
            data: 'hello こんにちは',
            text: 'hello こんにちは'
          },
          {
            label: 'Say message',
            type: 'message',
            text: 'Rice=米'
          },
        ],
      },
    },
    {
      type: 'flex',
      altText: 'this is a flex message',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'hello'
            },
            {
              type: 'text',
              text: 'world'
            }
          ]
        }
      }
    }
  ]);
}
