'use strict';
(()=>{
const $=id=>document.getElementById(id), voice=$('voice');
let deck=[],index=0,phase='welcome',run=0,timer=null,playToken=0;
const asset=path=>window.INLINE_ASSETS?.[path]||path;
const guide=document.querySelector('.guide'),answers=document.querySelector('.answers');
function shuffledRounds(){
  let result;
  for(let tries=0;tries<100;tries++){
    result=ROUNDS.map(x=>({...x}));
    for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
    if(!result.some((r,i)=>i>1&&r.letter===result[i-1].letter&&r.letter===result[i-2].letter))return result;
  }
  return ROUNDS.map(x=>({...x}));
}
function stop(){clearTimeout(timer);timer=null;playToken++;voice.onended=null;voice.onerror=null;voice.pause();guide.classList.remove('talking');}
function update(){
  const done=phase==='finish'?30:index;
  $('counter').textContent=`${done===30?30:phase==='welcome'?0:index+1} / 30`;
  $('progressFill').style.width=`${done/30*100}%`;
  document.querySelector('.progress').setAttribute('aria-valuenow',done);
  $('tick').disabled=$('cross').disabled=phase!=='question';
  answers.classList.toggle('ready',phase==='question');
  $('replay').disabled=!['intro','question','speaking','finish'].includes(phase);
}
function play(path,after){
  stop();const token=playToken,currentRun=run;
  guide.classList.add('talking');
  voice.src=asset(path);voice.currentTime=0;
  const complete=()=>{if(token!==playToken||currentRun!==run)return;guide.classList.remove('talking');voice.onended=null;voice.onerror=null;if(after)after();};
  voice.onended=complete;
  voice.onerror=()=>blocked();
  function blocked(){if(token!==playToken)return;guide.classList.remove('talking');$('response').textContent='🔊';$('replay').disabled=false;}
  const attempt=voice.play();if(attempt&&attempt.catch)attempt.catch(blocked);
}
function beginRound(){
  stop();phase='speaking';$('welcome').hidden=true;$('finish').hidden=true;$('round').hidden=false;
  $('next').hidden=true;$('response').textContent='';$('response').className='response';
  $('tick').classList.remove('chosen');$('cross').classList.remove('chosen');
  const row=deck[index];$('letter').textContent=row.letter+row.letter.toLowerCase();$('letter').setAttribute('aria-label',row.letter+row.letter.toLowerCase());
  $('picture').src=asset(row.image);update();
  play(row.audio,()=>{phase='question';update();});
}
function finish(){
  stop();phase='finish';$('round').hidden=true;$('finish').hidden=false;update();play('audio/ending.mp3');
}
function advance(){if(phase!=='feedback')return;stop();index++;if(index>=deck.length)finish();else beginRound();}
function scheduleAdvance(){if(document.hidden)return;const currentRun=run;timer=setTimeout(()=>{if(currentRun===run)advance();},650);}
function answer(value){
  if(phase!=='question')return;
  stop();const correct=value===deck[index].correct;
  phase=correct?'feedbackSound':'retry';update();
  $('response').className=correct?'response good':'response wrong';$('response').textContent=correct?'✦':'↻';
  if(correct){
    $(value?'tick':'cross').classList.add('chosen');
    play('audio/correct.mp3',()=>{phase='feedback';$('next').hidden=false;update();scheduleAdvance();});
  }else{
    play('audio/retry.mp3',()=>{if(document.hidden)return;const currentRun=run;timer=setTimeout(()=>{if(currentRun===run&&!document.hidden)beginRound();},250);});
  }
}
function start(){
  run++;stop();deck=shuffledRounds();index=0;phase='intro';
  $('welcome').hidden=true;$('finish').hidden=true;$('round').hidden=false;
  $('letter').textContent='';$('picture').removeAttribute('src');$('picture').style.visibility='hidden';
  $('response').textContent='';$('next').hidden=true;update();
  play('audio/intro.mp3',()=>{$('picture').style.visibility='';beginRound();});
}
$('start').addEventListener('click',start);$('again').addEventListener('click',start);
$('tick').addEventListener('click',()=>answer(true));$('cross').addEventListener('click',()=>answer(false));$('next').addEventListener('click',advance);
$('replay').addEventListener('click',()=>{
  if(phase==='intro')play('audio/intro.mp3',()=>{$('picture').style.visibility='';beginRound();});
  else if(phase==='finish')play('audio/ending.mp3');
  else if(['speaking','question'].includes(phase)){phase='speaking';$('response').textContent='';update();play(deck[index].audio,()=>{phase='question';update();});}
  else if(phase==='retry')beginRound();
  else if(phase==='feedbackSound'){phase='feedback';$('next').hidden=false;update();scheduleAdvance();}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearTimeout(timer);timer=null;if(!voice.paused){voice.pause();guide.classList.remove('talking');$('replay').disabled=false;}}
  else if(phase==='feedback')scheduleAdvance();
  else if(phase==='retry')beginRound();
});
document.addEventListener('keydown',event=>{if(event.target.tagName==='BUTTON')return;if(event.key==='ArrowRight'&&phase==='feedback')advance();});
document.querySelector('.lexy').src=asset('assets/lexy.png');
update();
if(!window.INLINE_ASSETS&&location.protocol==='https:'&&'serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
