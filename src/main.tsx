import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {feature} from 'topojson-client';
import {geoEquirectangular,geoPath} from 'd3-geo';
import atlas from 'world-atlas/countries-110m.json';
import './style.css';

type Region='アジア'|'ヨーロッパ'|'アフリカ'|'北アメリカ'|'南アメリカ'|'オセアニア'|'世界';
type Country={id:number,name:string,region:Exclude<Region,'世界'>};
const A='アジア',E='ヨーロッパ',F='アフリカ',N='北アメリカ',S='南アメリカ',O='オセアニア' as const;
const rows:[number,string,Country['region']][]=[
[4,'アフガニスタン',A],[51,'アルメニア',A],[31,'アゼルバイジャン',A],[48,'バーレーン',A],[50,'バングラデシュ',A],[64,'ブータン',A],[96,'ブルネイ',A],[116,'カンボジア',A],[156,'中国',A],[196,'キプロス',A],[268,'ジョージア',A],[356,'インド',A],[360,'インドネシア',A],[364,'イラン',A],[368,'イラク',A],[376,'イスラエル',A],[392,'日本',A],[400,'ヨルダン',A],[398,'カザフスタン',A],[408,'北朝鮮',A],[410,'韓国',A],[414,'クウェート',A],[417,'キルギス',A],[418,'ラオス',A],[422,'レバノン',A],[458,'マレーシア',A],[496,'モンゴル',A],[104,'ミャンマー',A],[524,'ネパール',A],[512,'オマーン',A],[586,'パキスタン',A],[275,'パレスチナ',A],[608,'フィリピン',A],[634,'カタール',A],[682,'サウジアラビア',A],[702,'シンガポール',A],[144,'スリランカ',A],[760,'シリア',A],[762,'タジキスタン',A],[764,'タイ',A],[626,'東ティモール',A],[792,'トルコ',A],[795,'トルクメニスタン',A],[784,'アラブ首長国連邦',A],[860,'ウズベキスタン',A],[704,'ベトナム',A],[887,'イエメン',A],
[8,'アルバニア',E],[20,'アンドラ',E],[40,'オーストリア',E],[112,'ベラルーシ',E],[56,'ベルギー',E],[70,'ボスニア・ヘルツェゴビナ',E],[100,'ブルガリア',E],[191,'クロアチア',E],[203,'チェコ',E],[208,'デンマーク',E],[233,'エストニア',E],[246,'フィンランド',E],[250,'フランス',E],[276,'ドイツ',E],[300,'ギリシャ',E],[348,'ハンガリー',E],[352,'アイスランド',E],[372,'アイルランド',E],[380,'イタリア',E],[428,'ラトビア',E],[440,'リトアニア',E],[442,'ルクセンブルク',E],[807,'北マケドニア',E],[498,'モルドバ',E],[499,'モンテネグロ',E],[528,'オランダ',E],[578,'ノルウェー',E],[616,'ポーランド',E],[620,'ポルトガル',E],[642,'ルーマニア',E],[643,'ロシア',E],[688,'セルビア',E],[703,'スロバキア',E],[705,'スロベニア',E],[724,'スペイン',E],[752,'スウェーデン',E],[756,'スイス',E],[804,'ウクライナ',E],[826,'イギリス',E],
[12,'アルジェリア',F],[24,'アンゴラ',F],[204,'ベナン',F],[72,'ボツワナ',F],[854,'ブルキナファソ',F],[108,'ブルンジ',F],[120,'カメルーン',F],[140,'中央アフリカ共和国',F],[148,'チャド',F],[178,'コンゴ共和国',F],[180,'コンゴ民主共和国',F],[384,'コートジボワール',F],[262,'ジブチ',F],[818,'エジプト',F],[226,'赤道ギニア',F],[232,'エリトリア',F],[748,'エスワティニ',F],[231,'エチオピア',F],[266,'ガボン',F],[270,'ガンビア',F],[288,'ガーナ',F],[324,'ギニア',F],[404,'ケニア',F],[426,'レソト',F],[430,'リベリア',F],[434,'リビア',F],[450,'マダガスカル',F],[454,'マラウイ',F],[466,'マリ',F],[478,'モーリタニア',F],[504,'モロッコ',F],[508,'モザンビーク',F],[516,'ナミビア',F],[562,'ニジェール',F],[566,'ナイジェリア',F],[646,'ルワンダ',F],[686,'セネガル',F],[694,'シエラレオネ',F],[706,'ソマリア',F],[710,'南アフリカ',F],[728,'南スーダン',F],[729,'スーダン',F],[834,'タンザニア',F],[768,'トーゴ',F],[788,'チュニジア',F],[800,'ウガンダ',F],[894,'ザンビア',F],[716,'ジンバブエ',F],
[124,'カナダ',N],[840,'アメリカ合衆国',N],[484,'メキシコ',N],[84,'ベリーズ',N],[188,'コスタリカ',N],[192,'キューバ',N],[214,'ドミニカ共和国',N],[222,'エルサルバドル',N],[320,'グアテマラ',N],[332,'ハイチ',N],[340,'ホンジュラス',N],[388,'ジャマイカ',N],[558,'ニカラグア',N],[591,'パナマ',N],
[32,'アルゼンチン',S],[68,'ボリビア',S],[76,'ブラジル',S],[152,'チリ',S],[170,'コロンビア',S],[218,'エクアドル',S],[328,'ガイアナ',S],[600,'パラグアイ',S],[604,'ペルー',S],[740,'スリナム',S],[858,'ウルグアイ',S],[862,'ベネズエラ',S],
[36,'オーストラリア',O],[242,'フィジー',O],[598,'パプアニューギニア',O],[554,'ニュージーランド',O],[90,'ソロモン諸島',O],[548,'バヌアツ',O]
];
const countries:Country[]=rows.map(([id,name,region])=>({id,name,region}));
const regionEmoji:Record<Region,string>={'アジア':'🌏','ヨーロッパ':'🏰','アフリカ':'🦒','北アメリカ':'🌲','南アメリカ':'🦜','オセアニア':'🐠','世界':'🌎'};
const bounds:Record<Region,[number,number,number,number]>={'世界':[-180,-60,180,85],'アジア':[25,-10,180,82],'ヨーロッパ':[-25,33,60,72],'アフリカ':[-20,-38,55,38],'北アメリカ':[-170,5,-45,85],'南アメリカ':[-85,-58,-30,15],'オセアニア':[105,-50,180,10]};
const geo:any=feature(atlas as any,(atlas as any).objects.countries);
const shuffle=<T,>(a:T[])=>[...a].sort(()=>Math.random()-.5);
const smallCountryCenters:Record<number,[number,number]>={
  20:[1.6,42.55],48:[50.55,26.07],96:[114.73,4.54],196:[33.43,35.13],
  275:[35.23,31.95],414:[47.48,29.31],442:[6.13,49.81],634:[51.18,25.32],
  702:[103.82,1.35]
};
function Map({target,region}:{target:Country;region:Region}){
  const [x0,y0,x1,y1]=bounds[region];const w=900,h=480;
  const [zoom,setZoom]=useState(1);
  const [pan,setPan]=useState({x:0,y:0});
  const [drag,setDrag]=useState<{x:number;y:number;panX:number;panY:number}|null>(null);
  const pixelsPerDegree=Math.min(w/(x1-x0),h/(y1-y0));
  const projection=geoEquirectangular().center([(x0+x1)/2,(y0+y1)/2]).translate([w/2,h/2]).scale(pixelsPerDegree*180/Math.PI).clipExtent([[0,0],[w,h]]);
  const drawPath=geoPath(projection);
  const center=smallCountryCenters[target.id];
  const marker=center?projection(center):null;
  const viewW=w/zoom,viewH=h/zoom;
  const viewX=(w-viewW)/2+pan.x,viewY=(h-viewH)/2+pan.y;
  function changeZoom(next:number){setZoom(Math.max(1,Math.min(4,next)));if(next<=1)setPan({x:0,y:0})}
  return <div className="map-stage">
    <svg className={`map ${drag?'dragging':''}`} viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`} aria-label={`${region}の地図。ドラッグで移動できます`}
      onWheel={e=>{e.preventDefault();changeZoom(zoom+(e.deltaY<0?.5:-.5))}}
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDrag({x:e.clientX,y:e.clientY,panX:pan.x,panY:pan.y})}}
      onPointerMove={e=>{if(!drag)return;const rect=e.currentTarget.getBoundingClientRect();setPan({x:drag.panX-(e.clientX-drag.x)*viewW/rect.width,y:drag.panY-(e.clientY-drag.y)*viewH/rect.height})}}
      onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}>
      <g>{geo.features.map((f:any)=><path key={f.id} d={drawPath(f)??undefined} className={+f.id===target.id?'country target':'country'}/>)}</g>
      {marker&&<g className="small-country-marker" transform={`translate(${marker[0]} ${marker[1]})`} aria-label={`${target.name}の位置`}><circle className="marker-pulse" r="17"/><circle className="marker-dot" r="7"/><path d="M0 8 L-5 17 L5 17 Z"/></g>}
    </svg>
    <div className="map-controls" aria-label="地図の拡大縮小"><button onClick={()=>changeZoom(zoom+.5)} disabled={zoom>=4} aria-label="拡大">＋</button><button onClick={()=>changeZoom(zoom-.5)} disabled={zoom<=1} aria-label="縮小">−</button><button onClick={()=>{setZoom(1);setPan({x:0,y:0})}} aria-label="地図をリセット">⟳</button></div>
    {zoom>1&&<span className="zoom-level">{zoom}×</span>}
  </div>
}
function App(){
  type Attempt={countryId:number;correct:boolean;answeredAt:string};
  type QuizResult={region:Region;correct:number;total:number;completedAt:string};
  type Mode='all'|'review';
  const storageKey='geoanswer:attempts:v1';
  const [screen,setScreen]=useState<'home'|'quiz'|'result'>('home');
  const [region,setRegion]=useState<Region>('アジア');
  const [limit,setLimit]=useState(10);
  const [mode,setMode]=useState<Mode>('all');
  const [questions,setQuestions]=useState<Country[]>([]);
  const [i,setI]=useState(0);
  const [score,setScore]=useState(0);
  const [choice,setChoice]=useState<number|null>(null);
  const [attempts,setAttempts]=useState<Attempt[]>(()=>{
    try{const saved=JSON.parse(localStorage.getItem(storageKey)??'[]');return Array.isArray(saved)?saved:[]}catch{return []}
  });
  const [quizResults,setQuizResults]=useState<QuizResult[]>(()=>{
    try{const saved=JSON.parse(localStorage.getItem('geoanswer:quiz-results:v1')??'[]');return Array.isArray(saved)?saved:[]}catch{return []}
  });
  const pool=useMemo(()=>region==='世界'?countries:countries.filter(c=>c.region===region),[region]);
  const latestByCountry=useMemo(()=>{const latest=new globalThis.Map<number,Attempt>();for(const attempt of attempts)latest.set(attempt.countryId,attempt);return latest},[attempts]);
  const eligiblePool=useMemo(()=>mode==='all'?pool:pool.filter(c=>{const latest=latestByCountry.get(c.id);return !latest||!latest.correct}),[mode,pool,latestByCountry]);
  const current=questions[i];
  const options=useMemo(()=>current?shuffle([current,...shuffle(pool.filter(c=>c.id!==current.id)).slice(0,3)]):[],[current,pool]);
  function statsFor(ids:number[]){
    const idSet=new Set(ids);const records=attempts.filter(a=>idSet.has(a.countryId));const correct=records.filter(a=>a.correct).length;
    const studiedCountries=ids.filter(id=>records.some(a=>a.countryId===id)).length;
    return {attempted:records.length,correct,rate:records.length?Math.round(correct/records.length*100):null,studiedCountries}
  }
  function regionSessionStats(targetRegion:Region){const records=quizResults.filter(result=>result.region===targetRegion);const rates=records.map(result=>result.correct/result.total*100);return {count:records.length,highest:rates.length?Math.round(Math.max(...rates)):null,average:rates.length?Math.round(rates.reduce((sum,rate)=>sum+rate,0)/rates.length):null}}
  function countryStats(countryId:number){const records=attempts.filter(a=>a.countryId===countryId);const correct=records.filter(a=>a.correct).length;return {attempted:records.length,rate:records.length?Math.round(correct/records.length*100):null,previous:records.at(choice===null?-1:-2)}}
  function start(){if(!eligiblePool.length)return;setQuestions(shuffle(eligiblePool).slice(0,Math.min(limit,eligiblePool.length)));setI(0);setScore(0);setChoice(null);setScreen('quiz')}
  function answer(country:Country){if(choice!==null||!current)return;const correct=country.id===current.id;const nextAttempts=[...attempts,{countryId:current.id,correct,answeredAt:new Date().toISOString()}];setChoice(country.id);if(correct)setScore(value=>value+1);setAttempts(nextAttempts);localStorage.setItem(storageKey,JSON.stringify(nextAttempts))}
  function next(){if(i+1>=questions.length){const nextResults=[...quizResults,{region,correct:score,total:questions.length,completedAt:new Date().toISOString()}];setQuizResults(nextResults);localStorage.setItem('geoanswer:quiz-results:v1',JSON.stringify(nextResults));setScreen('result')}else{setI(value=>value+1);setChoice(null)}}
  const selectedRegionStats=statsFor(pool.map(c=>c.id));
  const selectedSessionStats=regionSessionStats(region);
  const currentStats=current?countryStats(current.id):null;
  return <main>
    {screen==='home'&&<section className="home">
      <nav><span className="brand">GEO<span>ANSWER</span></span><span className="navnote">地図から世界を知ろう</span></nav>
      <div className="hero"><div><p className="eyebrow">WORLD MAP QUIZ</p><h1>この国、<br/><em>わかる？</em></h1><p className="lead">地図を見ながら国名を当てよう。<br/>遊ぶたびに、世界がもっと近くなる。</p></div><div className="globe">🌍<i>?</i></div></div>
      <div className="setup">
        <div><label>地域をえらぶ</label><div className="regions">{(['アジア','ヨーロッパ','アフリカ','北アメリカ','南アメリカ','オセアニア','世界'] as Region[]).map(r=>{const list=r==='世界'?countries:countries.filter(c=>c.region===r);const stats=statsFor(list.map(c=>c.id));return <button className={region===r?'selected':''} onClick={()=>setRegion(r)} key={r}><b>{regionEmoji[r]}</b>{r}<small>{stats.rate===null?'未挑戦':`正答率 ${stats.rate}%`}</small></button>})}</div></div>
        <div className="count"><label>問題数</label><div>{[10,30,50,100].map(n=><button className={limit===n?'selected':''} onClick={()=>setLimit(n)} key={n}>{n}</button>)}</div><small>{eligiblePool.length<limit?`${region}は対象の全${eligiblePool.length}か国を出題します`:`ランダムに${limit}問出題します`}</small></div>
        <div className="mode"><label>出題モード</label><div><button className={mode==='all'?'selected':''} onClick={()=>setMode('all')}><b>すべて</b><span>地域からランダム</span></button><button className={mode==='review'?'selected':''} onClick={()=>setMode('review')}><b>復習</b><span>未挑戦・前回不正解のみ</span></button></div></div>
        <div className="region-summary"><span>{region}の学習記録</span>{selectedRegionStats.rate===null?<b>まだ記録がありません</b>:<div className="rate-metrics"><span><b>{selectedSessionStats.highest??'—'}%</b><small>クイズ最高</small></span><span><b>{selectedSessionStats.average??'—'}%</b><small>クイズ平均</small></span><span><b>{selectedRegionStats.rate}%</b><small>全回答</small></span></div>}<small>{selectedSessionStats.count}回完了・{selectedRegionStats.studiedCountries}か国に挑戦</small></div>
        <button className="start" onClick={start} disabled={!eligiblePool.length}>{eligiblePool.length?'クイズをはじめる':'復習する問題はありません'} <span>{eligiblePool.length?'→':'✓'}</span></button>
      </div>
    </section>}
    {screen==='quiz'&&current&&<section className="quiz">
      <header><button className="quit" onClick={()=>setScreen('home')}>×</button><div className="progress"><i style={{width:`${((i+(choice!==null?1:0))/questions.length)*100}%`}}/></div><span>{i+1} / {questions.length}</span></header>
      <div className="quizbody"><p className="eyebrow">{regionEmoji[region]} {region} CHALLENGE</p><h2>色がついた国はどこ？</h2><div className="mapwrap"><Map key={current.id} target={current} region={region}/><span className="zoomnote">指で移動・ボタンで拡大できます</span></div><div className="answers">{options.map((c,n)=>{const cls=choice===null?'':c.id===current.id?'correct':choice===c.id?'wrong':'muted';return <button disabled={choice!==null} className={cls} onClick={()=>answer(c)} key={c.id}><kbd>{n+1}</kbd>{c.name}<span>{cls==='correct'?'✓':cls==='wrong'?'×':''}</span></button>})}</div></div>
      {choice!==null&&<footer className={choice===current.id?'good':'bad'}><div><b>{choice===current.id?'そのとおり！':'おしい！'}</b><span>{choice===current.id?'ナイス、正解です。':`正解は「${current.name}」です。`}</span><small className="country-history">{current.name}：正答率 {currentStats?.rate}%（{currentStats?.attempted}回）{currentStats?.previous&&!currentStats.previous.correct?'・前回は不正解':''}</small></div><button onClick={next}>{i+1===questions.length?'結果を見る':'つぎへ'} →</button></footer>}
    </section>}
    {screen==='result'&&<section className="result"><div className="trophy">🏆</div><p className="eyebrow">QUIZ COMPLETE</p><h1>おつかれさま！</h1><div className="score"><b>{score}</b><span>/ {questions.length} 問正解</span></div><p>{score===questions.length?'パーフェクト！世界博士ですね。':score/questions.length>=.7?'すごい！かなりの地理通です。':'もう一度挑戦して覚えよう！'}</p><div className="result-history"><div className="rate-metrics"><span><b>{regionSessionStats(region).highest??'—'}%</b><small>地域最高</small></span><span><b>{regionSessionStats(region).average??'—'}%</b><small>地域平均</small></span><span><b>{statsFor(pool.map(c=>c.id)).rate??'—'}%</b><small>全回答</small></span></div><span>完了したクイズと国別回答ログをこの端末に保存しています</span></div><button className="start" onClick={start} disabled={!eligiblePool.length}>もう一度チャレンジ <span>↻</span></button><button className="back" onClick={()=>setScreen('home')}>設定にもどる</button></section>}
  </main>
}
window.addEventListener('keydown',(event)=>{
  if(event.repeat)return;
  if(['1','2','3','4'].includes(event.key)){
    const button=document.querySelectorAll<HTMLButtonElement>('.answers button')[Number(event.key)-1];
    if(button&&!button.disabled){event.preventDefault();button.click()}
  }else if(event.key==='Enter'){
    const nextButton=document.querySelector<HTMLButtonElement>('.quiz footer button');
    if(nextButton){event.preventDefault();nextButton.click()}
  }
});
createRoot(document.getElementById('root')!).render(<App/>);
