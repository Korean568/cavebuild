# 옛 버전 게임 파일 만들기: git 기록에서 각 버전(v26.N)의 마지막 커밋을 꺼내 versions/v26.N/index.html 로 저장
# 런처에서 옛 버전을 고르면 이 파일로 실행:
#  · 그 버전에 없는 아이템 · 블록은 잠시 숨기고, 숨긴 것은 localStorage 'cb-hidden' 에 적어 둠 (최신 버전이 세계를 합칠 때 되돌림)
#  · 번역은 세계와 상관없으므로 지금의 50개 언어 번역을 옛 버전에도 입힘 (옛 버전 자체 번역은 끔)
import subprocess,os,re,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def git(*a):return subprocess.run(['git',*a],cwd=ROOT,capture_output=True).stdout
log=git('log','--format=%h %s').decode('utf-8','replace').splitlines()
M={}
for line in log: # 최신 커밋부터 → 버전마다 처음 만난 커밋이 그 버전의 마지막 모습
    m=re.match(r'([0-9a-f]+) v26\.(\d+)\b',line)
    if m and not line.split(' ',1)[1].startswith('v26.3.0'):M.setdefault(int(m.group(2)),m.group(1))
EARLY={1:'16e4aa4',2:'a246b69',3:'a246b69',4:'a246b69',5:'7157d38',6:'b1bd90e',7:'56b51e8'} # 버전 번호를 붙이기 전 커밋
for k,v in EARLY.items():M[k]=v
latest=max(M)
cur=open(os.path.join(ROOT,'index.html'),encoding='utf-8').read()
EN=re.search(r'const I18N_EN=(\{.*?\});\n',cur,re.S).group(1)
SHIM=r'''<script>/* 옛 버전 실행기: 이 버전에 없는 아이템 · 블록은 잠시 숨기고 적어 둠 → 최신 버전으로 돌아가면 세계에 다시 합쳐짐 */
(function(){try{if(typeof startWorld!=='function')return;var _sw=startWorld;
startWorld=function(sv,ok){try{if(sv){if(typeof fromPortable==='function')sv=fromPortable(sv);
 var hasI=function(id){try{return id>0&&!!info(id);}catch(e){return false;}},hasB=function(id){return id===0||(typeof BL!=='undefined'&&!!BL[id]);};
 var hid={inv:[],armor:[],md:{},cont:{},seed:sv.seed};
 var fx=function(a,rec){return (a||[]).map(function(s,i){if(s&&!hasI(s.id)){if(rec)rec.push([i,s]);return null;}return s;});};
 sv.inv=fx(sv.inv,hid.inv);if(sv.armor)sv.armor=fx(sv.armor,hid.armor);
 if(sv.md)for(var d in sv.md)for(var k in sv.md[d]){var a=sv.md[d][k];if(a&&a.length)for(var i=1;i<a.length;i+=2)if(!hasB(a[i])){((hid.md[d]=hid.md[d]||{})[k]=hid.md[d][k]||[]).push([a[i-1],a[i]]);a[i]=0;}}
 if(sv.containers)for(var c in sv.containers){var C=sv.containers[c],r=[];if(Array.isArray(C))sv.containers[c]=fx(C,r);else if(C&&Array.isArray(C.slots))C.slots=fx(C.slots,r);if(r.length)hid.cont[c]=r;}
 sv.items=(sv.items||[]).filter(function(it){return it&&it.s&&hasI(it.s.id);});
 try{localStorage.setItem('cb-hidden',JSON.stringify(hid));}catch(e){}}}catch(e){}return _sw(sv,ok);};}catch(e){}})();</script>
'''
I18N=r'''<script>/* 옛 버전 번역기: 지금 고른 언어로 (번역은 세계와 상관없음) */
(function(){var L='en';try{var s=localStorage.getItem('cavebuild-lang');if(s)L=s;}catch(e){}if(L==='ko')return;
var EN=__EN__,D=EN;if(L!=='en'){try{var x=new XMLHttpRequest();x.open('GET','../../lang/'+L+'.json',false);x.send();if(x.status===200){var LD=JSON.parse(x.responseText);D=Object.assign({},EN);for(var q in LD)if(!/^(L:|S:|HELP$)/.test(q))D[q]=LD[q];}}catch(e){}}
var H=/[가-힣]/,C=new Map(),K=null,esc=function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');};
function tr(s){if(!s||!H.test(s))return s;var r=C.get(s);if(r!==undefined)return r;var core=s.trim();
 if(D[core]!==undefined)r=s.replace(core,D[core]);else{if(!K)K=Object.keys(D).sort(function(a,b){return b.length-a.length;});r=s;
  for(var i=0;i<K.length;i++){var k=K[i];if(r.indexOf(k)<0)continue;if(k.length<=2)r=r.replace(new RegExp('(^|[^\\uac00-\\ud7a3])'+esc(k)+'(?=$|[^\\uac00-\\ud7a3])','g'),function(m,p){return p+D[k];});else r=r.split(k).join(D[k]);if(!H.test(r))break;}
  r=r.replace(/([A-Za-z0-9)\]]) ?(을|를|이|가|은|는|으로|로|와|과|의|에|에서)(?=[\s.,!?·)]|$)/g,'$1');}
 if(C.size>5000)C.clear();C.set(s,r);return r;}
function tn(n){if(n.nodeType===3){var v=n.nodeValue;if(v&&H.test(v)){var t=tr(v);if(t!==v)n.nodeValue=t;}return;}
 if(n.nodeType!==1||n.tagName==='SCRIPT'||n.tagName==='STYLE')return;
 ['placeholder','title'].forEach(function(a){if(n.hasAttribute&&n.hasAttribute(a)){var v=n.getAttribute(a);if(H.test(v))n.setAttribute(a,tr(v));}});
 for(var c=n.firstChild;c;c=c.nextSibling)tn(c);}
tn(document.body);new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData')tn(m.target);else m.addedNodes.forEach(tn);});}).observe(document.body,{childList:true,subtree:true,characterData:true});
var oc=window.confirm.bind(window);window.confirm=function(m){return oc(tr(m));};document.documentElement.lang=L;})();</script>
'''.replace('__EN__',EN)
made=[]
for n in sorted(M):
    if n==latest:continue # 최신 버전은 게임 그대로
    html=git('show',M[n]+':index.html').decode('utf-8','replace')
    if '</body>' not in html:continue
    html=html.replace("let LANG=(()=>{","let LANG='ko',LANG_OLD=(()=>{",1) # 옛 버전 자체 번역은 끄고 아래 번역기로
    i=html.rindex('</body>');html=html[:i]+SHIM+I18N+html[i:]
    d=os.path.join(ROOT,'versions',f'v26.{n}');os.makedirs(d,exist_ok=True)
    open(os.path.join(d,'index.html'),'w',encoding='utf-8',newline='\n').write(html)
    made.append(n)
print('latest v26.%d · made %d versions'%(latest,len(made)))
