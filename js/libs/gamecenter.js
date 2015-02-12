
//client network layer

//can send data in binary
	//init objects
	// var recievedObject;	  // recieved json object

function GameCenter() {

	var wsPort;

	var ID;
	var connected=false;
	//var mazeID;
	var connection;
	var GcObjectList;
	var GcLib=this;
	this.onConnect=function(){};

	//to close connection connection.close();
	(this.initial = function() {
		console.log("loading!");
		//check preconditions for web socket support
		if (window.MozWebSocket) {

	        console.log('using MozillaWebSocket');
	        window.WebSocket = window.MozWebSocket;
	    } else if (!window.WebSocket) {

	        console.log('browser does not support websockets!');
	        //alert('browser does not support websockets!');
	        return;
	    }

		wsPort = "50000";
		var matches = document.URL.match(/http:\/\/([\d.]+)[\/:].*/);
        var ip = matches[1];
        //var ip="localhost";
        console.log("IP: " + ip);

        GcObjectList=new Array();

		connection = new WebSocket("ws://" + ip + ":" + wsPort);

		connection.onopen = function(event) { onConnection() };
		connection.onerror = function(error) { connectionError(error) };
		connection.onmessage = function(message) { receiveMessage(message) };
		connection.onclose = function(event) { onCloseEvent() };
	})();

	//connection error handling
	var connectionError = function(error) {
		console.log("connection error: " + error);
		//alert(error);
		//document.getElementById('test').innerHTML = error;
	}

	//initial connection sequence
	var onConnection = function() {
		console.log("connected");
		connected=true;
		//this.onConnect();
		// sendOut(gameStateObject);
	}

	var onCloseEvent = function() {
		console.log("closing");
		connected=false;
	}

	var receiveMessage = function(message) {
		//convert JSON
		console.log(message);

		try {
			var receivedMessage = JSON.parse(message.data);

			console.log("Recevied Message " + receivedMessage);

			console.log("Received action " + receivedMessage.action
						+ " (" + typeof receivedMessage.action + ")");

			console.log("Received variables " + receivedMessage.variables
						+ " (" + typeof receivedMessage.variables + ")");
			var variables = receivedMessage.variables;
			try{
				variables = JSON.parse(variables);
				console.log("Parsed variables " + variables
						+ " (" + typeof variables + ")");
			} catch(e){
				//variables = null;
			}

			console.log("Received timestamp " + receivedMessage.timestamp
						+ " (" + typeof receivedMessage.timestamp + ")");

			console.log("Received body " + receivedMessage.body
						+ " (" + typeof receivedMessage.body + ")");

			var body = receivedMessage.body;

			try{
				body = JSON.parse(body);
				console.log("Parsed body " + body
						+ " (" + typeof body + ")");
			} catch(e){
				//body = null;
			}


			if (receivedMessage.action == "broadcasting") {
				onBroadCast(body);

			}else if (receivedMessage.action == "SYNC_LIST"){

			}else if(receivedMessage.action =="SYNC"){
				var objectKey=variables;
				for (var i = GcObjectList.length - 1; i >= 0; i--) {
					var gco = GcObjectList[i];
					//console.log("GCObject:"+gco.getkey()+" "+gco.getValue()+" compare:"+gco.getkey().toString());
					if(gco.getkey()==objectKey){
						gco.setValue(body);
						//gco.onUpdate(objectKey,body);
					}
				};

			}
			else {
			}

		} catch(error) {
			console.log('message is not a JSON object' + error);
		}
	}

	var sendMessage = function(action, variables, body) {
		//UNIX time stamp
		var timestamp = Math.round(new Date().getTime() / 1000)
		if(typeof variables != 'string'){
			variables = JSON.stringify(variables);
		}
		if(typeof body != 'string'){
			body = JSON.stringify(body);
		}

		var message = {
			"action": action,
			"variables": variables,
			"timestamp": timestamp,
			"body": body
		}

		if(connection.readyState == 1) {
			connection.send(JSON.stringify(message));
			console.log(JSON.stringify(message));
		} else {
			console.log("connection not ready!");
		}
		console.log("SENT");
	}

	this.broadcast= function(body) {
		sendMessage("broadcasting", "message", body);
	}

	this.createList = function(listName){

		var vars={key:listName,autoSync:true};
		sendMessage("create_list", JSON.stringify(vars), "");
		//sendMessage("create_list",'{"key":"UserProperty", "autoSync":"true"}',"");
	}
	this.appendList = function(listName, item){
		var vars={key:listName,autoSync:true};
		sendMessage("push_list_item", JSON.stringify(vars), JSON.stringify(item));
	}
	this.addListItem = function (listName,item){
		var vars={key:listName,index:0,autoSync:true};
		sendMessage("add_list_item", JSON.stringify(vars), JSON.stringify(item));
	}
	this.removeListItem = function (listName,item){
		var vars={key:listName,autoSync:true};
		sendMessage("remove_list_item", JSON.stringify(vars), JSON.stringify(item));
	}
	this.removeListItemByIndex = function (listName,index){
		var vars={key:listName,autoSync:true};
		sendMessage("remove_list_item_by_index", JSON.stringify(vars), JSON.stringify(index));
	}
	this.getList =function(listName){
		var vars={key:listName};
		sendMessage("get_list", JSON.stringify(vars), "");
	}
	this.setObject=function(key,obj){
		var vars={key:key,autoSync:true};
		sendMessage("set_object", JSON.stringify(vars), JSON.stringify(obj));
	}
	this.getObject=function(key){
		var vars={key:key};

		sendMessage("get_object", JSON.stringify(vars), null);
	}


	var alreadySet = "0";

	this.setUser = function(name, property) {

		sendMessage("set_user", {}, {"name":name, "property":property});
		sendMessage("create_list",{"key":"UserProperty", "autoSync":"true"},{});
	}


	this.registerGcObject = function(key){
		if(key!=null){
			var obj= new GcObject(key);
		//GcObjectList.push(obj);
			return obj;
		}

	}
	this.returnObjList=function(){
		return GcObjectList;
	}

	function GcObject(key,callBack){
		GcObjectList.push(this);
		var key;
		var value;
		this.onSync = function(){}
		if(arguments.length==2){
			key = key;
			this.onSync = callBack;

		}else if(arguments.length==1){
			key=key;
		}

		this.sync =function(){
			GcLib.getObject(key);
			//return value;
		}
		this.submit = function (obj){
			GcLib.setObject(key,obj);
			value=obj;
		}

		this.setValue = function(val){
			value=val;
		}
		this.getValue = function(){
			return value;
		}

		this.getKey=function(){
			return key;
		}
		//callBack function


	}
	function GcList(key,callBack){

		this.onSync= function(){}
		if(arguments.length==2){
			key = key;
			this.onSync = callBack();
		}else if(arguments.length==1){
			key=key;
		}
		this.sync = function() {

		}
		this.submit = function(){

		}
		this.pushBack = function (){

		}





	}

}
