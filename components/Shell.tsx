"use client";
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { sfx } from '../lib/sfx';
export default function Shell({children}:{children:React.ReactNode}) {
 const [dark,setDark]=useState(false);const [sound,setSound]=useState(false);
 useEffect(()=>{try{setDark(localStorage.getItem('nq_theme')==='dark'); const on=localStorage.getItem('nq_sound')==='on';setSound(on);sfx.enabled=on;}catch{sfx.enabled=false;}},[]);
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';},[dark]);
 function theme(){setDark(!dark);try{localStorage.setItem('nq_theme',!dark?'dark':'light');}catch{}}
 function audio(){sfx.enabled=!sound;setSound(!sound);try{localStorage.setItem('nq_sound',!sound?'on':'off');}catch{}if(!sound)sfx.ding();}
 return <><a className="skip-link" href="#main">Skip to adventure</a><header className="site-header"><Link className="wordmark" href="/"><span aria-hidden="true">❧</span> NephroQuest <small>THE WOODLAND CHAPTER</small></Link><nav aria-label="Main navigation"><Link href="/play">Case library</Link><Link href="/drill">Lab drill</Link><button className="icon-btn" onClick={audio} aria-pressed={sound}>{sound?'Sound on':'Sound off'}</button><button className="icon-btn" onClick={theme} aria-pressed={dark}>{dark?'Light mode':'Dark mode'}</button></nav></header><main id="main">{children}</main><footer className="site-footer"><span>Grow your knowledge. Keep your curiosity.</span><p>Educational simulation only. Legacy scenarios await clinical review; not current clinical guidance or real patient care. Scripted outcomes are game mechanics, not predictions.</p><small>Milestone 1 · The Dry Gardener · Original artwork & synthesized sound</small></footer></>;
}
