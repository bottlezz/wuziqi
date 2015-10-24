var leftedge = 15;
var rightedge = 0;
var topedge = 15;
var bottomedge = 0;

function inrange(i, j){
    if(i<topedge || i>bottomedge) return false;
    if(j<leftedge || j>rightedge) return false;
    return true;
}

function onboard(i, j){
    if(i<1 || i>15) return false;
    if(j<1 || j>15) return false;
    return true;
}

function typescore( mode){
    switch (mode){
        case 0: return 100000; // 长连
        case 1: return 5000;  // 活四
        case 2: return 500;   // 冲四
        case 3: return 200;    // 活三
        case 4: return 50;      // 眠三
        case 5: return 5;       //活二
        case 6: return 3;       //眠二
        case 7: return 0;
        case 8: return -5;      // 死X
        default: return 0;
    }
    return 0;
}


function count(pos, mode, mycolor, board){
    var yourcolor = mycolor==1?2:1;
    var horioffset = 0;
    var vertioffset = 0;
    switch(mode){
        case 0: // horizotal
            horioffset = 1;
            break;
        case 1: // vertical
            vertioffset = 1;
            break;
        case 2: // left diagonal
            horioffset = 1;
            vertioffset = -1;
            break;
        case 3: // right dianogal
            horioffset = 1;
            vertioffset = 1;           
            break;
    }
    var die_1 = false;
    var die_2 = false;
    var count = 1;
    var i = pos.x;
    var j = pos.y;

    // TODO: edge detection
    i = i-horioffset; j = j-vertioffset;    
    while(onboard(i,j) == true && board[i][j] == mycolor){
        count++;
        i = i-horioffset; j = j-vertioffset;    
    } 
    if(onboard(i,j) == false || board[i][j] == yourcolor) die_1 = true;

    i = pos.x + horioffset;
    j = pos.y + vertioffset;
    while(onboard(i,j) == true && board[i][j] == mycolor){
        count++;
        i = i+horioffset;
        j = j+vertioffset;
    }
    if(onboard(i,j) == false || board[i][j] == yourcolor) die_2 = true;
    //cout<<mode<<" "<<horioffset<<" "<<vertioffset<<endl;
    //cout<<"count "<<count<<" die "<<die_1<<" "<<die_2<<endl;

    if(count == 5) return 0; // 长连
    else if(count == 4){
        if(!die_1 && !die_2) return 1; //活四
        else if(!die_1 || !die_2) return 2; //冲四
        else return 8;// 死四
    }
    else if(count == 3){
        if(!die_1 && !die_2) return 3; // 活三
        else if(!die_1 || !die_2) return 4; // 眠三
        else return 8; // 死三
    }
    else if(count == 2){
        if(!die_2 && !die_1) return 5; //活二
        else if(!die_1 || !die_2) return 6; //眠二
        else return 8; // 死二
    }
    else if(count == 1){
        if(!die_1 && !die_2) return 6;
        return 7;
    }
    else return 7;
}

function checkpoint(pos, color, board){
    var result = [0,0,0,0];
    if(pos.x<topedge || pos.x>bottomedge || pos.y<leftedge || pos.y>rightedge){
        result[0] = -1;
        return result;
    }

    for(var i = 0; i<4; i++) result[i] = count(pos, i, color, board);
    return result;
}



function computescore(pos, color, board){
	 var tags = checkpoint(pos, color, board);
    //printvector(tags);

    var scores = new Array(); 
    
    tags.sort();
    var k = typescore(tags[0]); // 单一最高类型得分


    if(tags[0] < 2) return k; // 长连 或者 活四
    else if(tags[0] == 2){
        if(tags[1] == 2 || tags[1] == 3) return 10000; // 双冲四 或者 冲四活三
        else return k;
    }
    else if(tags[0] == 3){
        if(tags[1] == 3) return 5000;   // 双活三
        else if(tags[1] == 4) return 1000;  // 活三眠三
        else return k;
    }

    else if(tags[0] == 5){
        if(tags[1] == 5) return 100;
        else if(tags[1] == 6) return 10;
        else return k;
    }
    else return k;
}

function getAiStep(array, color){
	//myColor=2 means Ai is white stone;
	//myColor=1 means Ai is black stone;
	var possibles = new Array();
	var poss = new Array();
	var maxscore = 0;
	for(var i=1;i<16;i++){
		for(var j=1;j<16;j++){
			if(array[i][j]==0){
				//if empty spot, return the spot
				//return {x:i,y:j};
				poss.push({x:i, y:j});
			}
			else{
				topedge = Math.max(Math.min(topedge, i-2),1);
                bottomedge = Math.min(Math.max(bottomedge, i+2),15);
                leftedge = Math.max(Math.min(leftedge, j-2),1);
                rightedge = Math.min(Math.max(rightedge, j+2),15);
			} 
		}
	}

	for(var i = 0; i<poss.length; i++){
        if(inrange(poss[i].x, poss[i].y)) possibles.push(poss[i]);
    }

    for(var i = 0; i<possibles.length; i++){
       
        var score = computescore(possibles[i], color, array);
        var youcolor = color == 1? 2:1;
        var defensescore = computescore(possibles[i], youcolor, array);
        //score = weightscore(score, possibles[i]);
        var layer = Math.min(Math.min(possibles[i].x, 14-possibles[i].x), Math.min(possibles[i].y, 14-possibles[i].y));
        //cout<<possibles[i].first<<" "<<possibles[i].second<<" "<<layer<<" "<<score<<" "<<defensescore<<endl;
        score = score + layer + defensescore;
        if(score>maxscore){
            
            maxscore = score;
            result = possibles[i];    
        }
    }
    //if(color == 1) cout<<"player A ";
    //else cout<<"player B ";
    //cout<<result.first<< " "<<result.second<<endl;
    return result;
}