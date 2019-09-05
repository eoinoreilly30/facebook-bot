const config = require("./config.json")

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const db = low(new FileSync('./db.json'))

const login = require("facebook-chat-api")

var request = require('request')
var cheerio = require('cheerio')

var sent = false
var found = false

if (!db.has("created").value()) {
  config.users.map(user => db.set(user, 0).write())
  db.set("created", true).write()
}

login({ email: config.email, password: config.password }, (err, api) => {
    if(err) return console.error(err);

    const myID = api.getCurrentUserID()

    api.listen((err, message) => {
      console.log(message)
      if (message.mentions.hasOwnProperty(myID)) {
        let messageArray = message.body.split(" ")
        let operator = messageArray[2]
        let increment = parseInt(messageArray[3])
        let name = messageArray[4]

        // console.log(message.threadID)

        switch (operator) {
          case "setup":
            db.set("threadID", message.threadID).write()
            api.sendMessage("Success!", message.threadID);
            break;
          case "help":
            api.sendMessage("Usage: @Bot Bot scores/add/minus/help 'number' 'name'", message.threadID);
            break;
          case "scores":
            config.users.map(user => api.sendMessage(user + ": " + db.get(user).value(), message.threadID))
            break;
          case "add":
            db.update(name, score => score + increment).write()
            api.sendMessage(name + "'s score is now " + db.get(name).value(), message.threadID);
            break;
          case "minus":
            db.update(name, score => score - increment).write()
            api.sendMessage(name + "'s score is now " + db.get(name).value(), message.threadID);
            break;
          default:
            api.sendMessage("I don't understand", message.threadID);
        }
      }
    });

    // setInterval(function() {
    //   request('https://www.joe.ie/quiz/the-joe-friday-pub-quiz', function(err, resp, html) {
    //     if (err) return console.error(err)
    //
    //     const $ = cheerio.load(html)
    //
    //     $('.time-posted-link').each(function (i, e) {
    //       if (($(this).text().includes("minute")
    //           || $(this).text().includes("minutes")
    //           || $(this).text().includes("hour")
    //           || $(this).text().includes("days")) // remove
    //           && $(this).attr('href').includes("joe-friday-pub-quiz")) {
    //             found = true
    //             if (!sent) {
    //               console.log("https://www.joe.ie" + $(this).attr('href'))
    //               // api.sendMessage("https://www.joe.ie" + $(this).attr('href'), db.get("threadID").value());
    //               sent = true
    //             }
    //       } else {
    //         found = false
    //       }
    //     })
    //
    //     if (!found && sent) {
    //       sent = false
    //     }
    //   });
    // }, 5000);
    //300000

});
