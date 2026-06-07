const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const veg = document.getElementById("veg");
const warning = document.getElementById("warning");
const statusText = document.getElementById("status");

const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");

let exploded = false;

let size = 120;
let startDistance = null;

function explode(){

if(exploded) return;

exploded = true;

result.classList.remove("hidden");

resultTitle.innerText =
"💥 채소가 터졌어요!";
}

const hands = new Hands({
locateFile:(file)=>
`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
maxNumHands:2,
modelComplexity:1,
minDetectionConfidence:0.75,
minTrackingConfidence:0.75
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
(centerX * window.innerWidth) + "px";

veg.style.top =
(centerY * window.innerHeight) + "px";

const dx =
h1.x - h2.x;

const dy =
h1.y - h2.y;

const distance =
Math.sqrt(dx*dx + dy*dy);

if(startDistance === null){

startDistance = distance;

statusText.innerText =
"🌱 손을 벌려 채소를 키워보세요";

return;

}

const growth =
Math.max(
0,
distance - startDistance
);

size += growth * 20;

if(size > 1800){
size = 1800;
}

veg.style.fontSize =
size + "px";

if(size > 700){

warning.style.display =
"block";

warning.innerText =
"⚠ 위험해요!";

}

if(size > 1400){

explode();

}

statusText.innerText =
"🌱 채소 성장중";

}else{

statusText.innerText =
"🙌 양손을 보여주세요";

startDistance = null;

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
