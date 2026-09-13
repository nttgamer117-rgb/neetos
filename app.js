const KEY="neetos_v3";
let state=loadState();

function loadState(){
 try{
  const v=JSON.parse(localStorage.getItem(KEY)||"null"); if(v)return v;
  const old=JSON.parse(localStorage.getItem("neetos_v22")||"null");
  const old2=JSON.parse(localStorage.getItem("neetos_v21")||"null");
  return {mocks:old?.mocks||[],nextMock:old?.nextMock||"",schedule:[],cloud:{url:"",key:""},theme:old?.theme||"light",syllabus:old?.syllabus||old2?.syllabus||[]};
 }catch(e){return {mocks:[],nextMock:"",schedule:[],cloud:{url:"",key:""},theme:"light",syllabus:[]}}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function showTab(id){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));document.getElementById(id).classList.add("active");render()}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
function num(id){return Number(document.getElementById(id).value||0)}
function total(m){return m.phy+m.chem+m.bio}
function acc(m){let a=m.correct+m.wrong;return a?m.correct/a*100:null}
function latest(){return state.mocks.at(-1)}
function readiness(){
 const l=latest(), mock=state.mocks.length;
 if(!l)return 0;
 let score=total(l)/720*55, consistency=Math.min(20,mock*4), accuracy=(acc(l)||0)/100*15, syllabus=0;
 if(state.syllabus.length) syllabus=state.syllabus.reduce((a,x)=>a+(Number(x.progress)||0),0)/state.syllabus.length/100*10;
 else syllabus=5;
 return Math.round(Math.min(100,score+consistency+accuracy+syllabus));
}
function weakSubject(m){return [["Physics",m.phy/180],["Chemistry",m.chem/180],["Biology",m.bio/360]].sort((a,b)=>a[1]-b[1])[0][0]}
function mentorAnswer(q){
 const l=latest(), ql=q.toLowerCase();
 if(!l)return "Pehle ek mock result save karo. Uske baad main score, accuracy aur weak subject ke basis par exact next step dunga.";
 const weak=weakSubject(l), topic=l.weak||"lowest-progress chapter";
 if(ql.includes("low")||ql.includes("score")) return `Latest score ${total(l)}/720 hai. Sabse pehle ${weak} ko attack karo. Tumhare latest mock ka marked weak topic ${topic} hai. ${l.mistake} mistakes ke liye ${l.mistake==="Memory"?"NCERT active recall":l.mistake==="Calculation"?"15–20 timed numericals":l.mistake==="Conceptual"?"notes + class questions":"timed MCQs + error checking"} karo.`;
 if(ql.includes("revise")) return `Revision order: (1) ${topic}, (2) ${weak} ke notes, (3) class questions/DPP, (4) PYQs, (5) 24–48h baad short recall test. Sirf rereading mat karo—active recall use karo.`;
 if(ql.includes("next mock")||ql.includes("mock")) return `Next mock se pehle ${weak} ke weakest topics ko revise karo, latest mistake type (${l.mistake}) ka error-control rule banao, aur last day par heavy new content avoid karo.`;
 return `Abhi priority: ${weak} → ${topic}. 50 min focused block rakho: 10 min recall + 25 min questions + 15 min error analysis.`;
}
function ask(q){
 q=(q||document.getElementById("question").value).trim();if(!q)return;
 const chat=document.getElementById("chat");chat.insertAdjacentHTML("beforeend",`<div class="bubble user">${esc(q)}</div><div class="bubble bot">${esc(mentorAnswer(q))}</div>`);document.getElementById("question").value="";chat.scrollTop=chat.scrollHeight;
}
document.getElementById("question").addEventListener("keydown",e=>{if(e.key==="Enter")ask()});

function addMock(){
 const m={id:Date.now(),name:document.getElementById("mName").value.trim()||`Mock ${state.mocks.length+1}`,date:document.getElementById("mDate").value||new Date().toISOString().slice(0,10),phy:num("mPhy"),chem:num("mChem"),bio:num("mBio"),correct:num("mCorrect"),wrong:num("mWrong"),un:num("mUnattempted"),mistake:document.getElementById("mMistake").value,weak:document.getElementById("mWeak").value.trim()};
 if(m.phy>180||m.chem>180||m.bio>360||m.correct+m.wrong+m.un>180){alert("Marks/questions limit check karo.");return}
 state.mocks.push(m);save();render();alert("Mock saved. AI Mentor updated.");
}
function updatePreview(){const t=num("mPhy")+num("mChem")+num("mBio"),c=num("mCorrect"),w=num("mWrong");document.getElementById("formTotal").textContent=t;document.getElementById("formAcc").textContent=c+w?(c/(c+w)*100).toFixed(1)+"%":"—"}
["mPhy","mChem","mBio","mCorrect","mWrong","mUnattempted"].forEach(x=>document.getElementById(x).addEventListener("input",updatePreview));
function clearMocks(){if(confirm("Delete all mocks?")){state.mocks=[];save();render()}}
function renderChart(){
 const el=document.getElementById("chart"),ms=state.mocks;if(!ms.length){el.className="chart empty";el.textContent="Add mocks to see trend.";return}
 el.className="chart";el.innerHTML="";ms.slice(-10).forEach(m=>{let h=Math.max(4,total(m)/720*150);el.insertAdjacentHTML("beforeend",`<div class="barwrap"><span class="bartop" style="--h:${h}px">${total(m)}</span><div class="bar" style="height:${h}px"></div><span class="barlabel">${esc(m.name)}</span></div>`)});
}
function renderSubjects(){
 const l=latest(),el=document.getElementById("subjects");if(!l){el.innerHTML="<div class='hint'>No mock yet.</div>";return}
 el.innerHTML=[["Physics",l.phy,180],["Chemistry",l.chem,180],["Biology",l.bio,360]].map(x=>`<div class="subject"><div class="subjecthead"><b>${x[0]}</b><span>${x[1]}/${x[2]} • ${(x[1]/x[2]*100).toFixed(0)}%</span></div><div class="track"><div class="fill" style="width:${x[1]/x[2]*100}%"></div></div></div>`).join("");
}
function renderMocks(){
 const el=document.getElementById("mockList"),ms=[...state.mocks].reverse();if(!ms.length){el.innerHTML="<div class='hint'>No mocks saved.</div>";return}
 el.innerHTML=ms.map(m=>`<div class="listitem"><div class="cardhead"><div><b>${esc(m.name)}</b><div class="mini">${esc(m.date)} • ${m.correct+m.wrong} attempted</div></div><div class="score">${total(m)}/720</div></div><span class="pill">P ${m.phy}</span><span class="pill">C ${m.chem}</span><span class="pill">B ${m.bio}</span><span class="pill">${acc(m)!=null?acc(m).toFixed(1)+"%":"—"} accuracy</span><span class="pill">${esc(m.mistake)}</span>${m.weak?`<span class="pill">🔴 ${esc(m.weak)}</span>`:""}</div>`).join("");
}
function renderSchedule(){
 const el=document.getElementById("scheduleList");if(!state.schedule.length){el.innerHTML="<div class='hint'>No schedule imported yet.</div>";return}
 const today=new Date().toISOString().slice(0,10), items=state.schedule.filter(x=>!x.date||x.date===today);
 el.innerHTML=(items.length?items:state.schedule).slice(0,30).map(x=>`<div class="listitem"><b>${esc(x.subject||"Study")}</b> — ${esc(x.chapter||x.topic||x.title||"Task")} <span class="pill">${esc(x.time||x.date||"")}</span></div>`).join("");
}
document.getElementById("scheduleFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const text=await f.text();let data;if(f.name.toLowerCase().endsWith(".json"))data=JSON.parse(text);else data=parseCSV(text);if(!Array.isArray(data))throw Error("Format");state.schedule=data;save();document.getElementById("importStatus").textContent=`Imported ${data.length} schedule items.`;renderSchedule()}catch(err){document.getElementById("importStatus").textContent="Import failed. CSV/JSON format check karo."}});
function parseCSV(t){const lines=t.trim().split(/\r?\n/);if(lines.length<2)return[];const heads=lines[0].split(",").map(x=>x.trim().toLowerCase());return lines.slice(1).map(line=>{const vals=line.split(",");let o={};heads.forEach((h,i)=>o[h]=vals[i]?.trim()||"");return o})}
function clearSchedule(){state.schedule=[];save();renderSchedule()}
function saveCountdown(){state.nextMock=document.getElementById("nextMockDate").value;save();renderCountdown()}
function renderCountdown(){document.getElementById("nextMockDate").value=state.nextMock||"";const el=document.getElementById("countdown");if(!state.nextMock){el.textContent="No date set";return}const d=new Date(state.nextMock)-new Date();if(d<=0){el.textContent="🔥 Mock time!";return}el.innerHTML=`${Math.floor(d/86400000)}d ${Math.floor(d%86400000/3600000)}h ${Math.floor(d%3600000/60000)}m <small>remaining</small>`}
function saveCloud(){state.cloud={url:document.getElementById("sbUrl").value.trim(),key:document.getElementById("sbKey").value.trim()};save();document.getElementById("cloudStatus").textContent="Cloud settings saved locally. Connection is not active until a Supabase table/auth setup is configured."}
async function testCloud(){const url=document.getElementById("sbUrl").value.trim(),key=document.getElementById("sbKey").value.trim();if(!url||!key){document.getElementById("cloudStatus").textContent="Project URL + anon/publishable key required.";return}try{const r=await fetch(url.replace(/\/$/,"")+"/rest/v1/",{headers:{apikey:key,Authorization:"Bearer "+key}});document.getElementById("cloudStatus").textContent=r.ok?"✅ Supabase endpoint reachable.":"⚠️ Endpoint reachable but key/table configuration needs checking."}catch(e){document.getElementById("cloudStatus").textContent="Could not connect. URL/key check karo."}}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="neetos-v3-backup.json";a.click();URL.revokeObjectURL(a.href)}
document.getElementById("backupFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x||!Array.isArray(x.mocks))throw Error();state={...state,...x};save();render();document.getElementById("backupStatus").textContent="✅ Backup restored."}catch(err){document.getElementById("backupStatus").textContent="❌ Invalid NEETOS backup."}})
document.getElementById("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";save();render()};
function render(){
 document.body.classList.toggle("dark",state.theme==="dark");
 const l=latest(),ms=state.mocks;
 document.getElementById("latestScore").textContent=l?total(l):"—";document.getElementById("bestScore").textContent=ms.length?Math.max(...ms.map(total)):"—";document.getElementById("accuracy").textContent=l&&acc(l)!=null?acc(l).toFixed(1)+"%":"—";document.getElementById("readiness").textContent=readiness();
 document.getElementById("command").textContent=l?`Latest ${total(l)}/720 • Focus on ${weakSubject(l)}.`:"Build your NEETOS command center.";
 document.getElementById("subcommand").textContent=l?`Next priority: ${l.weak||"your weakest chapter"} • ${l.mistake} error pattern`:"Add a mock and NEETOS will start coaching you.";
 document.getElementById("todayPlan").innerHTML=l?`<b>1.</b> ${esc(weakSubject(l))} — ${esc(l.weak||"weakest chapter")}<br><b>2.</b> Fix ${esc(l.mistake.toLowerCase())} mistakes with targeted questions<br><b>3.</b> Finish DPP/PYQ block<br><b>4.</b> 15-min active recall before sleep`:"<b>Start:</b> Add your latest mock → analyse weak subject → make today's 3 priority tasks.";
 renderChart();renderSubjects();renderMocks();renderSchedule();renderCountdown();
 document.getElementById("sbUrl").value=state.cloud?.url||"";document.getElementById("sbKey").value=state.cloud?.key||"";
}
setInterval(renderCountdown,60000);render();updatePreview();
