const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
        response.send("Hello from Firebase!");
});

  // 用於Firebase SDK的Cloud Functions導出一個functions.firestore 對象，該對象使您可以創建綁定到特定Cloud Firestore事件的處理程序。

    // |事件類型|觸發|
    // | -- | -- |
    // |onCreate()|首次寫入文檔時觸發。|
    // |onUpdate()|當文檔已經存在並且值更改時觸發。|
    // |onDelete()|刪除帶有數據的文檔時觸發。|
    // |onWrite()|觸發時onCreate，onUpdate或者onDelete被觸發。|
    
    
///儲存FCM Tokens 的 firestore DB onCreate()事件被觸發時，執行這個function
///https://firebase.google.com/docs/functions/firestore-events
exports.FCMonCreateDB = functions.firestore.document('tokens/{messageId}').onWrite(
        async (request, response) => {
          console.log('tokens is onCreate .');
          const allTokens = await admin.firestore().collection('tokens').get();
          const tokens = [];
          let text = "";
          allTokens.forEach((tokenDoc) => {
            text = JSON.stringify(tokenDoc.data().uid);
            tokens.push(tokenDoc.id);
            console.log("id",tokenDoc.id);
          });
          console.log(JSON.stringify(tokens));
          const payload = {
            notification: {
              title: "歡迎使用FCM自動註冊服務",
              // body: "123456",
              body: "歡迎"+text+"註冊本服務",
            }
          };
          await admin.messaging().sendToDevice(tokens, payload);
          if (tokens.length > 0) {
            const response = await admin.messaging().sendToDevice(tokens, payload);
            response.send('SUSUSUSHello from Firebase!');
          }
        });

///API被觸發時，執行這個function
exports.sendFCMforPublic = functions.region('asia-northeast1').https.onRequest(async (request, response) => {
        console.log('A new user signed in for the first time.');
        const allTokens = await admin.firestore().collection('tokens').get();
        const tokens = [];
        let text = "";
        allTokens.forEach((tokenDoc) => {
                text = JSON.stringify(tokenDoc.data().uid);
                tokens.push(tokenDoc.id);
                console.log("id", tokenDoc.id);
                // console.log("uid", JSON.stringify(tokenDoc.uid));
                // console.log("JSONuid",text);
                // console.log("dtl",tokenDoc.data().uid);
        });
        // .catch((err) => {
        //   console.log('Error getting documents', err);
        // });

        // const text = "FCM D 加辣"
        const payload = {
                notification: {
                        title: "歡迎使用FCM ",
                        body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
                        // body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
                        // icon: snapshot.data().profilePicUrl || '/images/profile_placeholder.png',
                        // click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
                }
        };
        await admin.messaging().sendToDevice(tokens, payload);
        if (tokens.length > 0) {
                // Send notifications to all tokens.
                const response = await admin.messaging().sendToDevice(tokens, payload);
                // await cleanupTokens(response, tokens);
                console.log('SUSUSUSHelloNotifications have been sent and tokens cleaned up.');
                response.send('SUSUSUSHello from Firebase!');
        }
});

