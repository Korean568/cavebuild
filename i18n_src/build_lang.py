# 번역 결과(i18n_src/out/<언어>.json, id → 번역)를 게임용 언어 파일(lang/<언어>.json, 원래 키 → 번역)로 합침
import json,os,re,sys
D=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(D)
SRC=json.load(open(os.path.join(D,'source_en.json'),encoding='utf-8'))
os.makedirs(os.path.join(ROOT,'lang'),exist_ok=True)
SEP1="',\n  'CB-NM':'";SEP2="',\n  'CB-SL':'"
done=[]
for fn in sorted(os.listdir(os.path.join(D,'out'))):
    if not fn.endswith('.json'):continue
    code=fn[:-5]
    try:T=json.load(open(os.path.join(D,'out',fn),encoding='utf-8'))
    except Exception as e:print('skip',fn,e);continue
    out={}
    for x in SRC:
        v=T.get(str(x['id']))
        if not isinstance(v,str)or not v.strip():continue
        k=x['k']
        if k=='S:CB-TSR': # 스텔라 설명 세 개가 한 항목에 붙어 있음 → 다시 셋으로
            parts=re.split(r"'\s*,\s*\n?\s*'CB-(?:NM|SL)'\s*:\s*'",v)
            for code2,txt in zip(['CB-TSR','CB-NM','CB-SL'],parts):out['S:'+code2]=txt.replace("\\'","'")
            continue
        out[k]=v
    json.dump(out,open(os.path.join(ROOT,'lang',code+'.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
    done.append(f"{code}:{len(out)}")
print(' '.join(done))
