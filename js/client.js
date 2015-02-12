//var connect=new GameCenter();


var stage = new PIXI.Stage();
var renderer = new PIXI.autoDetectRenderer(418, 418, null, true, true);

//var renderer = new PIXI.CanvasRenderer(1024, 768, null, true, true);
document.body.appendChild(renderer.view);
requestAnimFrame(animate);
function animate() {
  	requestAnimFrame(animate);


    renderer.render(stage);
}

var game= new GameData();
game.init();

var turnCount=0;
function isWhite(){
	return turnCount%2;
}
function isBlack(){
	return (turnCount+1)%2;
	
}
function isMyTurn(){
	return true;
}
function GameData(){
	this.players=[,];
	this.chessArray= new Array();
	this.isReady=false;
	this.winner;
	this.init=function(){
		//initial chess array
		for(var i=0;i<17;i++){
			this.chessArray[i]=new Array();
			for(var j=0;j<17;j++){
				this.chessArray[i][j]=0;
			}
		}
		//mock up
		this.players=['a','b'];
		this.isReady=true;
	};
	this.setBalckStone=function(x,y){
		if(this.chessArray[x][y]!=0){
			return false;
		}
		var blackStone=PIXI.Sprite.fromImage('../img/qzh__.jpg');
		this.chessArray[x][y]=1;//black
		var stone=new Stone(blackStone,x,y);
		blackStone.position.set(x*26.125-13, y*26.125-13);
		stage.addChild(blackStone);
		return true;
	};
	this.setWhiteStone=function(x,y){
		if(this.chessArray[x][y]!=0){
			return false;
		}

		var whiteStone=PIXI.Sprite.fromImage('../img/qzb__.jpg');
		this.chessArray[x][y]=2;//white
		var stone=new Stone(whiteStone,x,y);
		whiteStone.position.set(x*26.125-13, y*26.125-13);
		stage.addChild(whiteStone);
		return true;
	};
	this.checkWins=function(){
		for (var i = this.chessArray.length - 5; i >= 0; i--) {
			var line=this.chessArray[i];
			for(var j=0;j<line.length-5;j++){
				if(line[j]!=0){

					if(this.chessArray[i][j]==this.chessArray[i][j+1]&&
						this.chessArray[i][j]==this.chessArray[i][j+2]&&
						this.chessArray[i][j]==this.chessArray[i][j+3]&&
						this.chessArray[i][j]==this.chessArray[i][j+4])
					{
						this.setWinner(this.chessArray[i][j]);
						return true;
					}

					if(this.chessArray[i][j]==this.chessArray[i+1][j]&&
						this.chessArray[i][j]==this.chessArray[i+2][j]&&
						this.chessArray[i][j]==this.chessArray[i+3][j]&&
						this.chessArray[i][j]==this.chessArray[i+4][j]){
						this.setWinner(this.chessArray[i][j]);
						return true;
					}
					if(this.chessArray[i][j]==this.chessArray[i+1][j+1]&&
						this.chessArray[i][j]==this.chessArray[i+2][j+2]&&
						this.chessArray[i][j]==this.chessArray[i+3][j+3]&&
						this.chessArray[i][j]==this.chessArray[i+4][j+4]){
						this.setWinner(this.chessArray[i][j]);
						return true;
					}
					if(j>5&&
						this.chessArray[i][j]==this.chessArray[i+1][j-1]&&
						this.chessArray[i][j]==this.chessArray[i+2][j-2]&&
						this.chessArray[i][j]==this.chessArray[i+3][j-3]&&
						this.chessArray[i][j]==this.chessArray[i+4][j-4]){
						this.setWinner(this.chessArray[i][j]);
						return true;
					}

				}
			}
		}
		return false;
	};
	this.setWinner=function(idx){
		console.log(idx);
		console.log(this.isReady);
		this.winner=this.players[idx-1];
		this.isReady=false;
		console.log('ends');
	};


}


var board= PIXI.Sprite.fromImage('../img/qp__.jpg');

function Stone(sprite,x,y){
	this.sprite=sprite;
	this.x=x;
	this.y=y;
}


stage.addChild(board);

stage.touchstart = stage.mousedown = function( data ) {
    var point=data.getLocalPosition(stage);
    var dx=Math.floor((point.x+13)/26.125);
    var dy=Math.floor((point.y+13)/26.125);
    if(!game.isReady){
    	return;
    }
    if(isBlack()&&isMyTurn()){
    	if(dx==0||dy==0||dy==16||dx==16){
    		return;
    	}
    	if(!game.setBalckStone(dx, dy)){
    		return;
    	}
    }
    if(isWhite()&&isMyTurn()){
    	if(dx==0||dy==0||dy==16||dx==16){
    		return;
    	}
    	if(!game.setWhiteStone(dx, dy)){
    		return;
    	}
    }
    if(game.checkWins()){
    	return;
    }

    turnCount++;
};