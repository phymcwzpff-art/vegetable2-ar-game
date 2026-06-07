const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const veg = document.getElementById("veg");
const warning = document.getElementById("warning");
const statusText = document.getElementById("status");
const turnText = document.getElementById("turn");

const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");

let player = 1;
let exploded = false;

let size = 120;

let startDistance = null;
let maxGrowth = 0;

let lastCenterX = 0;
let lastTime = Date.now();

function changeTurn(){

player = player === 1 ? 2 : 1;

turnText.innerText =
"현재 차례 : 플레이어 " + player;

}

function explode(){

if(exploded) return;

exploded = true;

result.classList.remove("hidden");

resultTitle.innerText =
"💥 플레이어 " +
player +
" 패배!";
}

function passVegetable(direction){

const startX =
parseFloat(veg.style.left);

let x = startX;

const target =
direction === "right"
? window.innerWidth + 300
: -300;

const interval = setInterval(()=>{

x += direction === "right"
? 40
: -40;

veg.style.left = x + "px";

if(
(direction==="right" && x>target) ||
(direction==="left" && x<target)
){

clearInterval(interval);

changeTurn();

veg.style.left =
(window.innerWidth/2)+"px";

}

},16);

}

const hands = new Hands({
locateFile:(file)=>
`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
maxNumHands:2,
modelComplexity:1,
minDetectionConfidence:0.8,
minTrackingConfidence:0.8
});

hands.onResults((results)=>{

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

if(exploded) return;

if(
results.multiHandLandmarks &&
results.multiHandLandmarks.length===2
){

for(const landmarks of results.multiHandLandmarks){

drawConnectors(
ctx,
landmarks,
HAND_CONNECTIONS,
{
color:"#00FF00",
lineWidth:4
}
);

drawLandmarks(
ctx,
landmarks,
{
color:"#00FF00",
lineWidth:2
}
);

}

const h1 =
results.multiHandLandmarks[0][9];

const h2 =
results.multiHandLandmarks[1][9];

const centerX =
(h1.x+h2.x)/2;

const centerY =
(h1.y+h2.y)/2;

veg.style.left =
(centerX*window.innerWidth)+"px";

veg.style.top =
(centerY*window.innerHeight)+"px";

const dx=h1.x-h2.x;
const dy=h1.y-h2.y;

const distance =
Math.sqrt(dx*dx+dy*dy);

if(startDistance===null){

startDistance = distance;

return;

}

const growth =
Math.max(
0,
distance-startDistance
);

size += growth * 4;

veg.style.fontSize =
Math.min(size,900)+"px";

if(size>450){

warning.style.display="block";

}

if(size>850){

explode();

}

const now = Date.now();

const speed =
(centerX-lastCenterX)/
(now-lastTime);

if(Math.abs(speed)>0.01){

if(speed>0){

passVegetable("right");

}else{

passVegetable("left");

}

}

lastCenterX = centerX;
lastTime = now;

statusText.innerText =
"🌱 채소 키우는 중";

}else{

statusText.innerText =
"🙌 양손을 보여주세요";

startDistance=null;

}

});

const camera = new Camera(video,{
onFrame:async()=>{
await hands.send({
image:video
});
},
width:1280,
height:720
});

camera.start();
