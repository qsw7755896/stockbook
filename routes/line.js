'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const querystring = require('querystring');
const http = require("http");
const https = require("https")
const router = express.Router();
const fs = require('fs');
const request = require("request");
const cheerio = require("cheerio");
const listArray = [];

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "VuaCF72mdINcaEFGS+CHDgJ1jzZRrKKmyPZemKGqWMU+Cd/SCh/y3dCxANkLecWB27535gLPwPn8tT3y4qbF9zUNezxZ4lVTotmoUb5kPZ+GoO8ObkA1zrmV/ie/UDAIdRw1X9UH/lNergpaqiO41wdB04t89/1O/w1cDnyilFU=",
  channelSecret: "d17ba8d36d5b4c110426501b41b19e7e",
};

// create LINE SDK client
const client = new line.Client(config);

// register a webhook handler with middleware
// about the middleware, please refer to doc
router.post('/', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
    return console.log('Test hook recieved: ' + JSON.stringify(event.message));
  }
  console.log(`User ID: ${event.source.userId}`);

  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken, event.source);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'postback':
      let data = querystring.parse(event.postback.data);
      switch (data.from) {
        case "richmenu":
          switch (data.action) {
            //功能區
            case "function":
              return client.replyMessage(event.replyToken,
                {
                  type: 'flex',
                  altText: 'this is a flex message',
                  contents: {
                    "type": "carousel",
                    "contents": [
                      {
                        "type": "bubble",
                        "hero": {
                          "type": "image",
                          "url": "https://cdn.pixabay.com/photo/2017/09/08/20/29/chess-2730034_960_720.jpg",
                          "size": "full",
                          "aspectRatio": "20:13",
                          "aspectMode": "cover"
                        },
                        "body": {
                          "type": "box",
                          "layout": "vertical",
                          "contents": [
                            {
                              "type": "text",
                              "text": "無聊糞game",
                              "size": "xl",
                              "weight": "bold"
                            },
                            {
                              "type": "separator"
                            },
                            {
                              "type": "box",
                              "layout": "baseline",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "我什麼都沒做~",
                                  "flex": 0,
                                  "margin": "md",
                                  "size": "sm",
                                  "color": "#999999"
                                }
                              ],
                              "margin": "md"
                            }
                          ]
                        },
                        "footer": {
                          "type": "box",
                          "layout": "vertical",
                          "contents": [
                            {
                              "type": "button",
                              "action": {
                                "type": "postback",
                                "label": "給我建議~",
                                "data": "from=others&&action=textBox&&title=留言給我~&&keyword=我要留言&&"
                                  + "text=請以關鍵字「我要留言」為開頭寫下建議或者留下訊息\n基本上一個禮拜內會作出回應，請各位別急~"
                              },
                              "height": "sm",
                              "style": "link"
                            },
                            {
                              "type": "button",
                              "action": {
                                "type": "postback",
                                "label": "干我屁事~",
                                "data": "from=others&&action=gameCurse",
                                "displayText": "ಠ_ಠ"
                              },
                              "height": "sm",
                              "style": "link"
                            }
                          ],
                          "spacing": "sm",
                          "flex": 0
                        }
                      }
                    ]
                  }
                });
              break;
            //對話區
            case "conversation":
              return client.replyMessage(event.replyToken,
                {
                  type: 'flex',
                  altText: 'this is a flex message',
                  contents: {
                    "type": "bubble",
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "哈囉~我會說什麼",
                          "size": "xl",
                          "weight": "bold"
                        },
                        {
                          "type": "box",
                          "layout": "baseline",
                          "contents": [
                            {
                              "type": "text",
                              "text": "以下各種範例，自己玩~",
                              "flex": 0,
                              "margin": "md",
                              "size": "sm",
                              "color": "#999999"
                            }
                          ],
                          "margin": "md"
                        }
                      ]
                    },
                    "footer": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "button",
                              "action": {
                                "type": "message",
                                "label": "yee先生",
                                "text": "yee先生"
                              },
                              "height": "sm",
                              "style": "link"
                            },
                            {
                              "type": "button",
                              "action": {
                                "type": "postback",
                                "label": "留言給我",
                                "data": "from=others&&action=textBox&&title=留言給我~&&keyword=我要留言&&"
                                  + "text=請以關鍵字「我要留言」為開頭寫下建議或者留下訊息\n基本上一個禮拜內會作出回應，請各位別急~"
                              },
                              "height": "sm",
                              "style": "link"
                            }
                          ],
                          "flex": 0,
                          "spacing": "sm"
                        },
                        {
                          "type": "box",
                          "layout": "horizontal",
                          "contents": [
                            {
                              "type": "button",
                              "action": {
                                "type": "postback",
                                "label": "查詢股票新聞",
                                "data": "from=others&&action=textBox&&title=查詢股票PTT&&keyword=ptt股票 {{關鍵字}}"
                                  + "&&text=請以關鍵字「ptt股票」為開頭，空一格後面接關鍵字\nEx: ptt股票 爆跌，就是查詢股票版上關於爆跌的新聞，連結會通網ptt該篇文章"
                              },
                              "height": "sm",
                              "style": "link"
                            },
                            {
                              "type": "button",
                              "action": {
                                "type": "postback",
                                "label": "查詢股票",
                                "data": "from=others&&action=textBox&&title=查看股票當前資訊~&&keyword=股票{{你想看的股票代號}}"
                                  + "&&text=請以關鍵字「股票」為開頭，後面緊接股票代號\nEx: 股票3008 就是查詢代號3008當前資訊，目前無法輸入公司名稱作查詢，因為我還不太會 ㄏㄏ"
                              },
                              "height": "sm",
                              "style": "link"
                            }
                          ],
                          "flex": 0,
                          "spacing": "sm"
                        },
                        {
                          "type": "separator"
                        },
                        {
                          "type": "button",
                          "action": {
                            "type": "postback",
                            "label": "還想要什麼 ? 告訴我",
                            "data": "from=others&&action=textBox&&title=留言給我~&&keyword=我要留言&&"
                              + "text=請以關鍵字「我要留言」為開頭寫下建議或者留下訊息\n基本上一個禮拜內會作出回應，請各位別急~"
                          },
                          "height": "sm",
                          "style": "link"
                        }
                      ]
                    }
                  }
                });
              break;
            //紀錄區
            case "record":

              break;

            default:
              break;
          }
          break;
        case "others":
          switch (data.action) {
            case "textBox":
              return client.replyMessage(event.replyToken, {
                type: 'flex',
                altText: 'this is a flex message',
                contents: {
                  "type": "bubble",
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": data.title,
                        "weight": "bold",
                        "size": "xxl"
                      },
                      {
                        "type": "box",
                        "layout": "baseline",
                        "margin": "md",
                        "contents": [
                          {
                            "type": "icon",
                            "size": "sm",
                            "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
                          },
                          {
                            "type": "text",
                            "text": "關鍵字 : " + data.keyword,
                            "size": "sm",
                            "color": "#999999",
                            "margin": "md",
                            "flex": 0
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "margin": "lg",
                        "spacing": "sm",
                        "contents": [
                          {
                            "type": "box",
                            "layout": "baseline",
                            "spacing": "sm",
                            "contents": [
                              {
                                "type": "text",
                                "text": data.text,
                                "wrap": true,
                                "color": "#666666",
                                "size": "sm",
                                "flex": 5
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                }
              });
              break;
            case "gameCurse":
              return client.replyMessage(event.replyToken, {
                type: 'text',
                text: "是在哈囉??"
              });
              break;
            default:
              break;
          }
          break;

        default:
          break;
      }
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `Got postback: ${JSON.stringify(data)}`
      });

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

async function handleText(message, replyToken, source) {
  switch (message.text) {
    case "你好":
    case "妳好":
      return client.replyMessage(replyToken, {
        type: 'text',
        text: "你好~\n我是line機器人~"
      });
    case "Yee先生":
    case "yee先生":
    case "Yee":
    case "yee":
      return client.replyMessage(replyToken,
        {
          type: 'flex',
          altText: 'this is a flex message',
          contents: {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "角色卡",
                  "size": "lg",
                  "color": "#FFFFFF",
                  "weight": "bold"
                }
              ],
              "backgroundColor": "#6C757D"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "Yee先生",
                  "weight": "bold",
                  "size": "xxl"
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "margin": "md",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ㄎㄎ",
                      "size": "sm",
                      "color": "#999999",
                      "margin": "md",
                      "flex": 0
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "margin": "lg",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": "嗨~這裡是一款很廢的line機器人，\n你們想要的功能我做不到，\n你們不想要的廢功能卻是我的長項。",
                          "wrap": true,
                          "color": "#666666",
                          "size": "sm",
                          "flex": 5
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "spacing": "sm",
              "contents": [
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "yee先生",
                        "text": "yee先生"
                      },
                      "height": "sm",
                      "style": "link"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "留言給我",
                        "data": "from=others&&action=textBox&&title=留言給我~&&keyword=我要留言&&"
                          + "text=請以關鍵字「我要留言」為開頭寫下建議或者留下訊息\n基本上一個禮拜內會作出回應，請各位別急~"
                      },
                      "height": "sm",
                      "style": "link"
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "查詢股票",
                        "data": "from=others&&action=textBox&&title=查看股票當前資訊~&&keyword=股票{{你想看的股票代號}}"
                          + "&&text=請以關鍵字「股票」為開頭，後面緊接股票代號\nEx: 股票3008 就是查詢代號3008當前資訊，目前無法輸入公司名稱作查詢，因為我還不太會 ㄏㄏ"
                      },
                      "height": "sm",
                      "style": "link"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "postback",
                        "label": "查詢股票新聞",
                        "data": "from=others&&action=textBox&&title=查詢股票PTT&&keyword=ptt股票 {{關鍵字}}"
                          + "&&text=請以關鍵字「ptt股票」為開頭，空一格後面接關鍵字\nEx: ptt股票 爆跌，就是查詢股票版上關於爆跌的新聞，連結會通網ptt該篇文章"
                      },
                      "height": "sm",
                      "style": "link"
                    }
                  ]
                },
                {
                  "type": "spacer",
                  "size": "sm"
                }
              ],
              "flex": 0
            }
          }

        });
      break;
    case 'quick reply':
      return client.replyMessage(replyToken,
        {
          type: 'text',
          text: 'Quick reply sample 😁',
          quickReply: {
            items: [
              {
                type: 'action',
                action: {
                  type: 'postback',
                  label: 'ithome Clarence 鐵人賽1',
                  data: 'action=url&item=clarence',
                  text: 'ithome Clarence 鐵人賽2'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: 'ithome Clarence',
                  text: 'https://ithelp.ithome.com.tw/users/20117701'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'camera',
                  label: 'Send camera'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'cameraRoll',
                  label: 'Send camera roll'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'location',
                  label: 'Send location'
                }
              }
            ]
          },
        }
      );

    default:
      switch (true) {
        case /^股票/.test(message.text):
          var url = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_" + message.text.substring(2, message.text.length) + ".tw"
          https.get(url, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData);
                return client.replyMessage(replyToken, {
                  type: 'flex',
                  altText: 'this is a flex message',
                  contents: {
                    "type": "bubble",
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": parsedData.msgArray[0].nf,
                          "weight": "bold",
                          "size": "xxl",
                          "wrap": true
                        },
                        {
                          "type": "box",
                          "layout": "baseline",
                          "margin": "md",
                          "contents": [
                            {
                              "type": "text",
                              "text": parsedData.msgArray[0].ch,
                              "size": "sm",
                              "color": "#999999",
                              "margin": "md",
                              "flex": 0
                            }
                          ]
                        },
                        {
                          "type": "box",
                          "layout": "vertical",
                          "margin": "lg",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "box",
                              "layout": "baseline",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "成交價",
                                  "color": "#aaaaaa",
                                  "size": "sm",
                                  "flex": 1
                                },
                                {
                                  "type": "text",
                                  "text": "$" + parsedData.msgArray[0].pz,
                                  "wrap": true,
                                  "color": "#666666",
                                  "size": "sm",
                                  "flex": 5
                                }
                              ]
                            },
                            {
                              "type": "box",
                              "layout": "baseline",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "最高價",
                                  "color": "#aaaaaa",
                                  "size": "sm",
                                  "flex": 1
                                },
                                {
                                  "type": "text",
                                  "text": "$" + parsedData.msgArray[0].h,
                                  "wrap": true,
                                  "color": "#666666",
                                  "size": "sm",
                                  "flex": 5
                                }
                              ]
                            },
                            {
                              "type": "box",
                              "layout": "baseline",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "最低價",
                                  "color": "#aaaaaa",
                                  "size": "sm",
                                  "flex": 1
                                },
                                {
                                  "type": "text",
                                  "text": "$" + parsedData.msgArray[0].l,
                                  "wrap": true,
                                  "color": "#666666",
                                  "size": "sm",
                                  "flex": 5
                                }
                              ]
                            },
                            {
                              "type": "box",
                              "layout": "baseline",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "成交量",
                                  "color": "#aaaaaa",
                                  "size": "sm",
                                  "flex": 1
                                },
                                {
                                  "type": "text",
                                  "text": parsedData.msgArray[0].tv,
                                  "wrap": true,
                                  "color": "#666666",
                                  "size": "sm",
                                  "flex": 5
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    "footer": {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "button",
                          "style": "link",
                          "height": "sm",
                          "action": {
                            "type": "uri",
                            "label": "詳細",
                            "uri": "https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=" + parsedData.msgArray[0].c
                          }
                        },
                        {
                          "type": "spacer",
                          "size": "sm"
                        }
                      ],
                      "flex": 0
                    }
                  }
                });
              } catch (e) {
                console.error(e.message);
              }
            });
          }).on('error', (e) => { console.log(`Got error: ${e.message}`); });
          break;
        case /^我要留言/.test(message.text):
          const options = {
            host: 'api.line.me',
            path: '/v2/bot/profile/' + source.userId,
            headers: {
              Authorization: 'Bearer ' + config.channelAccessToken
            }
          }
          https.get(options, function (response) {
            var result = ''
            response.on('data', function (chunk) {
              result += chunk;
            });

            response.on('end', function () {
              const parsedData = JSON.parse(result);
              const jsdata = {
                "name": parsedData.displayName,
                "saying": message.text,
                "date": new Date()
              }
              var filePath = "./data_file/suggest.json";
              fs.readFile(filePath, function (err, file) {
                var fileString = file.toString();
                var obj = fileString ? JSON.parse(fileString) : [];
                obj.push(jsdata);
                fs.writeFile(filePath, JSON.stringify(obj), function (err) { });
              });
            });
          }).on('error', (e) => { console.log(`Got error: ${e.message}`); });
          break;
        case /^Ptt股票 /.test(message.text):
        case /^ptt股票 /.test(message.text):
          var url = "https://www.ptt.cc/bbs/stock/search?q=" + message.text.substring(6, message.text.length);
          url = encodeURI(url);
          https.get(url, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
              try {
                const $ = cheerio.load(rawData); // 載入 body
                const dataArray = [];
                //const list = $(target);
                const list = $(".r-list-container .r-ent");

                const obj = [];
                for (let i = 0; i < list.length; i++) {
                  if (i > 4) break;
                  console.log(list.eq(i).find('.title a').text());
                  obj.push({
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                      "type": "uri",
                      "label": list.eq(i).find('.title a').text(),
                      "uri": "https://www.ptt.cc/" + list.eq(i).find('.title a').attr('href')
                    }
                  });
                }
                return client.replyMessage(replyToken, {
                  type: 'flex',
                  altText: 'this is a flex message',
                  contents: {
                    "type": "bubble",
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "股票八卦",
                          "weight": "bold",
                          "size": "xl"
                        },
                        {
                          "type": "box",
                          "layout": "vertical",
                          "margin": "lg",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "box",
                              "layout": "baseline",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "來自",
                                  "color": "#aaaaaa",
                                  "size": "sm",
                                  "flex": 1
                                },
                                {
                                  "type": "text",
                                  "text": "PTT STOCK版，最近五筆",
                                  "wrap": true,
                                  "color": "#666666",
                                  "size": "sm",
                                  "flex": 5
                                }
                              ]
                            },
                            {
                              "type": "box",
                              "layout": "baseline",
                              "spacing": "sm",
                              "contents": [
                                {
                                  "type": "text",
                                  "text": "關鍵字",
                                  "color": "#aaaaaa",
                                  "size": "sm",
                                  "flex": 1
                                },
                                {
                                  "type": "text",
                                  "text": "PTT",
                                  "wrap": true,
                                  "color": "#666666",
                                  "size": "sm",
                                  "flex": 5
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    "footer": {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": obj,
                      "flex": 0
                    }
                  }
                });
              } catch (e) {
                console.error(e.message);
              }
            });
            process.on('unhandledRejection', error => {
              console.error('unhandledRejection', error);
              process.exit(1) // To exit with a 'failure' code
            });
          });
          break;
      }
  }
}

function handleImage(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.jpg`);

    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        return {
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
        };
      });
  } else if (message.contentProvider.type === 'external') {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent
    .then(({ originalContentUrl, previewImageUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl,
          previewImageUrl,
        }
      );
    });
}

function handleVideo(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.mp4`);

    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        return {
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: lineImgURL,
        };
      });
  } else if (message.contentProvider.type === 'external') {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent
    .then(({ originalContentUrl, previewImageUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl,
          previewImageUrl,
        }
      );
    });
}

function handleAudio(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === 'line') {
    const downloadPath = path.join(process.cwd(), 'public', 'downloaded', `${message.id}.m4a`);

    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        return {
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
        };
      });
  } else {
    getContent = Promise.resolve(message.contentProvider);
  }

  return getContent
    .then(({ originalContentUrl }) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'audio',
          originalContentUrl,
          duration: message.duration,
        }
      );
    });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

function handleSticker(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

function pttCrawler(url, backfunc) {

  request({
    "url": url,
    "method": "GET"
  }, (error, res, body) => {

    try {
      // 如果有錯誤訊息，或沒有 body(內容)，就 return
      if (error || !body) {
        return;
      }
      const $ = cheerio.load(body); // 載入 body
      const dataArray = [];
      //const list = $(target);
      const list = $(".r-list-container .r-ent");
      for (let i = 0; i < list.length; i++) {
        const title = list.eq(i).find('.title a').text();
        const link = list.eq(i).find('.title a').attr('href');
        const date = list.eq(i).find('.meta .date').text();
        dataArray.push({ title, date, link });
      }

      backfunc(dataArray);
    } catch (e) {
      console.error(e.message);
    }
  });
};

module.exports = router;