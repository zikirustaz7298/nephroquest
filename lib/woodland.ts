import { WORLD, WALLS, ZONES } from './ward';
// Original procedural illustration. Furniture footprints match the collision map.
export function drawWoodland(ctx:CanvasRenderingContext2D,t:number,state:{severity:number}) {
 const {w,h}=WORLD;
 const round=(x:number,y:number,w:number,h:number,r:number,fill:string)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
 const dot=(x:number,y:number,r:number,fill:string)=>{ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const label=(s:string,x:number,y:number)=>{ctx.font='bold 15px Georgia';ctx.fillStyle='#f8efd1';ctx.textAlign='center';ctx.fillText(s,x,y);ctx.textAlign='left';};
 const floor=ctx.createLinearGradient(0,0,w,h);floor.addColorStop(0,'#cbd2a6');floor.addColorStop(1,'#91af83');ctx.fillStyle=floor;ctx.fillRect(0,0,w,h);
 // Quiet flagstone path, fern borders, little flowers.
 round(295,28,362,565,70,'#d7cda6');round(30,290,890,135,60,'#d7cda6');
 for(let i=0;i<60;i++){const x=30+(i*137)%900,y=25+(i*79)%590;ctx.strokeStyle='#879a6e55';ctx.beginPath();ctx.ellipse(x,y,18,8,i,0,Math.PI*2);ctx.stroke();}
 for(let i=0;i<32;i++){const x=22+(i*83)%920,y=i%2?30:612;dot(x,y,22,'#54794e');dot(x-7,y-8,13,'#73905b');dot(x+10,y+2,4,i%3?'#eadc99':'#e5b3a1');}
 WALLS.forEach(a=>round(a.x,a.y,a.w,a.h,5,'#4c6547'));
 // Central herb table.
 round(405,243,150,50,8,'#987a48');for(let i=0;i<5;i++){round(416+i*26,261,18,22,3,'#b98e55');dot(425+i*26,258,11,'#46734d');dot(425+i*26,250,7,'#739852');}label('The herbarium',480,328);
 // Patient alcove.
 const b=ZONES[0];round(b.x,b.y,b.w,b.h,18,'#567950');round(77,110,175,113,12,'#947648');round(86,117,156,94,10,'#f2ead0');round(90,128,44,67,8,'#fff9e8');dot(117,158+Math.sin(t/700),18,'#c39164');round(137,128,99, 70,8,'#b4bd86');
 ctx.strokeStyle='#819561';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(143+i*24,133);ctx.lineTo(143+i*24,190);ctx.stroke();}label('Patient · listen',170,86);
 // Lantern signals are explicitly game state, not a simulated vital sign.
 dot(257,101,9,state.severity>.66?'#df8c6c':'#efca70');
 // Investigation bench and glass bottles.
 round(700,60,220,150,16,'#577a5c');round(715,114,190,51,8,'#a78250');label('Investigations',810,87);
 ['#d9ad74','#93c6b5','#dab0a8','#b9c67b','#d5c17d'].forEach((c,i)=>{round(733+i*33,108,17,34,5,c);round(738+i*33,100,7,10,2,'#f1e9cc');});label('Gather your clues',810,193);
 // Journal desk, open book and feather.
 round(700,430,220,150,16,'#69805a');round(718,478,184,69,8,'#987847');round(748,489,59,43,3,'#f8edc9');round(809,489,59,43,3,'#f2e4b9');ctx.strokeStyle='#b19b69';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(756,498+i*7);ctx.lineTo(799,498+i*7);ctx.moveTo(817,498+i*7);ctx.lineTo(859,498+i*7);ctx.stroke();}label('Journal · decide',810,457);
 // Mentor in a moss cloak, under a small canopy.
 round(60,470,110,110,18,'#42694f');dot(115,511,16,'#c69a77');ctx.fillStyle='#d6c8a0';ctx.beginPath();ctx.moveTo(87,563);ctx.lineTo(104,529);ctx.lineTo(126,529);ctx.lineTo(143,563);ctx.closePath();ctx.fill();dot(115,501,16,'#ddd9c2');dot(115,512,12,'#c69a77');label('Mentor',115,492);
 round(420,560,120,70,12,'#987c50');label('Homeward',480,598);
 // Light drifting seeds, deterministic and frozen under reduced motion.
 for(let i=0;i<12;i++){const x=310+(i*59)%350,y=50+(i*97+t/70)%480;dot(x,y,2,'#fff2bb');}
}

