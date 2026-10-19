const line=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4);return Array.from({length:n+1},(_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n])};
const curve=(a,b,c,d)=>Array.from({length:101},(_,i)=>{const t=i/100,s=1-t;return [s*s*s*a[0]+3*s*s*t*b[0]+3*s*t*t*c[0]+t*t*t*d[0],s*s*s*a[1]+3*s*s*t*b[1]+3*s*t*t*c[1]+t*t*t*d[1]]});
const join=(...p)=>p.flat();
const PATHS={
 D:[line([165,65],[165,335]),curve([165,65],[420,50],[420,350],[165,335])],
 d:[join(curve([315,185],[245,100],[130,165],[155,255]),curve([155,255],[180,350],[315,345],[315,185])),line([315,65],[315,335])],
 E:[line([180,65],[180,335]),line([180,65],[340,65]),line([180,195],[310,195]),line([180,335],[340,335])],
 e:[join(line([145,230],[330,230]),curve([330,230],[330,100],[145,100],[145,230]),curve([145,230],[145,345],[275,365],[335,300]))],
 F:[line([180,65],[180,335]),line([180,65],[340,65]),line([180,195],[310,195])],
 f:[join(curve([330,85],[260,0],[190,70],[190,165]),line([190,165],[190,335])),line([125,190],[300,190])]
};
class TraceProgress{
 constructor(points,tolerance=29){this.points=points;this.tolerance=tolerance;this.index=0;this.started=false}
 feed(p){const dist=q=>Math.hypot(p[0]-q[0],p[1]-q[1]);if(!this.started){if(dist(this.points[0])>this.tolerance)return false;this.started=true}
 let best=this.index,delta=dist(this.points[best]);for(let i=this.index+1;i<Math.min(this.index+13,this.points.length);i++){const d=dist(this.points[i]);if(d<delta){best=i;delta=d}}
 if(delta<=this.tolerance)this.index=best;return this.done}
 get done(){return this.started&&this.index>=this.points.length-3}
}
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
if(typeof module!=="undefined")module.exports={PATHS,TraceProgress,shuffle};
