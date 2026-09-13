const KEY="neetos_v22";
const OLD="neetos_v21";
let state=load();

function load(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||"null");
    if(s) return s;
    const old=JSON.parse(localStorage.getItem(OLD)||"null");
    return {mocks:[],nextMock:"",syllabus:old?.syllabus||[],theme:old?.theme||"light"};
  }catch(e){return {mocks:[],nextMock:"",syllabus:[],theme:"light"}}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function showTab(id){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));
 document.getElementById(id).classList.add("active"); render();
}
function scrollToForm(){setTimeout(()=>document.getElementById("mockFormCard")?.scrollIntoView({behavior:"smooth"}),80)}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

function num(id){return Number(document.getElementById(id).value||0)}
function updatePreview(){
 const total=num("mPhy")+num("mChem")+num("mBio"), c=num("mCorrect"),w=num("mWrong"),a=c+w;
 document.getElementById("formTotal").textContent=total;
 document.getElementById("formAcc").textContent=a?((c/a)*100).toFixed(1)+"%":"—";
}
["mPhy","mChem","mBio","mCorrect","mWrong","mUnattempted"].forEach(id=>document.getElementById(id).addEventListener("input",updatePreview));

function addMock(){
 const name=document.getElementById("mName").value.trim()||`Mock ${state.mocks.length+1}`;
 const date=document.getElementById("mDate").value||new Date().toISOString().slice(0,10);
 const phy=num("mPhy"),chem=num("mChem"),bio=num("mBio"),correct=num("mCorrect"),wrong=num("mWrong"),un=num("mUnattempted");
 if(phy>180||chem>180||bio>360||phy<0||chem<0||bio<0){alert("Subject marks limit check karo.");return}
 if(correct+wrong+un>180){alert("Correct + Wrong + Unattempted 180 se zyada nahi ho sakta.");return}
 state.mocks.push({id:Date.now(),name,date,phy,chem,bio,correct,wrong,un,mistake:document.getElementById("mMistake").value,weak:document.getElementById("mWeak").value.trim()});
 save(); document.querySelectorAll("#mockFormCard input").forEach(x=>x.value=""); updatePreview(); render();
 alert("Mock saved! NEETOS ne analysis kar diya.");
}
function total(m){return m.phy+m.chem+m.bio}
function acc(m){const a=m.correct+m.wrong;return a?(m.correct/a*100):null}
function clearMocks(){if(confirm("Saare mock results delete karein?")){state.mocks=[];save();render()}}
function latest(){return state.mocks[state.mocks.length-1]}

function render(){
 document.body.classList.toggle("dark",state.theme==="dark");
 const ms=state.mocks;
 const l=latest();
 document.getElementById("latestScore").textContent=l?total(l):"—";
 document.getElementById("bestScore").textContent=ms.length?Math.max(...ms.map(total)):"—";
 document.getElementById("mockCount").textContent=ms.length;
 document.getElementById("accuracy").textContent=l&&acc(l)!=null?acc(l).toFixed(1)+"%":"—";
 document.getElementById("attemptInfo").textContent=l?`${l.correct+l.wrong} attempted`:"No mock yet";
 document.getElementById("command").textContent=makeCommand();
 renderChart(); renderRecommendation(); renderSubjects(); renderMocks(); renderMistakes(); renderSyllabus(); renderCountdown();
}
function makeCommand(){
 const l=latest(); if(!l)return"Add your first mock to activate Mock Intelligence.";
 const weak=weakSubject(l), topic=l.weak||"your lowest-progress chapter";
 return `Latest ${total(l)}/720 • Focus next on ${weak}. Start with ${topic}.`;
}
function weakSubject(m){
 const arr=[["Physics",m.phy],["Chemistry",m.chem],["Biology",m.bio]];
 return arr.sort((a,b)=>(a[1]/(a[0]=="Biology"?360:180))-(b[1]/(b[0]=="Biology"?360:180)))[0][0];
}
function renderChart(){
 const el=document.getElementById("chart"); const ms=state.mocks;
 if(!ms.length){el.className="chart empty";el.textContent="Add mocks to see your trend.";return}
 el.className="chart";el.innerHTML="";
 ms.slice(-10).forEach(m=>{const w=Math.max(3,total(m)/720*150);el.insertAdjacentHTML("beforeend",`<div class="barwrap"><span class="bartop" style="--h:${w}px">${total(m)}</span><div class="bar" style="height:${w}px"></div><span class="barlabel">${esc(m.name)}</span></div>`)});
 const trend=ms.length>1?total(ms.at(-1))-total(ms.at(-2)):0;
 document.getElementById("trendText").textContent=ms.length>1?(trend>=0?`+${trend}`:`${trend}`)+" vs previous":"";
}
function renderRecommendation(){
 const el=document.getElementById("recommendation"),l=latest();
 if(!l){el.textContent="Mock complete karne ke baad yahan exact next-study recommendation milegi.";return}
 const s=weakSubject(l), t=l.weak?`“${esc(l.weak)}”`:"your lowest-progress chapter";
 const type=l.mistake;
 let action= type==="Conceptual"?"notes + class questions":type==="Calculation"?"10–20 numerical questions":type==="Memory"?"NCERT active recall":type==="Silly"?"timed MCQ practice + error check":"slow reading + question-stem practice";
 el.innerHTML=`<b>Priority #1: ${s}</b><br>Chapter: ${t}<br><br>Because your latest mock shows ${type.toLowerCase()} mistakes, do <b>${action}</b> first. Then revise the chapter and attempt PYQs.`;
}
function renderSubjects(){
 const el=document.getElementById("subjectBars"),l=latest();
 if(!l){el.innerHTML='<div class="emptybox">No mock data yet.</div>';return}
 const data=[["Physics",l.phy,180],["Chemistry",l.chem,180],["Biology",l.bio,360]];
 el.innerHTML=data.map(([n,v,max])=>`<div class="subject"><div class="subjecthead"><b>${n}</b><span>${v}/${max} • ${(v/max*100).toFixed(0)}%</span></div><div class="track"><div class="fill" style="width:${Math.min(100,v/max*100)}%"></div></div></div>`).join("");
}
function renderMocks(){
 const el=document.getElementById("mockList"),ms=[...state.mocks].reverse();
 if(!ms.length){el.innerHTML='<div class="emptybox">No mocks saved yet.</div>';return}
 el.innerHTML=ms.map(m=>`<div class="listitem"><div class="mockrow"><div><b>${esc(m.name)}</b><div class="mini">${esc(m.date)} • ${m.correct+m.wrong} attempted</div></div><div class="score">${total(m)}/720</div></div><div><span class="pill">P ${m.phy}/180</span><span class="pill">C ${m.chem}/180</span><span class="pill">B ${m.bio}/360</span>${acc(m)!=null?`<span class="pill">${acc(m).toFixed(1)}% accuracy</span>`:""}<span class="pill">${esc(m.mistake)}</span>${m.weak?`<span class="pill">${esc(m.weak)}</span>`:""}</div></div>`).join("");
}
function renderMistakes(){
 const types={},topics={}; state.mocks.forEach(m=>{types[m.mistake]=(types[m.mistake]||0)+1;if(m.weak)topics[m.weak]=(topics[m.weak]||0)+1});
 document.getElementById("mistakeTypes").innerHTML=Object.keys(types).length?Object.entries(types).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="subject"><div class="subjecthead"><b>${esc(k)}</b><span>${v} mock(s)</span></div><div class="track"><div class="fill" style="width:${v/state.mocks.length*100}%"></div></div></div>`).join(""):'<div class="emptybox">No mistake data yet.</div>';
 document.getElementById("weakTopics").innerHTML=Object.keys(topics).length?Object.entries(topics).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span class="pill">🔴 ${esc(k)} ×${v}</span>`).join(" "):'<div class="emptybox">Mock add karte waqt weak chapter likho.</div>';
}
function renderSyllabus(){
 const el=document.getElementById("syllabusList"), stats=document.getElementById("syllabusStats"), arr=Array.isArray(state.syllabus)?state.syllabus:[];
 if(!arr.length){stats.innerHTML="";el.innerHTML='<div class="emptybox">V2.1 syllabus data nahi mila. V2.2 mocks phir bhi fully work karega.</div>';return}
 const done=arr.filter(x=>x.progress===100||x.completed).length; stats.innerHTML=`<p><b>${done}/${arr.length}</b> tracked items completed</p>`;
 el.innerHTML=arr.slice(0,60).map(x=>{const p=x.progress??(x.completed?100:0);return `<div class="subject"><div class="subjecthead"><b>${esc(x.name||x.chapter||"Chapter")}</b><span>${p}%</span></div><div class="track"><div class="fill" style="width:${p}%"></div></div></div>`}).join("");
}
function renderCountdown(){
 const input=document.getElementById("nextMockDate"); input.value=state.nextMock||"";
 const el=document.getElementById("countdown");
 if(!state.nextMock){el.textContent="No date set";return}
 const diff=new Date(state.nextMock)-new Date();
 if(diff<=0){el.innerHTML="🔥 Mock time!";return}
 const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),m=Math.floor(diff%3600000/60000);
 el.innerHTML=`${d}d ${h}h ${m}m <small>remaining</small>`;
}
function saveCountdown(){state.nextMock=document.getElementById("nextMockDate").value;save();renderCountdown()}
document.getElementById("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";save();render()};
setInterval(renderCountdown,60000);
render(); updatePreview();
