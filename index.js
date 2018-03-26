
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('you are in wrong place')
})

// recommended to inject access tokens as environmental variables, e.g.


 const token = process.env.FB_VERIFY_TOKEN
 const access = process.env.FB_PAGE_ACCESS_TOKEN

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === token) {
		res.send(req.query['hub.challenge'])
	}
		res.send('Error, wrong token')
	
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text

			decideMessage(sender, text )
			//sendTextMessage(sender, "hmm ki  " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			decideMessage(sender, text)
			//sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})

function decideMessage(sender, text1){
	let text = text1.toLowerCase()
	if(text.includes("summer")){
		sendTextMessage(sender, "ke tui?")

	}else if (text.includes("winter")) {
		sendTextMessage(sender, "fuck off")

	} else {
		sendTextMessage(sender, "I like Fall")
		sendButtonMessage(sender, "What is Your favourite season?")
	}
}




function sendTextMessage(sender, text) {
	let messageData = { text:text }
	sendRequest(sender, messageData)
}


function sendButtonMessage(sender, text){
		let messageData = {
			"attachment":{
	      "type":"template",
	      "payload":{
	        "template_type":"button",
	        "text":text,
	        "buttons":[
	          {
	            "type":"postback",
	            "title":"Summer",
	            "payload":"summer"
	          },
	          {
	            "type":"postback",
	            "title":"Winter",
	            "payload":"winter"
	          }
	          
	        ]
	      }
	    }		
	}
	sendRequest(sender, messageData)
}

function sendRequest(sender, messageData){

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:access},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})

}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})