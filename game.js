const V_W=800,V_H=600,GRAV=1200,THRUST=-1850,MX_FUEL=100,FUEL_USE=18,FUEL_REGEN=20;
const MOVE_SPD=340,START_Y=V_H-100,DASH_VEL=450,DASH_DUR=120,DASH_CD=800;
const SCROLL_BASE=1.1,SCROLL_MAX=3.2;
const COFFEE_DURATION=5000,BOOST_THRUST_MULT=1.25,BOOST_FUEL_MULT=0.55;
const RESCUE_COOLDOWN=8000,FALL_TRIGGER_MS=1500;
let sessionBest=0;
const ARCADE_CONTROLS={
P1U:['W','ArrowUp'],P1D:['S','ArrowDown'],P1L:['A','ArrowLeft'],P1R:['D','ArrowRight'],
P1A:['Space','K','Z'],P1B:['L','X','Shift'],P1C:['U','C'],START1:['Enter','R']
};
function bindKeys(s){s.keys={};for(const[a,k]of Object.entries(ARCADE_CONTROLS))s.keys[a]=k.map(x=>s.input.keyboard.addKey(x));}
function isHeld(s,a){return s.keys[a]?.some(k=>k.isDown)||false;}
function justPressed(s,a){return s.keys[a]?.some(k=>Phaser.Input.Keyboard.JustDown(k))||false;}
function tone(s,f,d,t='square',v=.1){
try{
const c=s.sound.context,o=c.createOscillator(),g=c.createGain();
o.type=t;o.frequency.value=f;g.gain.value=v;
o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+d);
}catch(_e){}
}
function textureExists(scene,key){return scene.textures.exists(key);}
function createAllTextures(scene){
if(textureExists(scene,'bg_space'))return;
const g=scene.add.graphics();
const lerp=(a,b,t)=>a+(b-a)*t;
const sunX=V_W/2,sunY=V_H*.62;
for(let y=0;y<V_H;y++){
const t=y/(V_H-1);
const r=Math.round(lerp(7,72,t));
const gg=Math.round(lerp(5,22+Math.sin(t*3.2)*18,t));
const b=Math.round(lerp(18,96+Math.sin(t*5.4)*32,t));
g.fillStyle((r<<16)|(gg<<8)|b);g.fillRect(0,y,V_W,1);
}
const sunLayers=[
{radius:280,color:0xff5a1f,alpha:.12},
{radius:220,color:0xff7b36,alpha:.18},
{radius:160,color:0xffa64a,alpha:.26},
{radius:118,color:0xffcd63,alpha:.32},
{radius:86,color:0xfff1a1,alpha:.38},
{radius:56,color:0xfffde0,alpha:.45}
];
sunLayers.forEach(({radius,color,alpha})=>{g.fillStyle(color,alpha);g.fillCircle(sunX,sunY,radius);});
for(let i=0;i<11;i++){
const glowY=sunY+100+i*12;
g.fillStyle(0xff9245,.14-.01*i);g.fillRect(0,glowY,V_W,4);
}
for(let i=0;i<36;i++){
const px=Math.random()*V_W,py=Math.random()*V_H*.5;
g.fillStyle(0xfff2d0,Math.random()*.4+.2);g.fillCircle(px,py,Math.random()<.7?1:1.6);
}
g.lineStyle(2,0xff1fda,.32);
for(let i=0;i<=V_W;i+=24)g.lineBetween(i,V_H,sunX,sunY+40);
g.lineStyle(2,0xff1fda,.5);
for(let i=0;i<14;i++)g.lineBetween(0,V_H-i*44,V_W,V_H-i*44);
g.generateTexture('bg_far',V_W,V_H);g.clear();

g.fillStyle(0,0);g.fillRect(0,0,V_W,V_H);
for(let i=0;i<22;i++){
const w=Phaser.Math.Between(38,86);
const h=Phaser.Math.Between(180,320);
const x=Phaser.Math.Between(-40,V_W);
const y=V_H-120-h;
g.fillStyle(0x14082f,.92);g.fillRoundedRect(x,y,w,h,6);
g.fillStyle(0x08041b,.6);g.fillRoundedRect(x+2,y+10,w-4,h-18,4);
const rows=Math.max(3,Math.floor(h/26));
const cols=Math.max(2,Math.floor(w/10));
for(let ry=0;ry<rows;ry++){
for(let cx=0;cx<cols;cx++){
if(Math.random()<.65){
const wx=x+6+cx*(w-12)/cols;
const wy=y+8+ry*(h-18)/rows;
const cPick=Math.random();
const win=cPick>.66?0x34f7ff:cPick>.33?0xff5dab:0xfff06d;
g.fillStyle(win,.85);g.fillRect(wx,wy,(w-14)/cols-1,6);
g.fillStyle(0xffffff,.4);g.fillRect(wx,wy+1,(w-14)/cols-3,2);
}
}
}
}
g.fillStyle(0x241049,.55);g.fillRect(0,V_H-110,V_W,110);
g.generateTexture('bg_mid',V_W,V_H);g.clear();

g.fillStyle(0,0);g.fillRect(0,0,V_W,V_H);
for(let i=0;i<10;i++){
const cx=Phaser.Math.Between(40,V_W-40);
const cy=Phaser.Math.Between(70,V_H-140);
const w=Phaser.Math.Between(140,260);
const h=Phaser.Math.Between(34,62);
g.fillStyle(0x8f5bff,.22);g.fillEllipse(cx,cy,w,h);
g.fillStyle(0xff9bff,.16);g.fillEllipse(cx+Phaser.Math.Between(-8,8),cy-Phaser.Math.Between(6,18),w*.7,h*.6);
g.lineStyle(2,0xffe3ff,.25);g.strokeEllipse(cx,cy,w,h);
}
g.generateTexture('bg_clouds',V_W,V_H);g.clear();

g.fillStyle(0x030116);g.fillRect(0,0,V_W,V_H);
for(let y=0;y<V_H;y++){
const t=y/(V_H-1);
const bVal=Math.round(lerp(12,48,t));
g.fillStyle((6<<16)|(10<<8)|bVal,.2);g.fillRect(0,y,V_W,1);
}
for(let i=0;i<160;i++){
const size=Math.random()<.85?1:2.2;
g.fillStyle(0xffffff,Math.random()*.8+.2);
g.fillCircle(Math.random()*V_W,Math.random()*V_H,size);
}
 for(let i=0;i<6;i++){
const cx=Math.random()*V_W,cy=Math.random()*V_H;
const radius=Phaser.Math.Between(120,200);
g.fillStyle(0x6b37ff,.14);g.fillCircle(cx,cy,radius);
g.fillStyle(0xff4ff6,.08);g.fillCircle(cx+Phaser.Math.Between(-40,40),cy+Phaser.Math.Between(-40,40),radius*.65);
}
g.generateTexture('bg_space',V_W,V_H);g.clear();

g.fillStyle(0x120901,.6);g.fillEllipse(17,18,20,28);
g.fillStyle(0xe7c443);g.fillEllipse(15,18,22,28);
g.fillStyle(0xf7d75e);g.fillEllipse(16,17,18,24);
g.fillStyle(0xf9e98c);g.fillEllipse(18,18,14,22);
g.fillStyle(0xc48621,.8);g.fillEllipse(20,22,10,18);
g.fillStyle(0x693c0f,.9);g.fillRect(24,6,4,8);g.fillRect(7,26,4,6);
g.fillStyle(0xfdf2b0,.85);
g.fillPoints([{x:9,y:23},{x:8,y:17},{x:12,y:12},{x:18,y:9},{x:23,y:12},{x:26,y:17},{x:24,y:22},{x:18,y:25}],true);
g.fillStyle(0xfffbce,.7);g.fillEllipse(12,15,6,8);
g.fillStyle(0xfff6a0,.6);g.fillEllipse(20,14,4,6);
g.fillStyle(0xb9791a,.8);
[ {x:13,y:22},{x:15,y:20},{x:19,y:20},{x:21,y:24},{x:17,y:26} ].forEach(p=>g.fillCircle(p.x,p.y,1.4));
g.fillStyle(0xfff8bc,.5);g.fillEllipse(23,22,6,4);
g.fillStyle(0x3b2207,.9);g.fillRoundedRect(16,4,5,6,2);
g.fillStyle(0xfdfae0,.55);g.fillEllipse(12,14,4,3);
g.generateTexture('banana',32,32);g.clear();

const drawVaca=(eyeAlpha)=>{
g.fillStyle(0xfaf3ff);g.fillRoundedRect(5,6,38,30,12);
g.fillStyle(0xe1d8f5);g.fillRoundedRect(7,10,34,22,10);
g.fillStyle(0xc0a9e1,.9);g.fillEllipse(26,26,18,10);
g.fillStyle(0x5f3c83,.9);g.fillEllipse(15,20,12,8);g.fillEllipse(31,24,13,9);
g.fillStyle(0x23142f,.9);g.fillEllipse(14,19,9,6);g.fillEllipse(30,23,10,6);
g.fillStyle(0xff83c7);g.fillRoundedRect(19,26,14,6,3);
g.fillStyle(0xffc2dc);g.fillRoundedRect(10,15,28,12,6);
g.fillStyle(0x2b84ff);g.fillRect(12,16,24,6);
g.fillStyle(0x081329);g.fillRect(14,16,20,6);
g.fillStyle(0x5cf7ff,eyeAlpha);g.fillRect(14,16,20,6);
g.fillStyle(0xffffff,.6);g.fillRect(15,17,6,2);g.fillRect(24,17,6,2);
g.fillStyle(0xffa575);g.fillRoundedRect(1,18,6,12,4);
g.fillStyle(0xffa575);g.fillRoundedRect(41,20,6,10,4);
g.fillStyle(0x372450);g.fillRoundedRect(3,18,6,12,4);
g.fillStyle(0x372450);g.fillRoundedRect(39,19,6,12,4);
g.fillStyle(0x28203b,.8);g.fillRoundedRect(12,24,6,12,3);g.fillRoundedRect(30,26,6,10,3);
g.fillStyle(0xffe4b3,.7);g.fillRoundedRect(8,32,32,4,2);
g.fillStyle(0x6b4a8a,.8);g.fillTriangle(14,6,18,1,22,6);g.fillTriangle(28,6,32,1,36,6);
g.fillStyle(0x241b35);g.fillRoundedRect(0,26,4,8,2);g.fillRoundedRect(44,28,4,6,2);
g.fillStyle(0x394461);g.fillRoundedRect(2,12,9,20,4);g.fillRoundedRect(37,14,9,18,4);
g.fillStyle(0x1a2339);g.fillRoundedRect(4,14,5,14,2);g.fillRoundedRect(39,16,5,12,2);
g.fillStyle(0x495a8a);g.fillRoundedRect(6,12,5,12,2);g.fillRoundedRect(39,14,5,12,2);
g.fillStyle(0x1b2134);g.fillRoundedRect(7,10,6,6,3);g.fillRoundedRect(35,12,6,6,3);
g.fillStyle(0xcad8f7,.7);g.fillRect(8,12,4,2);g.fillRect(36,14,4,2);
g.fillStyle(0x10192b);g.fillRoundedRect(20,12,14,16,6);
g.fillStyle(0x2e3f65);g.fillRoundedRect(22,14,10,12,4);
g.fillStyle(0x131b2b);g.fillRoundedRect(22,26,10,6,3);
g.fillStyle(0xff7b41);g.fillRoundedRect(22,32,6,6,3);
g.fillStyle(0xffd48c);g.fillRoundedRect(21,31,8,5,2);
for(let i=0;i<3;i++){g.fillStyle(0x4c5677);g.fillRect(23+i*3,15,2,8);}
g.fillStyle(0xfff3c5,.6);g.fillRect(22,29,10,1);
g.fillStyle(0x73f5ff,.4);g.fillRect(13,22,8,2);g.fillRect(29,24,8,2);
};
drawVaca(1);g.generateTexture('vaca_idle',48,48);g.clear();
drawVaca(.3);g.generateTexture('vaca_blink',48,48);g.clear();

g.fillStyle(0xf0169d);g.fillRoundedRect(2,6,32,24,10);
g.fillStyle(0x890c73,.7);g.fillRoundedRect(4,12,28,14,8);
g.fillStyle(0xff7fe0,.4);g.fillRoundedRect(6,14,24,10,6);
g.fillTriangle(6,6,12,0,16,6);
g.fillTriangle(22,6,28,0,32,6);
g.fillStyle(0xfff784);g.fillEllipse(12,16,7,9);g.fillEllipse(24,16,7,9);
g.fillStyle(0x100423);g.fillEllipse(12,17,2,5);g.fillEllipse(24,17,2,5);
g.fillStyle(0xfffef0,.6);g.fillCircle(11,14,1.4);g.fillCircle(23,14,1.4);
g.fillStyle(0xff397d);g.fillEllipse(18,24,8,4);
g.fillStyle(0xfff27b);g.fillRect(6,26,24,2);
g.fillStyle(0xff61d0);g.fillRect(4,24,3,4);g.fillRect(29,24,3,4);
g.fillStyle(0x260628,.6);
g.beginPath();g.moveTo(10,22);g.lineTo(6,24);g.strokePath();
g.beginPath();g.moveTo(26,22);g.lineTo(30,24);g.strokePath();
g.fillStyle(0xff6ba9);g.fillTriangle(18,22,16,26,20,26);
g.generateTexture('gato',36,36);g.clear();

g.fillStyle(0x0f182d);g.fillRoundedRect(6,6,22,22,9);
g.fillStyle(0x1e2744);g.fillRoundedRect(8,10,18,18,8);
g.fillStyle(0x334b74);g.fillRoundedRect(12,10,10,18,6);
g.fillStyle(0x122340);g.fillRoundedRect(13,12,8,14,5);
g.fillStyle(0x81faff,.5);g.fillRect(10,16,18,2);
g.fillStyle(0x192036);g.fillRoundedRect(7,6,24,6,4);
g.fillStyle(0x3a4f78);g.fillRoundedRect(7,6,24,3,3);
g.fillStyle(0x442518);g.fillEllipse(17,16,14,8);
g.fillStyle(0x2d140c,.9);g.fillEllipse(17,17,12,6);
g.fillStyle(0xffc36d,.5);g.fillEllipse(13,15,4,3);g.fillEllipse(21,15,4,3);
g.fillStyle(0x74f2ff,.7);g.fillTriangle(11,23,17,13,23,23);
g.fillStyle(0x11233e);g.fillTriangle(12,23,17,15,22,23);
g.fillStyle(0x3cf5ff,.8);g.fillRect(14,24,6,2);
g.fillStyle(0xfffae6,.6);g.fillRect(15,24,4,1);
g.fillStyle(0x0d1526);g.fillRoundedRect(4,10,4,14,3);
g.fillStyle(0x34f7ff);g.fillCircle(6,13,2);
g.fillStyle(0x34f7ff,.6);g.fillCircle(6,19,1.8);
g.generateTexture('coffee',32,32);g.clear();

g.fillStyle(0x121022);g.fillRoundedRect(0,2,140,22,11);
g.fillStyle(0x1d1a30);g.fillRoundedRect(2,5,136,16,9);
g.fillStyle(0x2e2747);g.fillRoundedRect(4,8,132,12,7);
g.fillStyle(0x07060f,.8);g.fillRoundedRect(6,10,128,8,6);
g.fillStyle(0x47f7ff,.4);g.fillRect(6,16,128,2);
g.fillStyle(0x44b4ff,.7);g.fillRect(6,11,128,2);
for(let i=0;i<6;i++){
const bx=10+i*20;
g.fillStyle(0x142033,.8);g.fillRect(bx,20,14,2);
g.fillStyle(0x52f3ff,.5);g.fillRect(bx,9,14,1);
}
g.lineStyle(2,0x53f2ff,.8);g.strokeRoundedRect(0,2,140,22,11);
g.lineStyle(1,0xffffff,.4);g.strokeRoundedRect(4,7,132,13,8);
g.generateTexture('plat',140,24);g.clear();

g.fillStyle(0xff6a00);g.fillTriangle(9,0,0,24,18,24);
g.fillStyle(0xffd700);g.fillTriangle(9,4,4,20,14,20);
g.fillStyle(0xffffe0,.7);g.fillTriangle(9,8,6,16,12,16);
g.generateTexture('flame',18,24);g.clear();

g.fillStyle(0xffff00,.8);g.fillCircle(8,8,8);
g.fillStyle(0xff00ff,.6);g.fillCircle(8,8,5);
g.generateTexture('trail',16,16);g.destroy();
}

class BootScene extends Phaser.Scene{
constructor(){super('BootScene');}
preload(){createAllTextures(this);}
create(){this.scene.start('TitleScene');}
}
class TitleScene extends Phaser.Scene{
constructor(){super('TitleScene');}
create(){
createAllTextures(this);
this.bgSpace=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_space').setScrollFactor(0).setAlpha(.18);
this.bgClouds=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_clouds').setScrollFactor(0).setAlpha(.35);
this.bgFar=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_far');
this.bgMid=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_mid');
this.add.graphics().fillStyle(0x0a0515,.45).fillRect(0,0,V_W,V_H);
this.add.text(V_W/2,V_H*.32,'PLATANUS\nVACA-LIFT',{
  fontFamily:'monospace',fontSize:'64px',color:'#35f6ff',align:'center',stroke:'#ff00ff',strokeThickness:6
}).setOrigin(.5);
this.add.text(V_W/2,V_H*.52,'Sube con jetpack, recoge platanos y cafe. Evita gatos.',{
  fontFamily:'monospace',fontSize:'20px',color:'#fff06d'
}).setOrigin(.5);
this.add.text(V_W/2,V_H*.61,'P1A: Jetpack | P1B: Dash Aereo | START1: Jugar',{
  fontFamily:'monospace',fontSize:'18px',color:'#bdf8ff'
}).setOrigin(.5);
const prompt=this.add.text(V_W/2,V_H*.74,'Presiona START1 (Enter o R)',{
fontFamily:'monospace',fontSize:'24px',color:'#ffff00'
}).setOrigin(.5);
this.tweens.add({targets:prompt,alpha:{from:1,to:.2},duration:600,yoyo:true,repeat:-1});
bindKeys(this);
}
update(){
this.bgSpace.tilePositionY+=.18;
this.bgClouds.tilePositionY+=.28;
this.bgFar.tilePositionY+=.25;
this.bgMid.tilePositionY+=.4;
if(justPressed(this,'START1')){tone(this,520,.12,'triangle',.08);this.scene.start('GameScene');}
}
}
class GameScene extends Phaser.Scene{
constructor(){super('GameScene');}
init(){
this.score=0;this.fuel=MX_FUEL;this.maxH=START_Y;this.nextY=START_Y-V_H;this.diff=1;
this.scrollSpd=SCROLL_BASE;this.dashCd=0;this.dashActive=false;this.canDash=true;
this.thrustT=0;this.landSoundCd=0;this.bananaCount=0;this.boostTimer=0;this.over=false;this.fallTimer=0;
this.lastCatY=-999;this.lastRescue=-RESCUE_COOLDOWN;this.refugeTimer=0;
this.boostFlashTimer=0;
this.lastCatSpawnTime=0;
}
create(){
createAllTextures(this);
bindKeys(this);
this.physics.world.setBounds(0,-99999,V_W,99999+V_H);
this.bgSpace=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_space').setScrollFactor(0).setAlpha(0);
this.bgClouds=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_clouds').setScrollFactor(0).setAlpha(0);
this.bgFar=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_far').setScrollFactor(0);
this.bgMid=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_mid').setScrollFactor(0);

this.plats=this.physics.add.group({immovable:true,allowGravity:false,maxSize:30});
this.bananas=this.physics.add.group({allowGravity:false,maxSize:25});
this.cats=this.physics.add.group({allowGravity:false,maxSize:20});
this.coffees=this.physics.add.group({allowGravity:false,maxSize:15});
this.trails=this.add.group();

this.p=this.physics.add.sprite(V_W/2,START_Y,'vaca_idle');
this.p.setCollideWorldBounds(true).setDepth(3).setScale(1);
this.p.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0,-99999,V_W,99999+V_H));
this.p.body.setMaxVelocity(400,GRAV*.8);

this.flame=this.add.sprite(0,0,'flame').setVisible(false).setDepth(2).setBlendMode(1);

this.physics.add.collider(this.p,this.plats,(pl,plat)=>{
this.canDash=true;
if(pl.body.blocked.down&&plat.body.touching.up){
const boostFactor=pl.scene.refugeTimer>0?1.3:1;
pl.scene.fuel=Math.min(MX_FUEL,pl.scene.fuel+FUEL_REGEN*(pl.scene.game.loop.delta/1000)*boostFactor);
if(pl.scene.landSoundCd<=0){tone(pl.scene,220,.05,'triangle',.04);pl.scene.landSoundCd=220;}
pl.scene.emitDust(pl.x,plat.y-10);
if(pl.scene.fuel<MX_FUEL*.25)pl.scene.refugeTimer=1000;
}
});
this.physics.add.overlap(this.p,this.bananas,this.collectB,null,this);
this.physics.add.overlap(this.p,this.cats,this.hitC,null,this);
this.physics.add.overlap(this.p,this.coffees,this.collectCoffee,null,this);

this.cameras.main.startFollow(this.p,true,.08,.1);
this.cameras.main.setDeadzone(V_W,V_H*.42);

this.hudBox={x:16,y:16,w:220,h:120};
this.hud=this.add.graphics().setScrollFactor(0).setDepth(5);
this.bestTxt=this.add.text(0,0,`Record ${sessionBest}m`,{fontFamily:'monospace',fontSize:'18px',color:'#f0f4ff'}).setScrollFactor(0).setDepth(5);
this.scoreTxt=this.add.text(0,0,'Altura 0m',{fontFamily:'monospace',fontSize:'20px',color:'#35f6ff'}).setScrollFactor(0).setDepth(5);
this.bananaTxt=this.add.text(0,0,'Bananas 0',{fontFamily:'monospace',fontSize:'18px',color:'#fff06d'}).setScrollFactor(0).setDepth(5);
this.boostTxt=this.add.text(0,0,'Cafe: inactivo',{fontFamily:'monospace',fontSize:'16px',color:'#bdf8ff'}).setScrollFactor(0).setDepth(5);
this.dashIcon=this.add.text(0,0,'DASH',{fontFamily:'monospace',fontSize:'16px',color:'#666'}).setOrigin(1,0).setScrollFactor(0).setDepth(5);
this.hudLeftX=this.hudBox.x;
this.hudRightX=V_W-this.hudBox.w-16;
this.hudSide='left';
this.applyHudLayout();
this.boostFlash=this.add.text(this.hudBox.x+this.hudBox.w/2,this.hudBox.y+this.hudBox.h+8,'Turbo 5s',{fontFamily:'monospace',fontSize:'16px',color:'#ffef8a'}).setOrigin(.5,0).setScrollFactor(0).setDepth(6).setAlpha(0);

this.spawnPlat(V_W/2,START_Y+50,300,false);
this.spawnCoffee(V_W/2-140,START_Y-160);
this.spawnCoffee(V_W/2+120,START_Y-240);

this.time.addEvent({delay:6000,loop:true,callback:()=>{
this.diff=Math.min(this.diff+.12,3.5);
this.scrollSpd=Math.min(SCROLL_BASE+this.diff*.35,SCROLL_MAX);
}});
}
applyHudLayout(){
const hb=this.hudBox;
this.bestTxt.setPosition(hb.x+18,hb.y+34);
this.scoreTxt.setPosition(hb.x+18,hb.y+56);
this.bananaTxt.setPosition(hb.x+18,hb.y+82);
this.boostTxt.setPosition(hb.x+18,hb.y+106);
this.dashIcon.setPosition(hb.x+hb.w-12,hb.y+hb.h-28);
if(this.boostFlash)this.boostFlash.setPosition(hb.x+hb.w/2,hb.y+hb.h+8);
}
update(t,dt){
const s=this,p=s.p,cam=s.cameras.main;
const deltaS=dt/1000;
cam.scrollY-=s.scrollSpd;
s.bgSpace.tilePositionY=cam.scrollY*.22;
s.bgClouds.tilePositionY=cam.scrollY*.55;
s.bgFar.tilePositionY=cam.scrollY*.42;
s.bgMid.tilePositionY=cam.scrollY*.68;

const screenY=p.y-cam.scrollY;
const needRight=p.x<this.hudLeftX+this.hudBox.w+70&&screenY<this.hudBox.h+90;
const targetSide=needRight?'right':'left';
if(targetSide!==this.hudSide){
s.hudSide=targetSide;
s.hudBox.x=targetSide==='left'?s.hudLeftX:s.hudRightX;
s.applyHudLayout();
}

if(isHeld(s,'P1L'))p.setVelocityX(-MOVE_SPD);
else if(isHeld(s,'P1R'))p.setVelocityX(MOVE_SPD);
else p.setVelocityX(0);

const grounded=p.body.blocked.down;
if(s.boostTimer>0)s.boostTimer=Math.max(0,s.boostTimer-dt);
const boostActive=s.boostTimer>0;
const thrustForce=boostActive?THRUST*BOOST_THRUST_MULT:THRUST;
const drainRate=boostActive?FUEL_USE*BOOST_FUEL_MULT:FUEL_USE;
if(isHeld(s,'P1A')&&s.fuel>0&&!s.dashActive){
p.setTexture('vaca_blink');
p.setAccelerationY(thrustForce);
s.fuel=Math.max(0,s.fuel-drainRate*deltaS);
s.flame.setVisible(true).setPosition(p.x,p.y+28).setScale(.7+Math.random()*.3);
s.thrustT-=dt;
if(s.thrustT<=0){tone(s,Phaser.Math.Between(88,108),.08,'sawtooth',.035);s.thrustT=450;}
}else{
p.setTexture('vaca_idle');
p.setAccelerationY(0);
s.flame.setVisible(false);
}

if(s.dashCd>0)s.dashCd-=dt;
if(s.landSoundCd>0)s.landSoundCd-=dt;
if(s.refugeTimer>0)s.refugeTimer=Math.max(0,s.refugeTimer-dt);
if(justPressed(s,'P1B')&&s.canDash&&s.dashCd<=0&&!grounded){
s.dashActive=true;s.canDash=false;s.dashCd=DASH_CD;
const dir=isHeld(s,'P1L')?-1:isHeld(s,'P1R')?1:(p.body.velocity.x<0?-1:1);
p.setVelocityX(dir*DASH_VEL);p.setVelocityY(p.body.velocity.y*.5);
p.setTint(0xffff00);tone(s,1200,.12,'triangle',.15);
s.time.delayedCall(DASH_DUR,()=>{s.dashActive=false;p.clearTint();});
for(let i=0;i<5;i++){
s.time.delayedCall(i*20,()=>{
const tr=s.add.image(p.x,p.y,'trail').setDepth(1).setBlendMode(1).setAlpha(.8).setScale(1);
s.tweens.add({targets:tr,alpha:0,scale:.3,duration:300,onComplete:()=>tr.destroy()});
});
}
}

s.maxH=Math.min(s.maxH,p.y);
s.score=Math.max(s.score,Math.floor((START_Y-s.maxH)/10));
const cloudAlpha=Phaser.Math.Clamp((s.score-500)/700,0,1);
const spaceAlpha=Phaser.Math.Clamp((s.score-1400)/900,0,1);
s.bgClouds.setAlpha(cloudAlpha*.9);
s.bgSpace.setAlpha(spaceAlpha);
s.bgMid.setAlpha(1-spaceAlpha*.85);
s.bgFar.setAlpha(1-spaceAlpha*.35);
const phase=Phaser.Math.Clamp((s.score-200)/800,0,1);
const skyTint=Phaser.Display.Color.GetColor(
  Phaser.Math.Linear(255,90,phase),
  Phaser.Math.Linear(180,120,phase),
  Phaser.Math.Linear(110,255,phase)
);
const midTint=Phaser.Display.Color.GetColor(
  Phaser.Math.Linear(255,120,phase),
  Phaser.Math.Linear(140,90,phase),
  Phaser.Math.Linear(160,220,phase)
);
s.bgFar.setTint(skyTint);
s.bgMid.setTint(midTint);
s.bgClouds.setTint(Phaser.Display.Color.GetColor(
  Phaser.Math.Linear(255,150,phase),
  Phaser.Math.Linear(200,170,phase),
  Phaser.Math.Linear(255,255,phase)
));
s.bgSpace.setTint(Phaser.Display.Color.GetColor(
  Phaser.Math.Linear(255,180,phase),
  Phaser.Math.Linear(255,200,phase),
  Phaser.Math.Linear(255,255,phase)
));

if(p.y<s.nextY+V_H && s.fuel>0){
const spacing=Phaser.Math.Between(200,340)*(1+s.diff*.1);
const y=s.nextY;
const x=Phaser.Math.Between(80,V_W-80);
s.spawnPlat(x,y,Phaser.Math.Between(110,170),false);
if(Math.random()<.6)s.spawnBanana(x,y-50);
if(Math.random()<.35)s.spawnPlat(Phaser.Math.Between(80,V_W-80),y-Phaser.Math.Between(90,140),Phaser.Math.Between(90,130),false);
const catsActive=s.cats.countActive(true);
const catCooldown=t-s.lastCatSpawnTime;
const catBase=s.score>680?0.26:s.score>420?0.2:0.14;
if(catsActive<4&&catCooldown>360&&Math.random()<catBase*s.diff){
s.spawnCat(x+Phaser.Math.Between(-90,90),y-Phaser.Math.Between(20,70),s.getCatBehavior());
s.lastCatSpawnTime=t;
}
const coffeeChance=s.boostTimer>0?0.03:0.1;
if(Math.random()<coffeeChance*s.diff){
const offset=s.fuel<30?Phaser.Math.Between(-140,140):Phaser.Math.Between(-70,70);
s.spawnCoffee(x+offset,y-80);
}
s.nextY-=spacing/Math.max(s.diff*.6+1,1);
}

const cull=cam.scrollY+V_H+120;
[s.plats,s.bananas,s.cats,s.coffees].forEach(grp=>{
grp.children.each(o=>{if(o&&o.active&&o.y>cull){
if(o.haloTween){o.haloTween.remove();o.haloTween=null;}
o.disableBody(true,true);
if(grp===s.coffees)s.clearCoffeeFx(o);
if(grp===s.cats)s.clearCatMotion(o);
}});
});

const fp=Phaser.Math.Clamp(s.fuel/MX_FUEL,0,1);
const fc=fp>.5?0x35f6ff:fp>.25?0xfff06d:0xff3355;
s.hud.clear();
const hb=s.hudBox;
const barX=hb.x+14,barY=hb.y+20,barW=hb.w-28,barH=20;
s.hud.fillStyle(0x03040b,.45).fillRoundedRect(hb.x-4,hb.y-4,hb.w+8,hb.h+8,14);
s.hud.fillStyle(0x0b1022,.82).fillRoundedRect(hb.x,hb.y,hb.w,hb.h,12);
s.hud.fillStyle(0x040b14,.9).fillRoundedRect(barX,barY,barW,barH,10);
s.hud.fillStyle(fc,1).fillRoundedRect(barX,barY,barW*fp,barH,12);
s.hud.lineStyle(2,0xffffff,.25).strokeRoundedRect(barX,barY,barW,barH,12);
s.hud.lineStyle(2,boostActive?0xbdf8ff:0x28324b,.3).strokeRoundedRect(hb.x,hb.y,hb.w,hb.h,12);
s.hud.fillStyle(0xffffff,.08).fillRoundedRect(barX+3,barY+3,Math.max(0,(barW*fp)-8),5,4);
s.bestTxt.setText(`Record ${Math.max(sessionBest,s.score|0)}m`);
s.scoreTxt.setText(`Altura ${s.score}m`);
s.bananaTxt.setText(`Bananas ${s.bananaCount}`);
s.boostTxt.setText(boostActive?`Cafe: ${(s.boostTimer/1000).toFixed(1)}s`:'Cafe: inactivo');
s.boostTxt.setColor(boostActive?'#bdf8ff':'#5c6a78');
s.dashIcon.setColor(s.dashCd<=0&&!grounded?'#ffff00':'#444');
if(s.boostFlashTimer>0){
s.boostFlashTimer=Math.max(0,s.boostFlashTimer-dt);
const ratio=s.boostFlashTimer/600;
s.boostFlash.setAlpha(ratio);
s.boostFlash.setScale(1+.08*(1-ratio));
}else if(s.boostFlash.alpha>0){
s.boostFlash.setAlpha(0);
s.boostFlash.setScale(1);
}

if(!grounded)s.fallTimer+=dt;else s.fallTimer=0;
const worldBottom=cam.scrollY+V_H+60;
const fallingLow=s.fallTimer>FALL_TRIGGER_MS&&s.fuel<MX_FUEL*.2;
const outOfBounds=p.y>worldBottom;
if(!s.over&&s.fuel<=0&&!grounded&&s.fallTimer>FALL_TRIGGER_MS&&p.body.velocity.y>160){
s.triggerGameOver();
return;
}
if(!s.over){
if(fallingLow&&t-s.lastRescue>RESCUE_COOLDOWN){
s.spawnRescue(p.x,Phaser.Math.Clamp(p.y+Phaser.Math.Between(200,260),cam.scrollY+80,cam.scrollY+V_H-60));
s.lastRescue=t;
s.fallTimer=0;
}
if(outOfBounds&&s.fuel<=0&&(t-s.lastRescue>1200)){
s.triggerGameOver();
}
}
}
spawnPlat(x,y,w,rescue){
const plat=this.plats.get(x,y,'plat');
if(!plat)return;
plat.setActive(true).setVisible(true);plat.body.enable=true;
plat.displayWidth=w;plat.displayHeight=24;
plat.clearTint();
plat.body.setSize(w*.9,18).setOffset((140-w*.9)/2,3);
plat.isRescue=!!rescue;
if(rescue){
plat.setTint(0x99fff5);
this.time.delayedCall(4000,()=>{if(plat.active)plat.disableBody(true,true);});
}
}
getCatBehavior(){
if(this.score>600)return Math.random()<.4?'runner':'patrol';
if(this.score>320)return Math.random()<.5?'patrol':'guard';
return 'guard';
}
spawnBanana(x,y){
const b=this.bananas.get(x,y,'banana');
if(!b)return;
b.setActive(true).setVisible(true);b.body.enable=true;
b.setScale(1).setDepth(2);
if(b.haloTween){b.haloTween.remove();}
b.alpha=1;
b.haloTween=this.tweens.add({targets:b,alpha:{from:1,to:.75},duration:600,yoyo:true,repeat:-1});
}
spawnCat(x,y,behavior='guard'){
if(behavior!=='runner'&&y-this.lastCatY<130)return;
const c=this.cats.get(x,y,'gato');
if(!c)return;
if(c.moveTween){c.moveTween.stop();c.moveTween=null;}
if(c.trailTimer){c.trailTimer.remove();c.trailTimer=null;}
if(c.warning&&c.warning.destroy){c.warning.destroy();c.warning=null;}
const dir=Math.random()<.5?-1:1;
const clampX=Phaser.Math.Clamp(x,60,V_W-60);
const catY=y-18;
const warnColor=behavior==='runner'?0xff2250:behavior==='patrol'?0xff8800:0xff4ff0;
const warning=this.add.circle(clampX,catY,18,warnColor,0).setDepth(5);
warning.setStrokeStyle(3,warnColor,.85);
this.tweens.add({targets:warning,radius:32,alpha:{from:.8,to:0},duration:300,ease:'Sine.Out',onComplete:()=>warning.destroy()});
c.warning=warning;
const tints={guard:0xff4ff0,patrol:0xff9800,runner:0xff2250};
this.time.delayedCall(220,()=>{
if(!warning.scene||this.over)return;
c.enableBody(true,clampX,catY,true,true);
const baseScale=behavior==='runner'?1.1:.9;
c.setScale(baseScale).setDepth(4).setTint(tints[behavior]||0xff4ff0);
c.body.setAllowGravity(false);
c.body.setSize(22,18).setOffset(7,9);
c.body.setVelocity(0);
c.body.setBounce(0,0);
c.body.setCollideWorldBounds(false);
if(behavior==='runner'){
const start=dir<0?V_W-70:70;
const end=dir<0?70:V_W-70;
c.setX(start);
c.moveTween=this.tweens.add({targets:c,x:end,duration:Phaser.Math.Between(1500,1900),yoyo:true,repeat:-1,ease:'Linear'});
}else if(behavior==='patrol'){
const left=Phaser.Math.Clamp(clampX-90,60,V_W-60);
const right=Phaser.Math.Clamp(clampX+90,60,V_W-60);
const start=dir<0?right:left;
const end=dir<0?left:right;
c.setX(start);
c.moveTween=this.tweens.add({targets:c,x:end,duration:Phaser.Math.Between(1100,1400),yoyo:true,repeat:-1,ease:'Linear'});
}else{
const left=Phaser.Math.Clamp(clampX-36,60,V_W-60);
const right=Phaser.Math.Clamp(clampX+36,60,V_W-60);
c.setX(clampX);
c.moveTween=this.tweens.add({targets:c,x:{from:left,to:right},duration:1000,yoyo:true,repeat:-1,ease:'Sine.InOut'});
}
this.lastCatY=y;
});
}
spawnCoffee(x,y){
const cup=this.coffees.get(x,y,'coffee');
if(!cup)return;
cup.setActive(true).setVisible(true);cup.body.enable=true;
cup.setDepth(2);cup.body.setAllowGravity(false);
this.clearCoffeeFx(cup);
cup.setAlpha(.95);cup.setAngle(0);
cup.body.setSize(18,14).setOffset(7,14);
cup.swingTween=this.tweens.add({targets:cup,angle:{from:-4,to:4},duration:820,yoyo:true,repeat:-1,ease:'Sine.InOut'});
cup.vaporTimer=this.time.addEvent({delay:460,loop:true,callback:()=>{
if(!cup.active)return;
const puff=this.add.circle(cup.x+Phaser.Math.Between(-3,3),cup.y-18,Phaser.Math.Between(2,4),0xffffff,.45).setDepth(3);
this.tweens.add({targets:puff,y:puff.y-20,alpha:0,scale:.25,duration:560,ease:'Sine.Out',onComplete:()=>puff.destroy()});
},callbackScope:this});
}
collectB(_player,b){
if(!b.active)return;
if(b.haloTween){b.haloTween.remove();b.haloTween=null;}
b.disableBody(true,true);
this.fuel=MX_FUEL;this.score+=15;this.bananaCount++;
this.tweens.add({targets:this.p,scale:1.12,duration:40,ease:'Sine.Out',yoyo:true,repeat:1});
tone(this,660,.05,'triangle',.11);
this.time.delayedCall(55,()=>tone(this,880,.05,'triangle',.11));
this.time.delayedCall(110,()=>tone(this,990,.05,'triangle',.11));
this.cameras.main.flash(80,255,255,200);
}
hitC(_player,c){
if(!c.active)return;
c.scene.clearCatMotion(c);
c.disableBody(true,true);
const penalty=this.boostTimer>0?15:25;
this.fuel=Math.max(0,this.fuel-penalty);
const dmgTxt=this.add.text(c.x,c.y-20,`-${penalty}`,{fontFamily:'monospace',fontSize:'20px',color:'#ff5555'}).setOrigin(.5).setDepth(6);
this.tweens.add({targets:dmgTxt,y:dmgTxt.y-30,alpha:0,duration:600,ease:'Sine.Out',onComplete:()=>dmgTxt.destroy()});
tone(this,150,.25,'sawtooth',.12);
this.cameras.main.shake(140,.012);
this.p.setTint(0xff3355);
this.time.delayedCall(130,()=>this.p.clearTint());
}
collectCoffee(_player,cup){
if(!cup.active)return;
this.clearCoffeeFx(cup);
cup.disableBody(true,true);
this.boostTimer=COFFEE_DURATION;
this.fuel=Math.min(MX_FUEL,this.fuel+MX_FUEL*.35);
tone(this,720,.2,'triangle',.18);
for(let i=0;i<2;i++){
const wave=this.add.circle(this.p.x,this.p.y,12,0xffffff,0).setDepth(2);
wave.setStrokeStyle(2,0xfff2c9,.8);
this.tweens.add({targets:wave,props:{radius:{from:12,to:80},alpha:{from:.8,to:0}},duration:220,delay:i*50,onComplete:()=>wave.destroy()});
}
this.boostFlashTimer=600;
this.boostFlash.setAlpha(1);
}
clearCoffeeFx(cup){
if(!cup)return;
if(cup.vaporTimer){cup.vaporTimer.remove();cup.vaporTimer=null;}
if(cup.swingTween){cup.swingTween.remove();cup.swingTween=null;}
cup.setAngle(0);
}
clearCatMotion(cat){
if(!cat)return;
if(cat.moveTween){cat.moveTween.stop();cat.moveTween=null;}
if(cat.trailTimer){cat.trailTimer.remove();cat.trailTimer=null;}
if(cat.warning&&cat.warning.destroy){cat.warning.destroy();cat.warning=null;}
cat.setScale(1);
}
emitDust(x,y){
for(let i=0;i<5;i++){
const dust=this.add.circle(x+Phaser.Math.Between(-12,12),y+Phaser.Math.Between(-4,4),Phaser.Math.Between(2,4),0xffffff,.5).setDepth(1);
this.tweens.add({targets:dust,alpha:{from:.5,to:0},y:dust.y+Phaser.Math.Between(-8,12),scale:{from:1,to:0},duration:180,onComplete:()=>dust.destroy()});
}
}
spawnRescue(x,y){
const wx=Phaser.Math.Clamp(x,140,V_W-140);
this.spawnPlat(wx,y,220,true);
}
triggerGameOver(){
if(this.over)return;
this.over=true;
sessionBest=Math.max(sessionBest,this.score|0);
tone(this,180,.5,'sawtooth',.12);
this.cameras.main.shake(250,.02);
this.time.delayedCall(280,()=>this.scene.start('GameOverScene',{score:this.score|0,bananas:this.bananaCount,best:sessionBest}));
}
}

class GameOverScene extends Phaser.Scene{
constructor(){super('GameOverScene');}
init(d){this.sc=d?.score||0;this.ban=d?.bananas||0;this.best=d?.best||0;}
create(){
createAllTextures(this);
this.bgSpace=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_space').setScrollFactor(0).setAlpha(.22);
this.bgClouds=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_clouds').setScrollFactor(0).setAlpha(.18);
this.bgFar=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_far');
this.bgMid=this.add.tileSprite(V_W/2,V_H/2,V_W,V_H,'bg_mid');
this.add.graphics().fillStyle(0x0a0515,.75).fillRect(0,0,V_W,V_H);
this.add.text(V_W/2,V_H*.32,'COMBUSTIBLE\nAGOTADO',{
fontFamily:'monospace',fontSize:'52px',color:'#ff3355',align:'center',stroke:'#35f6ff',strokeThickness:5
}).setOrigin(.5);
this.add.text(V_W/2,V_H*.5,`Altura Maxima: ${this.sc}m`,{
fontFamily:'monospace',fontSize:'30px',color:'#35f6ff'
}).setOrigin(.5);
this.add.text(V_W/2,V_H*.57,`Bananas recolectadas: ${this.ban}`,{
fontFamily:'monospace',fontSize:'22px',color:'#fff06d'
}).setOrigin(.5);
if(this.sc>=this.best){
this.add.text(V_W/2,V_H*.63,'Nuevo record de sesion',{
  fontFamily:'monospace',fontSize:'20px',color:'#ffef8a'
}).setOrigin(.5);
}else{
this.add.text(V_W/2,V_H*.63,`Record vigente: ${this.best}m`,{
  fontFamily:'monospace',fontSize:'20px',color:'#ffef8a'
}).setOrigin(.5);
}
const prompt=this.add.text(V_W/2,V_H*.72,'Presiona START1 (Enter o R) para reintentar',{
fontFamily:'monospace',fontSize:'22px',color:'#ffff00'
}).setOrigin(.5);
this.tweens.add({targets:prompt,alpha:{from:1,to:.3},duration:600,yoyo:true,repeat:-1});
bindKeys(this);
}
update(){
this.bgSpace.tilePositionY+=.18;
this.bgClouds.tilePositionY+=.26;
this.bgFar.tilePositionY+=.25;
this.bgMid.tilePositionY+=.4;
if(justPressed(this,'START1')){tone(this,440,.1,'triangle',.1);this.scene.start('GameScene');}
}
}

new Phaser.Game({
type:Phaser.AUTO,width:V_W,height:V_H,parent:'game',backgroundColor:'#0a0515',
physics:{default:'arcade',arcade:{gravity:{y:GRAV},debug:false}},
scene:[BootScene,TitleScene,GameScene,GameOverScene]
});
