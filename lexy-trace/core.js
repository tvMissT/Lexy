const line=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4);return Array.from({length:n+1},(_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n])};
const curve=(a,b,c,d)=>Array.from({length:101},(_,i)=>{const t=i/100,s=1-t;return [s*s*s*a[0]+3*s*s*t*b[0]+3*s*t*t*c[0]+t*t*t*d[0],s*s*s*a[1]+3*s*s*t*b[1]+3*s*t*t*c[1]+t*t*t*d[1]]});
const join=(...p)=>p.flat();
const PATHS={
 A:[line([250,60],[130,340]),line([250,60],[370,340]),line([175,235],[325,235])],
 a:[join(curve([315,185],[245,105],[135,165],[160,255]),curve([160,255],[180,350],[305,340],[315,185])),line([315,155],[315,330])],
 B:[line([165,65],[165,335]),join(curve([165,65],[350,45],[360,205],[165,195]),curve([165,195],[380,165],[380,365],[165,335]))],
 b:[line([170,65],[170,330]),join(curve([170,230],[210,120],[340,145],[335,250]),curve([335,250],[325,335],[240,370],[170,310]))],
 C:[join(curve([350,100],[175,-10],[80,125],[115,240]),curve([115,240],[140,355],[265,390],[350,300]))],
 c:[join(curve([335,175],[225,100],[125,170],[150,255]),curve([150,255],[170,345],[280,370],[335,310]))]
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
