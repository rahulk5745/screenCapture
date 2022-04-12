var stage = new createjs.Stage("canvas");
createjs.Ticker.on("tick", tick);

var selection = new createjs.Shape(),
	g = selection.graphics.setStrokeStyle(1).beginStroke("#000").beginFill("rgba(0,0,0,0.05)"),
    sd = g.setStrokeDash([10,5], 0).command,
    r = g.drawRect(0,0,100,100).command,
    moveListener;
    

stage.on("stagemousedown", dragStart);
stage.on("stagemouseup", dragEnd);

function dragStart(event) {
    stage.addChild(selection).set({x:event.stageX, y:event.stageY});
   	r.w = 0; r.h = 0;
    moveListener = stage.on("stagemousemove", drag);
};

function drag(event) {
 	r.w = event.stageX - selection.x;
 	r.h = event.stageY - selection.y; 
}

function dragEnd(event) {
    stage.off("stagemousemove", moveListener);
}

function tick(event) {
    stage.update(event);
    sd.offset--;
}

// window.onload = function() {
//     stage = new createjs.Stage("myCanvas");
 
//     circle = new createjs.Shape();
//     circle.graphics.beginFill("red").drawCircle(0, 0, 40);
 
//     stage.addChild(circle);
 
//     stage.update();
//  }