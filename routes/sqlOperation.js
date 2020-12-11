// test.js
const mysql = require('mysql');
const connection = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'stock',
    port: 3306
});
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:root@cluster0.ayv01.mongodb.net/stock?retryWrites=true&w=majority";

const mongoOpen = (userID, userName, flag) => {
    let url = "mongodb+srv://root:root@cluster0.ayv01.mongodb.net/stock?retryWrites=true&w=majority";
    return new Promise((resolve, reject) => {
        // Use connect method to connect to the Server
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        client.connect(err => {
            if (err) {
                reject(err);
            } else {
                const userColl = client.db("stock").collection("userProfile");
                resolve(userColl);
            }
        });
    })
};
const userHandleMongo = (userID, userName, flag) => {
    return new Promise(function (resolve, reject) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        if (flag) {
            client.connect(err => {
                const userColl = client.db("stock").collection("userProfile");
                userColl
                    .find({ 'userID': userID })
                    .toArray(function (err, items) {
                        if (err) reject(err);;
                        console.log('登入的使用者為: ', items);
                        resolve(items);
                    });

            });
            client.close();
        } else {
            client.connect(err => {
                const userColl = client.db("stock").collection("userProfile");
                userColl.insertOne({ 'userID': userID, 'userName': userName, 'cost': 0, income: 0 });
                resolve({ 'userID': userID, 'userName': userName, 'cost': 0, income: 0 });
            });
            client.close();
        }

    })
}

const buyIn = (userID, stockNum, stockPrice, stockCnt, stockDate) => {
    return new Promise(function (resolve, reject) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        client.connect(err => {
            const userColl = client.db("stock").collection("userProfile");
            const stockRecord = client.db("stock").collection("stockRecord");
            userColl.findOneAndUpdate(
                {
                    "userID": userID,
                    "ownStock.stockNum": stockNum
                },
                {
                    $inc: {
                        "ownStock.$.ownCnt": parseInt(stockCnt)
                    }
                },
                {
                    returnOriginal: false
                },
                function (error, result) {
                    if (result.value == null) {
                        userColl.updateOne(
                            {
                                "userID": userID
                            },
                            {
                                $push: {
                                    "ownStock": {
                                        "stockNum": stockNum,
                                        "ownCnt": parseInt(stockCnt),
                                        "sellOut": 0,
                                        "profit": 0
                                    }

                                }
                            }
                        );
                    }
                }
            )

            stockRecord.insertOne(
                {
                    "userID": userID,
                    "stockNum": stockNum,
                    "date": new Date(stockDate),
                    "price": stockPrice,
                    "state": false,
                    "count": parseInt(stockCnt)
                }
            );
            if (err) reject(err);
            resolve();
        });
        client.close();
    });
};
module.exports = { mongoOpen, userHandleMongo, buyIn };

