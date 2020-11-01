// app.js
// import modules
const express = require('express')
const exphbs = require('express-handlebars')
const http = require("http");
const https = require("https")
const CSVToJSON = require('csvtojson');
const io = require('socket.io');
const app = express();
const port = process.env.PORT || 3000;
const personal = require('C:/Users/User/Desktop/personal.json')
const stock = personal[0];
/**
 * 路由設定
 */
//首頁
app.get('/', (req, res) => {
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
})
//股票細項
app.get('/stockDetail/:id', (req, res) => {
  res.render('stockDetail');
})
//登記買賣
app.get('/register/transaction', (req, res) => {
  res.render('transaction');
})
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
 * 設定 static files 路徑
 */
app.use(express.static('public'))


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
          { id: 'stockName', title: 'stockName'},  //股票名稱
          { id: 'cost', title: 'cost' },  //買進成本
          { id: 'strikePrice', title: 'strikePrice' }, //成交價
          { id: 'lastFinalPrice', title: 'lastFinalPrice' },  //昨日收盤價
          { id: 'date', title: 'date' },  //year
        ],
        append: appendflag
      });
      var newobj = stock.ownStock.find(obj => obj.stockNum === jsdata[index].c);



      console.log(newobj)
      var element = [{
        stockNum: jsdata[index].c,
        stockName: jsdata[index].nf,
        cost: newobj.cost,
        strikePrice: jsdata[index].pz,
        lastFinalPrice: jsdata[index].y,
        date: jsdata[index].d
      }];
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
        { id: 'stockName', title: 'stockName'},  //股票名稱
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
          strikePrice: i+1 == array.length ? array[i].lastFinalPrice : array[i + 1].lastFinalPrice,
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