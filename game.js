const rounds=[
  ['Big bike',true,'Big','/b/','Bike','/b/'],
  ['Big cup',false,'Big','/b/','Cup','/k/'],
  ['Cool car',true,'Cool','/k/','Car','/k/'],
  ['Blue bus',true,'Blue','/b/','Bus','/b/'],
  ['Angry ball',false,'Angry','/æ/','Ball','/b/'],
  ['Cool crayon',true,'Cool','/k/','Crayon','/k/'],
  ['Crazy bus',false,'Crazy','/k/','Bus','/b/'],
  ['Brown ant',false,'Brown','/b/','Ant','/æ/'],
  ['Angry alligator',true,'Angry','/æ/','Alligator','/æ/'],
  ['Blue car',false,'Blue','/b/','Car','/k/']
];
const items=['bike','cup','car','bus','ball','crayon','bus','ant','alligator','car'];
const $=id=>document.getElementById(id);
let voice=$('voice');let index=0,phase='welcome',advanceTimer=null,playToken=0;
let order=rounds.map((_,i)=>i),lastFirst=-1;
function shuffleRounds(){order=rounds.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}if(order[0]===lastFirst){const j=1+Math.floor(Math.random()*(order.length-1));[order[0],order[j]]=[order[j],order[0]]}lastFirst=order[0]}
const cards=rounds.map((r,i)=>Object.freeze({same:r[1],image:`assets/items/${items[i]}.png`,word:items[i],pair:`audio/${String(i+1).padStart(2,'0')}_pair.mp3`,explain:`audio/${String(i+1).padStart(2,'0')}_explain.mp3`}));
const currentCard=()=>cards[order[index]];
const filename=kind=>currentCard()[kind];
const audioAsset=path=>path;
function play(path,after){
 const token=++playToken;
 voice.onended=null;voice.onerror=null;voice.pause();
 const nextVoice=new Audio();nextVoice.preload='auto';nextVoice.setAttribute('playsinline','');voice=nextVoice;
 const complete=()=>{if(token!==playToken)return;nextVoice.onended=null;nextVoice.onerror=null;if(after)after()};
 nextVoice.onended=complete;
 nextVoice.onerror=()=>{if(token===playToken)icon('🔊','Tap to listen again')};
 nextVoice.src=audioAsset(path);nextVoice.load();
 nextVoice.play().catch(()=>{if(token===playToken)icon('🔊','Tap to listen again')});
}
function icon(symbol,meaning){$('response').innerHTML=`<span aria-hidden="true">${symbol}</span><span class="sr-only">${meaning}</span>`;}
function render(){
  $('counter').textContent=`${String(index+1).padStart(2,'0')} / 10`;
  $('progress').innerHTML=rounds.map((_,i)=>`<i class="${i<index?'done':i===index?'current':''}"></i>`).join('');
  $('item').src=currentCard().image;
  $('item').alt=currentCard().word;
  $('tick').disabled=$('cross').disabled=phase!=='question';
  $('tick').classList.remove('chosen');$('cross').classList.remove('chosen');
  $('next').classList.toggle('hidden',phase!=='feedback');
  $('response').className='response';
  if(phase==='question')$('response').textContent='';
}
function beginRound(){phase='speaking';render();const card=currentCard();play(card.pair,()=>{phase='question';render()})}
function scheduleAdvance(){clearTimeout(advanceTimer);if(phase==='feedback'&&!document.hidden)advanceTimer=setTimeout(advance,900)}
function advance(){if(phase!=='feedback')return;clearTimeout(advanceTimer);if(index===9){finishGame();return}index++;beginRound()}
function finishFeedback(){
  phase='feedback';render();$('response').classList.add('good');icon('✦','Correct answer');
  $('next').setAttribute('aria-label',index===9?'Play again':'Next sound');scheduleAdvance();
}
function answer(same){
  if(phase!=='question')return;
  const card=currentCard();
  if(same!==card.same){
    phase='retry';render();$('response').classList.add('wrong');
    icon('↻','Try again. Listen again.');
    play('audio/retry.mp3',()=>setTimeout(beginRound,350));
    return;
  }
  phase='explaining';render();
  $(same?'tick':'cross').classList.add('chosen');
  $('response').classList.add('good');
  icon('✦','Correct answer');
  play('audio/correct.mp3',()=>play(card.explain,finishFeedback));
}
$('start').addEventListener('click',()=>{shuffleRounds();$('welcome').classList.add('hidden');phase='intro';render();play('audio/intro.mp3',beginRound)});
$('replay').addEventListener('click',()=>{if(phase==='intro'){play('audio/intro.mp3',beginRound);return}if(phase==='question'||phase==='speaking')beginRound();});
$('tick').addEventListener('click',()=>answer(true));
$('cross').addEventListener('click',()=>answer(false));
$('next').addEventListener('click',advance);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(advanceTimer);else scheduleAdvance()});

let popContext=null;
const rewardColours=['#c394ee','#f2a0c6','#7dcddd','#f0c36b','#a3d4a0'];
function popSound(){
 try{const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return;if(!popContext)popContext=new AudioCtor();popContext.resume().catch(()=>{});const t=popContext.currentTime,o=popContext.createOscillator(),g=popContext.createGain();o.type='sine';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(100,t+.085);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);o.connect(g);g.connect(popContext.destination);o.start(t);o.stop(t+.11);o.onended=()=>{o.disconnect();g.disconnect()}}catch(_){}
}
function makeBalloons(){
 const host=$('balloons');host.replaceChildren();
 const scene=document.querySelector('.reward-scene');const w=scene.clientWidth||360,h=scene.clientHeight||420,positions=[];
 function spot(){let best=null,bestDistance=-1;for(let attempt=0;attempt<100;attempt++){const q={x:44+Math.random()*Math.max(1,w-88),y:8+Math.random()*Math.max(1,h-260)};const distance=positions.length?Math.min(...positions.map(t=>Math.hypot((q.x-t.x)/75,(q.y-t.y)/100))):10;if(distance>bestDistance){best=q;bestDistance=distance}if(distance>1.05)break}positions.push(best);return best}

 for(let i=0;i<10;i++){
  const b=document.createElement('button');b.type='button';b.className='balloon';b.setAttribute('aria-label','Pop balloon '+(i+1));const q=spot();b.style.setProperty('--delay',(Math.random()*.8)+'s');b.style.setProperty('--x',q.x+'px');b.style.setProperty('--y',q.y+'px');b.style.setProperty('--size',(52+Math.random()*Math.min(30,w/5-52))+'px');b.style.setProperty('--rise',(2.3+Math.random()*1.6)+'s');b.style.setProperty('--hover',(2+Math.random()*2)+'s');b.style.setProperty('--tilt',(-10+Math.random()*20)+'deg');
  const colour=rewardColours[i%rewardColours.length];
  b.innerHTML=`<svg viewBox="0 0 90 120" aria-hidden="true"><defs><radialGradient id="balloon-g-${i}" cx="32%" cy="25%" r="80%"><stop stop-color="#fff" stop-opacity=".65"/><stop offset=".45" stop-color="${colour}"/><stop offset="1" stop-color="${colour}"/></radialGradient></defs><ellipse cx="45" cy="48" rx="35" ry="44" fill="url(#balloon-g-${i})"/><path d="M45 91l-6 10h12z" fill="${colour}"/><ellipse cx="29" cy="29" rx="7" ry="13" fill="#fff" opacity=".42" transform="rotate(25 29 29)"/></svg>`;
  b.addEventListener('click',()=>{
   if(b.disabled||phase!=='finish')return;b.disabled=true;b.classList.add('popped');b.setAttribute('aria-label','Balloon popped');popSound();
   for(let j=0;j<10;j++){const spark=document.createElement('span');spark.className='pop-spark';spark.setAttribute('aria-hidden','true');const angle=j*Math.PI/5;spark.style.setProperty('--dx',Math.cos(angle)*58+'px');spark.style.setProperty('--dy',Math.sin(angle)*58+'px');spark.style.setProperty('--spark',rewardColours[j%5]);spark.addEventListener('animationend',()=>spark.remove(),{once:true});b.appendChild(spark)}

  });host.appendChild(b);
 }
}

function fanfare(){try{const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return;if(!popContext)popContext=new AudioCtor();popContext.resume().catch(()=>{});const ctx=popContext,t=ctx.currentTime;[[0,261.63,.16],[.18,329.63,.16],[.36,392,.16],[.56,523.25,.5]].forEach(([start,freq,duration])=>{[1,1.5].forEach(mult=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=freq*mult;g.gain.setValueAtTime(0,t+start);g.gain.linearRampToValueAtTime(.045,t+start+.02);g.gain.setValueAtTime(.045,t+start+duration-.04);g.gain.linearRampToValueAtTime(0,t+start+duration);o.connect(g);g.connect(ctx.destination);o.start(t+start);o.stop(t+start+duration);o.onended=()=>{o.disconnect();g.disconnect()}})})}catch(_){}}
function partyConfetti(){const host=$('finish-confetti');host.replaceChildren();for(let i=0;i<36;i++){const piece=document.createElement('span');piece.className='finish-confetti-piece';piece.setAttribute('aria-hidden','true');piece.style.setProperty('--colour',rewardColours[i%5]);piece.style.setProperty('--left',(10+Math.random()*80)+'%');piece.style.setProperty('--travel',(-140+Math.random()*280)+'px');piece.style.setProperty('--fall',(180+Math.random()*180)+'px');piece.style.setProperty('--wait',(Math.random()*.45)+'s');piece.addEventListener('animationend',()=>piece.remove(),{once:true});host.appendChild(piece)}}
function finishGame(){clearTimeout(advanceTimer);phase='finish';$('tick').disabled=$('cross').disabled=true;$('next').classList.add('hidden');$('finish').classList.remove('hidden');makeBalloons();partyConfetti();fanfare();play('audio/ending.mp3');$('play-again').focus({preventScroll:true})}
$('play-again').addEventListener('click',()=>{if(phase!=='finish')return;clearTimeout(advanceTimer);++playToken;voice.onended=null;voice.pause();$('balloons').replaceChildren();$('finish-confetti').replaceChildren();$('finish').classList.add('hidden');index=0;shuffleRounds();phase='intro';render();play('audio/intro.mp3',beginRound)});

render();
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
