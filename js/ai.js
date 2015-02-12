function getAiStep(array, myColor){
	//myColor=2 means Ai is white stone;
	//myColor=1 means Ai is black stone;
	for(var i=1;i<16;i++){
		for(var j=1;j<16;j++){
			if(array[i][j]==0){
				//if empty spot, return the spot
				return {x:i,y:j};
			}
		}
	}
}