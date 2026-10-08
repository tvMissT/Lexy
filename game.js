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
const voice=$('voice');let index=0,phase='welcome';
const filename=(kind)=>`audio/${String(index+1).padStart(2,'0')}_${kind}.mp3`;
function play(path,after){voice.pause();voice.onended=after||null;voice.src=path;voice.currentTime=0;voice.play().catch(()=>{$('response').innerHTML='<span aria-hidden="true">🔊</span><span class="sr-only">Tap the speaker to play the sound.</span>';});}
function icon(symbol,meaning){$('response').innerHTML=`<span aria-hidden="true">${symbol}</span><span class="sr-only">${meaning}</span>`;}
function render(){
  $('counter').textContent=`${String(index+1).padStart(2,'0')} / 10`;
  $('progress').innerHTML=rounds.map((_,i)=>`<i class="${i<index?'done':i===index?'current':''}"></i>`).join('');
  $('item').src=`assets/items/${items[index]}.png`;
  $('item').alt=items[index];
  $('tick').disabled=$('cross').disabled=phase!=='question';
  $('tick').classList.remove('chosen');$('cross').classList.remove('chosen');
  $('next').classList.toggle('hidden',phase!=='feedback');
  $('response').className='response';
  if(phase==='question')$('response').textContent='';
}
function beginRound(){phase='question';render();play(filename('pair'));}
function finishFeedback(){
  phase='feedback';render();$('response').classList.add('good');icon('✦','Correct answer');
  $('next').setAttribute('aria-label',index===9?'Play again':'Next sound');
}
function answer(same){
  if(phase!=='question')return;
  const row=rounds[index];
  if(same!==row[1]){
    phase='retry';render();$('response').classList.add('wrong');
    icon('↻','Try again. Listen again.');
    play('audio/retry.mp3',()=>setTimeout(beginRound,350));
    return;
  }
  phase='explaining';render();
  $(same?'tick':'cross').classList.add('chosen');
  $('response').classList.add('good');
  icon('✦','Correct answer');
  play('audio/correct.mp3',()=>play(filename('explain'),finishFeedback));
}
$('start').addEventListener('click',()=>{$('welcome').classList.add('hidden');phase='intro';render();play('audio/intro.mp3',beginRound)});
$('replay').addEventListener('click',()=>{if(phase==='welcome'||phase==='retry'||phase==='explaining')return;play(phase==='intro'?'audio/intro.mp3':filename('pair'),phase==='intro'?beginRound:null)});
$('tick').addEventListener('click',()=>answer(true));
$('cross').addEventListener('click',()=>answer(false));
$('next').addEventListener('click',()=>{if(phase!=='feedback')return;if(index===9){index=0;$('welcome').classList.remove('hidden');phase='welcome';render();return}index++;beginRound()});
render();
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
