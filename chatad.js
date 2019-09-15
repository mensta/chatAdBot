
//var request = require("request");
var ws = require("ws");
//var HTTP = require('https-proxy-agent');

const cellcraftServerList = [
    "ws://cellcraft.io:4041/"
];
const agarredPortList = [
    443,
    444,
    446,
    447,
    450,
    452,
    455,
    456,
    457
];
const _3rbPortList = [
    8807,
    8802,
    8803,
    8804,
    8805,
    8806,
    4407,
    4408,
    4409,
    4410,
    4401
];
const agarbioPortList = [
    11004,
    11005,
    11022,
    11023,
    11024,
    11025,
    11026,
    11027,
    11030,
    11002,
    11003,
    11010,
    11006,
    11007,
    11008,
    11009
];

class bot {
    constructor(target, origin) {
        this.ws = null;
        this.target = target;
        this.origin = origin;
        this.chatInterval = null;
        this.protocol6 = false;
        this.headers = {
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
			'Cache-Control': 'no-cache',
			'Origin': origin,
			'Pragma': 'no-cache',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
        };
        this.connect();
    }

    connect() {
        this.ws = new ws(this.target, {
			'headers': this.headers,
			//'agent': proxyServer
        });
        this.ws.binaryType = 'arraybuffer';
		this.ws.onopen = this.onopen.bind(this);
		this.ws.onmessage = this.onmessage.bind(this);
		this.ws.onclose = this.onclose.bind(this);
		this.ws.onerror = this.onerror.bind(this);
    }

    onopen() {
        console.log("Connected to target server", this.origin);
        switch (this.origin.split("://")[1]) {
            case 'cellcraft.io':
                this.send(Buffer.from([254, 5, 0, 0, 0]));
                this.send(Buffer.from([255, 50, 137, 112, 79]));
                break;
            case 'ogar.be':
            case 'agar.bio':
                this.send(Buffer.from([254, 1, 0, 0, 0]));
                this.send(Buffer.from([255, 114, 97, 103, 79]));
                break;
            case 'agar.red':
            case '3rb.be':
                this.send(Buffer.from([254, 6, 0, 0, 0]));
                this.send(Buffer.from([255, 1, 0, 0, 0]));
                this.protocol6 = true;
        }
        this.spawn();
        this.startChatAds();
    }

    send(buf) {
		if (!this.ws || this.ws.readyState != 1) return;
		this.ws.send(buf);
		//console.log(new Uint8Array(buf));
    }

    startChatAds() {
        this.chatInterval = setInterval(() => {
            this.sendChatMessage();
        }, 5000);
    }

    sendChatMessage() {
        let chatMsg = Math.floor(Math.random() * 100) + " New Agario Game -> fstyle.ga" 
        var msg = this.protocol6 ? new Buffer(3 + chatMsg.length) : new Buffer(2 + 2 * chatMsg.length);
        var offset = 0;
        if (this.origin == "http://ogar.be") msg.writeUInt8(199, offset++);
        else msg.writeUInt8(99, offset++);
        msg.writeUInt8(0, offset++); // flags (0 for now)
        for (var i = 0; i < chatMsg.length; ++i) {
          msg.writeUInt16LE(chatMsg.charCodeAt(i), offset, true);
          if (this.protocol6) offset++;
          else offset += 2; //Nagar.eu Chat Auth: offset += 1; (Patched)
        }
        this.send(msg);
        //if (this.protocol6) console.log(new Uint8Array(msg));
    }
    
    spawn() {
        var arr = [0];
		if (this.origin == "http://cellcraft.io") arr = [0, 59, 0];
		var name = "SERVER"
        for (var i = 0; i < name.length; i++) {
            arr.push(name.charCodeAt(i));
			if (!this.protocol6) arr.push(0);
        }
        this.send(Buffer.from(arr));
    }

    onmessage(msg) {

    }
    
    onclose(e) {
        console.log("Disconnected.", this.target);
    }

    onerror(e) {

    }
}

let ogarbe = new bot("ws://51.83.75.138:80/", "http://ogar.be");

for (let i = 0; i < cellcraftServerList.length; i++) {
    let cellcraft = new bot(cellcraftServerList[i], "http://cellcraft.io");
}

for (let i = 0; i < agarbioPortList.length; i++) {
    let agarbio = new bot("ws://37.187.76.129:" + agarbioPortList[i], "http://agar.bio");
}

for (let i = 0; i < agarredPortList.length; i++) {
    new bot("ws://192.95.19.75:" + agarredPortList[i], "http://agar.red");
}

for (let i = 0; i < _3rbPortList.length; i++) {
    //new bot("ws://159.65.236.114:" + _3rbPortList[i], "http://3rb.be");
}
