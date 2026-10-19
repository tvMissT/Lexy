'use strict';
const WORDS=[
 {word:'dirty',letter:'D'},{word:'desk',letter:'D'},{word:'drum',letter:'D'},{word:'duck',letter:'D'},
 {word:'egg',letter:'E'},{word:'elephant',letter:'E'},
 {word:'fast',letter:'F'},{word:'farm',letter:'F'},{word:'fork',letter:'F'},{word:'floor',letter:'F'}
];
const LESSON=['D','d','E','e','F','f'];
const $=id=>document.getElementById(id);
const show=(id,on)=>$(id).classList.toggle('hidden',!on);
const asset=p=>window.EMBEDDED_ASSETS?.[p]||p;
const pts=p=>p.map(q=>q.join(',')).join(' ');
let phase='welcome',lesson=0,order=[],round=0,lower=false,letter='D',stroke=0;
let tracker=null,completed=[],busy=false,pointer=null,last=null;
let sound=null,soundResolve=null,soundToken=0,timer=null,run=0,imageToken=0,lastFirst=null,bubbleTimer=null,ctx=null;
function stopSound(){soundToken++;if(sound){sound.onended=sound.onerror=null;sound.pause();sound=null}if(soundResolve){soundResolve(false);soundResolve=null}}
function play(file){
 stopSound();const t=soundToken;
 return new Promise(resolve=>{
  const a=new Audio(asset('audio/'+file));sound=a;soundResolve=resolve;a.preload='auto';a.setAttribute('playsinline','');
  const finish=ok=>{if(t!==soundToken)return;a.onended=a.onerror=null;sound=null;soundResolve=null;resolve(ok)};
  a.onended=()=>finish(true);a.onerror=()=>finish(false);a.play().catch(()=>finish(false));
 });
}
function currentWord(){return order[round]}
function progress(){
 const n=phase==='learn'?lesson:6+round*2+(lower?1:0);
 $('counter').textContent=phase==='learn'?(lesson+1)+' / 6':(round+1)+' / '+WORDS.length;
 $('progress').style.width=n/(6+WORDS.length*2)*100+'%';
}
function updateStroke(){
 const p=PATHS[letter][stroke];tracker=new TraceProgress(p);last=null;pointer=null;
 $('dot').setAttribute('cx',p[0][0]);$('dot').setAttribute('cy',p[0][1]);$('dot').style.display='';
 $('direction').setAttribute('d','M'+p[0].join(' ')+' L'+p[Math.min(14,p.length-1)].join(' '));
}
function renderInk(){const all=completed.concat(tracker?[tracker.points.slice(0,tracker.index+1)]:[]);$('inks').innerHTML=all.map(p=>'<polyline class="ink" points="'+pts(p)+'"/>').join('')}
function trace(ch){
 letter=ch;stroke=0;completed=[];busy=false;pointer=null;
 show('choices',false);show('board',true);show('reset',true);
 $('instruction').textContent='Trace the letter.';$('status').textContent='';
 $('guides').innerHTML=PATHS[ch].map(p=>'<polyline class="guide" points="'+pts(p)+'"/><polyline class="dash" points="'+pts(p)+'"/>').join('');
 updateStroke();renderInk();$('canvas').setAttribute('aria-label','Trace '+ch+' starting at the green dot');
}
function clearBubbles(){clearInterval(bubbleTimer);bubbleTimer=null;$('bubbles').replaceChildren()}
function start(){
 run++;imageToken++;clearTimeout(timer);clearBubbles();stopSound();phase='learn';lesson=0;round=0;lower=false;
 order=shuffle(WORDS);if(order[0].word===lastFirst)order.push(order.shift());lastFirst=order[0].word;
 show('welcome',false);show('finish',false);show('game',true);show('listen',false);show('picture',false);
 trace('D');progress();
}
function choiceButtons(disabled){$('choices').querySelectorAll('button').forEach(b=>b.disabled=disabled)}
async function listen(){
 if(phase!=='quiz'||busy)return;
 const active=run,w=currentWord();const ok=await play(w.word+'.mp3');
 if(active!==run||phase!=='quiz'||currentWord()!==w)return;
 if(!ok)$('status').textContent='Tap Listen to hear the word.';else $('status').textContent='';
}
async function quiz(){
 stopSound();const active=run,it=++imageToken,w=currentWord();phase='quiz';lower=false;busy=true;
 show('board',false);show('reset',false);show('listen',true);$('listen').disabled=true;
 show('picture',true);$('picture').style.visibility='hidden';show('choices',true);
 $('instruction').textContent='Listen. Choose the letter.';$('status').textContent='';$('choices').replaceChildren();
 shuffle(['D','E','F']).forEach(ch=>{
  const b=document.createElement('button');b.textContent=ch+ch.toLowerCase();b.disabled=true;b.setAttribute('aria-label','Choose '+ch+' '+ch.toLowerCase());
  b.onclick=async()=>{
   if(busy||phase!=='quiz')return;busy=true;choiceButtons(true);const active=run;
   if(ch!==currentWord().letter){
    b.classList.add('wrong');await play('retry.mp3');if(active!==run)return;
    b.classList.remove('wrong');busy=false;choiceButtons(false);listen();
   }else{
    b.classList.add('good');await play('correct.mp3');if(active!==run)return;trace(ch);
   }
  };$('choices').append(b);
 });
 progress();
 const loader=new Image();
 const valid=()=>active===run&&it===imageToken&&phase==='quiz'&&currentWord()===w;
 loader.onerror=()=>{if(!valid())return;$('status').textContent='Tap Listen to try again.';$('listen').disabled=false;busy=false};
 loader.onload=async()=>{
  if(!valid())return;$('picture').src=loader.src;
  try{if($('picture').decode)await $('picture').decode()}catch(e){loader.onerror();return}
  if(!valid())return;$('picture').style.visibility='visible';
  const ok=await play(w.word+'.mp3');if(!valid())return;
  busy=false;$('listen').disabled=false;choiceButtons(false);
  if(!ok)$('status').textContent='Tap Listen to hear the word.';
 };
 loader.src=asset('assets/items/'+w.word+'.png');
}
function nextLetter(){
 const active=run;busy=true;pointer=null;play('correct.mp3');
 timer=setTimeout(()=>{
  if(active!==run)return;
  if(phase==='learn'){lesson++;if(lesson<LESSON.length){trace(LESSON[lesson]);progress()}else{round=0;quiz()}}
  else if(!lower){lower=true;trace(currentWord().letter.toLowerCase());progress()}
  else{round++;if(round<order.length)quiz();else finish()}
 },650);
}
function star(p){const e=document.createElement('span');e.className='star';e.textContent='★';e.style.left=p[0]/5+'%';e.style.top=p[1]/4+'%';$('board').append(e);setTimeout(()=>e.remove(),850)}
function feed(p){
 if(busy||!tracker)return;const prev=tracker.index,done=tracker.feed(p);
 if(tracker.index>prev){renderInk();if(tracker.index-prev>2)star(p);const q=tracker.points[tracker.index];$('dot').setAttribute('cx',q[0]);$('dot').setAttribute('cy',q[1]);$('direction').setAttribute('d','M'+q.join(' ')+' L'+tracker.points[Math.min(tracker.index+14,tracker.points.length-1)].join(' '))}
 if(done){
  completed.push(tracker.points);tracker=null;renderInk();$('dot').style.display='none';$('direction').setAttribute('d','');stroke++;
  if(stroke<PATHS[letter].length){busy=true;const active=run;timer=setTimeout(()=>{if(active!==run)return;busy=false;updateStroke()},280)}else nextLetter();
 }
}
function point(e){const r=$('canvas').getBoundingClientRect();return [(e.clientX-r.left)*500/r.width,(e.clientY-r.top)*400/r.height]}
function lift(){pointer=null;last=null}
const canvas=$('canvas');
canvas.onpointerdown=e=>{if(busy||!tracker||pointer!==null)return;e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);last=point(e);feed(last)};
canvas.onpointermove=e=>{
 if(e.pointerId!==pointer||busy||!tracker)return;e.preventDefault();const p=point(e),from=last||p;
 const n=Math.max(1,Math.ceil(Math.hypot(p[0]-from[0],p[1]-from[1])/4));
 for(let i=1;i<=n;i++){feed([from[0]+(p[0]-from[0])*i/n,from[1]+(p[1]-from[1])*i/n]);if(busy||!tracker)break}last=p;
};
canvas.onpointerup=lift;canvas.onpointercancel=lift;canvas.onlostpointercapture=lift;
$('reset').onclick=()=>{clearTimeout(timer);stopSound();trace(letter)};
$('start').onclick=start;$('again').onclick=start;
$('listen').onclick=()=>{if($('picture').style.visibility==='hidden')quiz();else listen()};
function pop(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!ctx)ctx=new C();ctx.resume().catch(()=>{});const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(650,t);o.frequency.exponentialRampToValueAtTime(95,t+.09);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.12);o.onended=()=>{o.disconnect();g.disconnect()}}catch(e){}}
function bubble(){
 if(phase!=='finish'||document.hidden)return;
 const b=document.createElement('button');b.className='bubble';b.type='button';b.setAttribute('aria-label','Pop soap bubble');
 const size=60+Math.random()*38;b.style.width=size+'px';b.style.height=size+'px';b.style.left=(4+Math.random()*78)+'vw';b.style.setProperty('--duration',(10+Math.random()*5)+'s');b.style.setProperty('--drift',(-30+Math.random()*60)+'px');
 let popped=false;const burst=e=>{if(popped||phase!=='finish')return;popped=true;e.preventDefault();pop();b.remove()};b.onpointerdown=burst;b.onclick=burst;b.onanimationend=()=>b.remove();$('bubbles').append(b);
}
function finish(){
 phase='finish';busy=true;imageToken++;show('game',false);show('finish',true);$('counter').textContent=WORDS.length+' / '+WORDS.length;$('progress').style.width='100%';
 play('ending.mp3');for(let i=0;i<5;i++)bubble();bubbleTimer=setInterval(bubble,600);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSound();lift()}else if(phase==='quiz'&&$('picture').style.visibility==='hidden')quiz()});
document.querySelector('.lexy').src=asset('assets/lexy.png');
