import{c as jt,a as ye,r as gn,b as pn,s as Ve,d as je,e as Ze,u as Et,f as U,g as Te,l as Je,h as $t,i as vn,j as wn,k as u,R as Ct,n as ct,v as bn,m as K,T as ie,t as at,o as ze,p as Ft,q as yn,S as Tn,w as Jt,x as dt,y as It,z as it,A as Qt,B as Qe,C as St,D as Ut,E as xn,__tla as Ln}from"./index-BYTDGKdj.js";let kt,_n=Promise.all([(()=>{try{return Ln}catch{}})()]).then(async()=>{const ut=jt("AddFilled","1em",["M10 2.25c.41 0 .75.34.75.75v6.25H17a.75.75 0 0 1 0 1.5h-6.25V17a.75.75 0 0 1-1.5 0v-6.25H3a.75.75 0 0 1 0-1.5h6.25V3c0-.41.34-.75.75-.75Z"]),er=jt("TextAlignRightFilled","1em",["M6 4.25c0-.41.34-.75.75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.25Zm-4 5c0-.41.34-.75.75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.25Zm7.75 4.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z"]),tr=jt("VideoBackgroundEffectFilled","1em",["M6.2 4 2 8.2V6.8L4.8 4h1.4Zm7 0-1.46 1.46a3.48 3.48 0 0 0-1.02-.39L11.79 4h1.42Zm-1.08 3.17a2.51 2.51 0 0 0-2.34-1.16 2.5 2.5 0 1 0 2.34 1.16Zm.72-.72c.2.29.37.6.48.94L16.69 4 16.5 4h-1.2l-2.46 2.45ZM7.5 12c-.08 0-.15 0-.22.02A1.5 1.5 0 0 0 6 13.5V16h8v-2.5a1.5 1.5 0 0 0-1.5-1.5h-5Zm5-1c.22 0 .43.03.63.08L18 6.2V5.5c0-.2-.04-.4-.12-.59l-4.5 4.5a3.5 3.5 0 0 1-.93 1.59h.05Zm1.9.88c.23.27.4.58.5.93L18 9.7V8.29l-3.6 3.6ZM15 16v-1.2l3-3v1.4L15.2 16H15Zm-10-.3v-1.4l-1.7 1.69.2.01h1.2l.3-.3Zm1.57-6.48c.08.36.21.7.4 1.02L2.11 15.1A1.5 1.5 0 0 1 2 14.5v-.7l4.57-4.58ZM9.71 4 2 11.7v-1.4L8.3 4h1.4Z"]),Ce=t=>t,mt=t=>({_tag:"Left",value:t}),st=t=>({_tag:"Right",value:t}),rr=(t,e,r)=>r._tag==="Left"?t(r.value):e(r.value),Rt={dimap:(t,e,r)=>o=>e(r(t(o))),first:t=>([e,r])=>[t(e),r],right:t=>e=>e._tag==="Left"?e:st(t(e.value)),wander:t=>e=>e.map(t)},nr={empty:()=>{},foldMap:(t,e)=>{for(let r=0;r<e.length;r++){const o=t(e[r]);if(o!=null)return o}}},or={empty:()=>[],foldMap:(t,e)=>{let r=[];return e.forEach(o=>{r=r.concat(t(o))}),r}},ht=t=>({dimap:(e,r,o)=>n=>o(e(n)),first:e=>([r,o])=>e(r),right:e=>r=>r._tag==="Left"?t.empty():e(r.value),wander:e=>r=>t.foldMap(e,r)}),ft={Equivalence:{Equivalence:"Equivalence",Iso:"Iso",Lens:"Lens",Prism:"Prism",Traversal:"Traversal",Getter:"Getter",AffineFold:"AffineFold",Fold:"Fold",Setter:"Setter"},Iso:{Equivalence:"Iso",Iso:"Iso",Lens:"Lens",Prism:"Prism",Traversal:"Traversal",Getter:"Getter",AffineFold:"AffineFold",Fold:"Fold",Setter:"Setter"},Lens:{Equivalence:"Lens",Iso:"Lens",Lens:"Lens",Prism:"Prism",Traversal:"Traversal",Getter:"Getter",AffineFold:"AffineFold",Fold:"Fold",Setter:"Setter"},Prism:{Equivalence:"Prism",Iso:"Prism",Lens:"Prism",Prism:"Prism",Traversal:"Traversal",Getter:"AffineFold",AffineFold:"AffineFold",Fold:"Fold",Setter:"Setter"},Traversal:{Equivalence:"Traversal",Iso:"Traversal",Lens:"Traversal",Prism:"Traversal",Traversal:"Traversal",Getter:"Fold",AffineFold:"Fold",Fold:"Fold",Setter:"Setter"},Getter:{Equivalence:"Getter",Iso:"Getter",Lens:"Getter",Prism:"AffineFold",Traversal:"Fold",Getter:"Getter",AffineFold:"AffineFold",Fold:"Fold",Setter:void 0},AffineFold:{Equivalence:"AffineFold",Iso:"AffineFold",Lens:"AffineFold",Prism:"AffineFold",Traversal:"Fold",Getter:"AffineFold",AffineFold:"AffineFold",Fold:"Fold",Setter:void 0},Fold:{Equivalence:"Fold",Iso:"Fold",Lens:"Fold",Prism:"Fold",Traversal:"Fold",Getter:"Fold",AffineFold:"Fold",Fold:"Fold",Setter:void 0},Setter:{Equivalence:void 0,Iso:void 0,Lens:void 0,Prism:void 0,Traversal:void 0,Getter:void 0,AffineFold:void 0,Fold:void 0,Setter:void 0}},Me=(t,e)=>{const r=e;return r._tag=t,r},Nt=t=>(t._removable=!0,t);function F(t,e,r){switch(arguments.length){case 2:{const o=(n,a)=>t(n,e(n,a));return o._tag=ft[t._tag][e._tag],o._removable=e._removable||!1,o}default:{const o=ft[t._tag][e._tag],n=(a,s)=>t(a,e(a,r(a,s)));return n._tag=ft[o][r._tag],n._removable=r._removable||!1,n}}}const ir=Me("Equivalence",(t,e)=>e),lt=(t,e)=>Me("Iso",(r,o)=>r.dimap(t,e,o)),he=(t,e)=>Me("Lens",(r,o)=>r.dimap(n=>[t(n),n],e,r.first(o))),gt=(t,e)=>Me("Prism",(r,o)=>r.dimap(t,n=>rr(Ce,e,n),r.right(o))),pt=Me("Traversal",(t,e)=>t.dimap(Ce,Ce,t.wander(e))),sr=t=>Me("Getter",(e,r)=>e.dimap(t,Ce,r)),Pt=(t,e,r)=>t(Rt,e)(r),lr=(t,e,r)=>t(Rt,()=>e)(r),cr=(t,e)=>t(ht({}),Ce)(e),ar=(t,e)=>t(ht(nr),Ce)(e),Dt=(t,e)=>t(ht(or),r=>[r])(e),dr=lt(t=>t.map((e,r)=>[r,e]),t=>{const e=[...t].sort((o,n)=>o[0]-n[0]),r=[];for(let o=0;o<e.length;++o)(o===e.length-1||e[o][0]!==e[o+1][0])&&r.push(e[o][1]);return r}),Ht=t=>he(e=>e[t],([e,r])=>Object.assign(Object.assign({},r),{[t]:e})),ur=t=>he(e=>{const r={};for(const o of t)r[o]=e[o];return r},([e,r])=>{const o=Object.assign({},r);for(const n of t)delete o[n];return Object.assign(o,e)}),Bt=t=>he(e=>e[t],([e,r])=>{const o=r.slice();return o[t]=e,o}),vt=Bt(0),wt=t=>gt(e=>t(e)?st(e):mt(e),Ce),Ue=Symbol("__no_match__"),Vt=wt(t=>t!==Ue),zt=Symbol("__remove_me__"),bt=t=>Nt(F(he(e=>0<=t&&t<e.length?e[t]:Ue,([e,r])=>{if(e===Ue)return r;if(e===zt)return typeof r=="string"?r.substring(0,t)+r.substring(t+1):[...r.slice(0,t),...r.slice(t+1)];if(typeof r=="string")return t===0?e+r.substring(1):t===r.length?r.substring(0,t-1)+e:r.substring(0,t)+e+r.substring(t+1);{const o=r.slice();return o[t]=e,o}}),Vt)),mr=gt(t=>t===void 0?mt(void 0):st(t),Ce),hr=t=>gt(e=>t(e)?st(e):mt(e),Ce),fr=t=>Nt(F(he(e=>{const r=e.findIndex(t);return r===-1?[Ue,-1]:[e[r],r]},([[e,r],o])=>{if(e===Ue)return o;if(e===zt)return[...o.slice(0,r),...o.slice(r+1)];const n=o.slice();return n[r]=e,n}),vt,Vt)),gr=t=>F(he(e=>{const r=e.map((o,n)=>t(o)?n:null).filter(o=>o!=null);return[r.map(o=>e[o]),r]},([[e,r],o])=>{const n=o.length,a=e.length;let s=0,p=0,m=0;const w=[];for(;s<n;)r[p]===s?(++p,m<a&&(w.push(e[m]),++m)):w.push(o[s]),++s;for(;m<a;)w.push(e[m++]);return w}),vt),pr=t=>he(e=>e===void 0?t:e,([e,r])=>e),vr=t=>F(he(e=>{const r=Dt(t,e);return[r,r.length]},([[e,r],o])=>{if(e.length!==r)throw new Error("cannot add/remove elements through partsOf");let n=0;return Pt(t,()=>e[n++],o)}),vt),wr=t=>he(e=>t(e),([e,r])=>e),br=t=>he(e=>e,([e,r])=>t(e)),yr=he(t=>{},([t,e])=>t===void 0?e:[t,...e]),Tr=he(t=>{},([t,e])=>t===void 0?e:[...e,t]),xr=F(lt(t=>t.split(""),t=>t.join("")),pt),Lr=F(lt(t=>t.split(/\b/),t=>t.join("")),pt,wt(t=>!/\s+/.test(t)));class H{constructor(e){this._ref=e}get _tag(){return this._ref._tag}get _removable(){return this._ref._removable}compose(e){return new H(F(this._ref,e._ref))}iso(e,r){return new H(F(this._ref,lt(e,r)))}lens(e,r){return new H(F(this._ref,he(e,([o,n])=>r(n,o))))}indexed(){return new H(F(this._ref,dr))}prop(e){return new H(F(this._ref,Ht(e)))}path(...e){return e.length===1&&(e=e[0].split(".")),new H(e.reduce((r,o)=>F(r,Ht(o)),this._ref))}pick(e){return new H(F(this._ref,ur(e)))}nth(e){return new H(F(this._ref,Bt(e)))}filter(e){return new H(F(this._ref,gr(e)))}valueOr(e){return new H(F(this._ref,pr(e)))}partsOf(e){const r=typeof e=="function"?e(Gt):e;return new H(F(this._ref,vr(r._ref)))}reread(e){return new H(F(this._ref,wr(e)))}rewrite(e){return new H(F(this._ref,br(e)))}optional(){return new H(F(this._ref,mr))}guard_(){return e=>this.guard(e)}guard(e){return new H(F(this._ref,hr(e)))}at(e){return new H(F(this._ref,bt(e)))}head(){return new H(F(this._ref,bt(0)))}index(e){return new H(F(this._ref,bt(e)))}find(e){return new H(F(this._ref,fr(e)))}elems(){return new H(F(this._ref,pt))}to(e){return new H(F(this._ref,sr(e)))}when(e){return new H(F(this._ref,wt(e)))}chars(){return new H(F(this._ref,xr))}words(){return new H(F(this._ref,Lr))}prependTo(){return new H(F(this._ref,yr))}appendTo(){return new H(F(this._ref,Tr))}}const Gt=new H(ir);function _r(){return Gt}function Ar(t){return e=>cr(t._ref,e)}function jr(t){return e=>ar(t._ref,e)}function Er(t){return e=>Dt(t._ref,e)}function Cr(t){return e=>r=>Pt(t._ref,e,r)}function Fr(t){return e=>r=>lr(t._ref,e,r)}const Wt=(t,e,r)=>(e.has(r)?e:e.set(r,t())).get(r),Ir=new WeakMap,Sr=(t,e,r)=>{const o=Wt(()=>new WeakMap,Ir,e);return Wt(t,o,r)},kr=t=>typeof t=="function";function Rr(t,e){return Sr(()=>{const r=e(_r());return ye(o=>{const n=o(t);return n instanceof Promise?n.then(a=>Ot(r,a)):Ot(r,n)},(o,n,a)=>{const s=kr(a)?Cr(r)(a):Fr(r)(a),p=o(t);return n(t,p instanceof Promise?p.then(s):s(p))})},t,e)}const Ot=(t,e)=>t._tag==="Traversal"?Er(t)(e):t._tag==="Prism"?jr(t)(e):Ar(t)(e);var et={},Zt;function Nr(){if(Zt)return et;Zt=1,Object.defineProperty(et,"__esModule",{value:!0}),et.ViewportList=void 0;const t=gn(),e=pn(),r=typeof window>"u",o=!r&&(()=>{try{return"ontouchstart"in window||navigator.maxTouchPoints}catch{return!1}})(),n=!r&&(()=>{try{return window.CSS.supports("overflow-anchor: auto")}catch{return!1}})(),a=o&&!n,s={top:"top",bottom:"bottom",clientHeight:"clientHeight",scrollHeight:"scrollHeight",scrollTop:"scrollTop",overflowY:"overflowY",height:"height",minHeight:"minHeight",maxHeight:"maxHeight",marginTop:"marginTop"},p={top:"left",bottom:"right",scrollHeight:"scrollWidth",clientHeight:"clientWidth",scrollTop:"scrollLeft",overflowY:"overflowX",minHeight:"minWidth",height:"width",maxHeight:"maxWidth",marginTop:"marginLeft"},m=(c,d,I=1/0)=>Math.max(Math.min(d,I),c),w=(c,d,I)=>Math.ceil(Math.abs(c-d)/I),f=r?e.useEffect:e.useLayoutEffect,x=(c,d,I)=>{const z=[];for(let Y=c;Y<d;Y++)z.push(I(Y));return z},_=({fromElement:c,toElement:d,fromIndex:I,asc:z=!0,compare:Y})=>{let L=I,B=c;for(;B&&B!==d;){if(Y(B,L))return[B,L];z?(L++,B=B.nextSibling):(L--,B=B.previousSibling)}return[null,-1]},j=/auto|scroll/gi,k=(c,d)=>{if(!d||d===document.body||d===document.documentElement)return document.documentElement;const I=window.getComputedStyle(d);return j.test(I[c.overflowY])||j.test(I.overflow)?d:k(c,d.parentNode)},b=(c,d,I=0)=>({padding:0,margin:0,border:"none",visibility:"hidden",overflowAnchor:"none",[c.minHeight]:d,[c.height]:d,[c.maxHeight]:d,[c.marginTop]:I}),A=({items:c=[],count:d,children:I,viewportRef:z,itemSize:Y=0,itemMargin:L=-1,overscan:B=1,axis:G="y",initialIndex:W=-1,initialAlignToTop:J=!0,initialOffset:v=0,initialDelay:h=-1,initialPrerender:q=0,onViewportIndexesChange:R,overflowAnchor:X="auto",withCache:O=!0,scrollThreshold:Q=0,renderSpacer:ee=({ref:i,style:xe})=>(0,t.jsx)("div",{ref:i,style:xe}),indexesShift:ae=0,getItemBoundingClientRect:E=i=>i.getBoundingClientRect()},Fe)=>{const i=G==="y"?s:p,xe=typeof d=="number",ne=(xe?d:c.length)-1,[[oe,Le],Xe]=(0,e.useState)(()=>[m(0,Y),m(-1,L)]),de=m(0,oe+Le),Ie=m(0,Math.ceil(B*de)),[te,Se]=(0,e.useState)([W-q,W+q]),_e=(0,e.useRef)(null),Ee=(0,e.useRef)(-1),ue=(0,e.useRef)(null),Ne=(0,e.useRef)(null),Ge=(0,e.useRef)(!1),ke=(0,e.useRef)(ae),pe=(0,e.useRef)([]),ce=(0,e.useRef)(W>=0?{index:W,alignToTop:J,offset:v,delay:h,prerender:q}:null),ve=(0,e.useRef)(null),se=(0,e.useRef)(0),Ae=(0,e.useRef)([-1,-1]),we=(0,e.useRef)(null),[N,$]=(0,e.useMemo)(()=>{te[0]=m(0,te[0],ne),te[1]=m(te[0],te[1],ne);const l=ae-ke.current;ke.current=ae;const T=ue.current;return T&&l&&(te[0]=m(0,te[0]+l,ne),te[1]=m(te[0],te[1]+l,ne),_e.current=T.nextSibling,Ee.current=te[0],Ge.current=!0),te},[ae,te,ne]),Pe=(0,e.useMemo)(()=>b(i,(O?pe.current:[]).slice(0,N).reduce((l,T)=>l+(T-oe),N*de),se.current),[i,O,N,de,oe]),De=(0,e.useMemo)(()=>b(i,(O?pe.current:[]).slice($+1,ne+1).reduce((l,T)=>l+(T-oe),de*(ne-$))),[i,O,$,ne,de,oe]),fe=(0,e.useMemo)(()=>{let l=null;return()=>{if(z)return z.current===document.body?document.documentElement:z.current;if(l&&l.isConnected)return l;const T=ue.current;return T?(l=k(i,T.parentNode),l):null}},[i,z]),He=(0,e.useRef)(()=>{}),g=(0,e.useRef)(()=>({index:-1,offset:0}));f(()=>{He.current=()=>{const l=fe(),T=ue.current,S=Ne.current;if(!l||!T||!S)return;const C=T.nextSibling,V=S.previousSibling,me=l.getBoundingClientRect(),M=T.getBoundingClientRect(),D=S.getBoundingClientRect(),ge={[i.top]:l===document.documentElement?0:me[i.top],[i.bottom]:l===document.documentElement?document.documentElement[i.clientHeight]:me[i.bottom]},re={[i.top]:ge[i.top]-Ie,[i.bottom]:ge[i.bottom]+Ie};if(se.current<0&&M[i.top]-se.current>=re[i.top]||se.current>0&&M[i.top]>=re[i.top]||se.current&&ce.current){T.style[i.marginTop]="0px",l.style[i.overflowY]="hidden",l[i.scrollTop]+=-se.current,l.style[i.overflowY]="",se.current=0;return}if(oe===0||Le===-1){let Z=0;if(_({fromElement:C,toElement:S,fromIndex:N,compare:Oe=>(Z+=E(Oe)[i.height],!1)}),!Z)return;const le=$-N+1,Re=oe===0?Math.ceil(Z/le):oe,We=Le===-1?Math.ceil((D[i.top]-M[i.bottom]-Z)/le):Le;Xe([Re,We]);return}if(ve.current)return;if(ce.current){const Z=m(0,ce.current.index,ne);if(Z<N||Z>$){Se([Z-ce.current.prerender,Z+ce.current.prerender]);return}const[le]=_({fromElement:C,toElement:S,fromIndex:N,compare:(_t,At)=>At===Z});if(!le)return;const{alignToTop:Re,offset:We,delay:Oe}=ce.current;ce.current=null;const Yt=()=>{const _t=E(le),At=Re?_t[i.top]-ge[i.top]+We:_t[i.bottom]-ge[i.top]-l[i.clientHeight]+We;l[i.scrollTop]+=At,ve.current=null},Xt=Oe<0&&a?30:Oe;if(Xt>0){ve.current=setTimeout(Yt,Xt);return}Yt();return}if(we.current===null)we.current=l.scrollTop;else if(we.current!==l.scrollTop){const Z=Math.abs(l.scrollTop-we.current);if(we.current=l.scrollTop,Q>0&&Z>Q)return}const rt=C===S?S:C.nextSibling,Kt=V===T?T:V.previousSibling,$e=Math.ceil((D[i.top]-M[i.bottom])/($+1-N)),nt=M[i.bottom]>re[i.bottom],ot=D[i.top]<re[i.top],un=!nt&&!ot&&M[i.bottom]>re[i.top],mn=!nt&&!ot&&D[i.top]<re[i.bottom],hn=!nt&&!ot&&(Kt===T?M:E(Kt))[i.bottom]>re[i.bottom],fn=!nt&&!ot&&(rt===S?D:E(rt))[i.top]<re[i.top];let be=N,Be=$;if(nt&&(be-=w(M[i.bottom],re[i.top],$e),Be-=w(D[i.top],re[i.bottom],$e)),ot&&(Be+=w(D[i.top],re[i.bottom],$e),be+=w(M[i.bottom],re[i.top],$e)),un&&(be-=w(M[i.bottom],re[i.top],$e)),mn&&(Be+=w(D[i.top],re[i.bottom],$e)),hn){const[,Z]=_({fromElement:V,toElement:T,fromIndex:$,asc:!1,compare:le=>E(le)[i.bottom]<=re[i.bottom]});Z!==-1&&(Be=Z+1)}if(fn){const[,Z]=_({fromElement:C,toElement:S,fromIndex:N,compare:le=>E(le)[i.top]>=re[i.top]});Z!==-1&&(be=Z-1)}if(R){let[,Z]=_({fromElement:C,toElement:S,fromIndex:N,compare:Re=>E(Re)[i.bottom]>ge[i.top]});Z===-1&&(Z=N);let[,le]=_({fromElement:V,toElement:T,fromIndex:$,asc:!1,compare:Re=>E(Re)[i.top]<ge[i.bottom]});le===-1&&(le=$),(Z!==Ae.current[0]||le!==Ae.current[1])&&(Ae.current=[Z,le],R(Ae.current))}if(be=m(0,be,ne),Be=m(be,Be,ne),!(be===N&&Be===$)){if(be!==N)if(N>=be)_e.current=C,Ee.current=N;else{const[Z,le]=_({fromElement:C,toElement:S,fromIndex:N,compare:(Re,We)=>{if(We===be)return!0;const Oe=E(Re);return Oe[i.height]!==oe&&(pe.current[We]=Oe[i.height]),!1}});Z?(_e.current=Z,Ee.current=le):(_e.current=V,Ee.current=$)}Se([be,Be])}},g.current=()=>{const l=fe(),T=ue.current,S=Ne.current;let C=-1,V=0;if(!l||!T||!S)return{index:C,offset:V};const me=T.nextSibling,M=l.getBoundingClientRect(),D={[i.top]:l===document.documentElement?0:M[i.top],[i.bottom]:l===document.documentElement?document.documentElement[i.clientHeight]:M[i.bottom]};return _({fromElement:me,toElement:S,fromIndex:N,compare:(ge,re)=>{const rt=E(ge);return C=re,V=D[i.top]-rt[i.top],rt[i.bottom]>D[i.top]}}),{index:C,offset:V}}});let P;return _e.current&&fe()&&ue.current&&(P=E(_e.current)[i.top]-(fe()===document.documentElement?0:fe().getBoundingClientRect()[i.top])),f(()=>{_e.current=null;const l=Ee.current,T=Ge.current;Ee.current=-1,Ge.current=!1;const S=fe(),C=ue.current,V=Ne.current;if(l===-1||!S||!C||!V||P===void 0||n&&X!=="none"&&!T)return;let me=null;if(l>=N&&l<=$){const[D]=_({fromElement:C.nextSibling,toElement:V,fromIndex:N,compare:(ge,re)=>re===l});D&&(me=E(D)[i.top])}else l<N?me=C.getBoundingClientRect()[i.top]+(O?pe.current:[]).slice(0,l).reduce((D,ge)=>D+(ge-oe),l*de):l<=ne&&(me=V.getBoundingClientRect()[i.top]+(O?pe.current:[]).slice($+1,l).reduce((D,ge)=>D+(ge-oe),de*(l-1-$)));if(me===null)return;const M=me-(S===document.documentElement?0:S.getBoundingClientRect()[i.top])-P;if(M){if(o){se.current-=M,C.style[i.marginTop]=`${se.current}px`;return}S[i.scrollTop]+=M}},[N]),f(()=>{let l;const T=()=>{l=requestAnimationFrame(T),He.current()};return T(),()=>{cancelAnimationFrame(l),ve.current&&clearTimeout(ve.current)}},[]),(0,e.useImperativeHandle)(Fe,()=>({scrollToIndex:({index:l=-1,alignToTop:T=!0,offset:S=0,delay:C=-1,prerender:V=0})=>{ce.current={index:l,alignToTop:T,offset:S,delay:C,prerender:V},He.current()},getScrollPosition:()=>g.current()}),[]),(0,t.jsxs)(e.Fragment,{children:[ee({ref:ue,style:Pe,type:"top"}),(!!d||!!c.length)&&x(N,$+1,xe?I:l=>I(c[l],l,c)),ee({ref:Ne,style:De,type:"bottom"})]})};return et.ViewportList=(0,e.forwardRef)(A),et}var Pr=Nr();globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}},globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}};const qe=globalThis.jotaiAtomCache.get("/home/runner/work/amll-ttml-tool/amll-ttml-tool/src/components/LyricLinesView/lyric-line-view-states.ts/draggingIdAtom",ye(""));qe.debugLabel="draggingIdAtom",qe.debugLabel="draggingIdAtom";const Dr="_lyricWord_ck5uu_11",Hr="_edit_ck5uu_12",Br="_sync_ck5uu_19",Vr="_dropLeft_ck5uu_26",zr="_dropRight_ck5uu_29",Gr="_displayWord_ck5uu_33",Wr="_startTime_ck5uu_36",Or="_endTime_ck5uu_37",Zr="_lyricLine_ck5uu_56",Mr="_dropTop_ck5uu_61",qr="_dropBottom_ck5uu_64",Kr="_ignoreSync_ck5uu_67",Yr="_insertWordField_ck5uu_76",Xr="_empty_ck5uu_87",$r="_lyricLineContainer_ck5uu_91",Jr="_lyricWordsContainer_ck5uu_101",Qr="_blank_ck5uu_123",Ur="_selected_ck5uu_131",y={lyricWord:Dr,edit:Hr,sync:Br,dropLeft:Vr,dropRight:zr,displayWord:Gr,startTime:Wr,endTime:Or,lyricLine:Zr,dropTop:Mr,dropBottom:qr,ignoreSync:Kr,insertWordField:Yr,empty:Xr,lyricLineContainer:$r,lyricWordsContainer:Jr,blank:Qr,selected:Ur};globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}},globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}};const yt=globalThis.jotaiAtomCache.get("/home/runner/work/amll-ttml-tool/amll-ttml-tool/src/components/LyricLinesView/lyric-word-menu.tsx/selectedLinesSizeAtom",ye(t=>t(Ve).size));yt.debugLabel="selectedLinesSizeAtom",yt.debugLabel="selectedLinesSizeAtom";const Tt=globalThis.jotaiAtomCache.get("/home/runner/work/amll-ttml-tool/amll-ttml-tool/src/components/LyricLinesView/lyric-word-menu.tsx/selectedWordsSizeAtom",ye(t=>t(je).size));Tt.debugLabel="selectedWordsSizeAtom",Tt.debugLabel="selectedWordsSizeAtom";const en=t=>{const e=Ze.c(27),{wordIndex:r,wordAtom:o,lineIndex:n}=t,a=Et(),s=U(Tt),p=U(yt),m=Te(Je),w=$t(vn),f=U(o),x=$t(wn),_=s===0;let j;e[0]!==m||e[1]!==a?(j=()=>{m(L=>{const B=a.get(je);for(const G of L.lyricLines)G.words=G.words.filter(W=>!B.has(W.id))})},e[0]=m,e[1]=a,e[2]=j):j=e[2];let k;e[3]!==_||e[4]!==j?(k=u.jsx(Ct,{disabled:_,onClick:j,children:"\u5220\u9664\u6240\u9009\u5355\u8BCD"}),e[3]=_,e[4]=j,e[5]=k):k=e[5];const b=s!==1;let A;e[6]!==n||e[7]!==w||e[8]!==x||e[9]!==f.word||e[10]!==r?(A=()=>{x({wordIndex:r,lineIndex:n,word:f.word}),w(!0)},e[6]=n,e[7]=w,e[8]=x,e[9]=f.word,e[10]=r,e[11]=A):A=e[11];let c;e[12]!==b||e[13]!==A?(c=u.jsx(Ct,{disabled:b,onClick:A,children:"\u62C6\u5206\u6B64\u5355\u8BCD/\u5728\u6B64\u5904\u66FF\u6362\u5355\u8BCD"}),e[12]=b,e[13]=A,e[14]=c):c=e[14];const d=!(s>1&&p===1);let I;e[15]!==m||e[16]!==n||e[17]!==a||e[18]!==r?(I=()=>{m(L=>{const B=a.get(je),G=L.lyricLines[n];if(G){let W=-1,J="";for(const h of G.words)B.has(h.id)&&(J=J+h.word,W===-1&&(W=G.words.indexOf(h)));const v=ct();v.word=J,v.startTime=G.words[r].startTime,L.lyricLines[n].words=G.words.filter(h=>!B.has(h.id)),W!==-1&&L.lyricLines[n].words.splice(W,0,v)}})},e[15]=m,e[16]=n,e[17]=a,e[18]=r,e[19]=I):I=e[19];let z;e[20]!==d||e[21]!==I?(z=u.jsx(Ct,{disabled:d,onClick:I,children:"\u5408\u5E76\u5355\u8BCD"}),e[20]=d,e[21]=I,e[22]=z):z=e[22];let Y;return e[23]!==k||e[24]!==c||e[25]!==z?(Y=u.jsxs(bn,{children:[k,c,z]}),e[23]=k,e[24]=c,e[25]=z,e[26]=Y):Y=e[26],Y};globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}},globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}};const Ke=globalThis.jotaiAtomCache.get("/home/runner/work/amll-ttml-tool/amll-ttml-tool/src/components/LyricLinesView/lyric-word-view.tsx/isDraggingAtom",ye(!1));Ke.debugLabel="isDraggingAtom",Ke.debugLabel="isDraggingAtom";const tt=globalThis.jotaiAtomCache.get("/home/runner/work/amll-ttml-tool/amll-ttml-tool/src/components/LyricLinesView/lyric-word-view.tsx/draggingIdAtom",ye(""));tt.debugLabel="draggingIdAtom",tt.debugLabel="draggingIdAtom";const xt=t=>{let e;return e=t.length===0||t.length>0&&t.trim().length===0,e},tn=t=>{const e=Ze.c(27),{wordAtom:r,wordIndex:o,line:n,lineIndex:a}=t,s=U(r),p=Et(),m=Te(Je),w=Te(Ve);let f,x;e[0]!==r?(x=ye(v=>v(je).has(v(r).id)),e[0]=r,e[1]=x):x=e[1],f=x;const _=U(f),j=Te(je),[k,b]=K.useState(!1),A=U(at),c=xt(s.word),d=Mt(s.word,c);let I;const z=_&&y.selected,Y=c&&y.blank;let L;e[2]!==z||e[3]!==Y?(L=ze(y.lyricWord,y.edit,z,Y),e[2]=z,e[3]=Y,e[4]=L):L=e[4],I=L;const B=I;let G;e[5]!==m||e[6]!==a||e[7]!==s.word||e[8]!==o?(G=v=>{b(!1);const h=v.currentTarget.value;h!==s.word&&m(q=>{q.lyricLines[a].words[o].word=h})},e[5]=m,e[6]=a,e[7]=s.word,e[8]=o,e[9]=G):G=e[9];const W=G;let J;return e[10]!==B||e[11]!==d||e[12]!==m||e[13]!==k||e[14]!==_||e[15]!==n||e[16]!==a||e[17]!==W||e[18]!==w||e[19]!==j||e[20]!==p||e[21]!==A||e[22]!==s.id||e[23]!==s.word||e[24]!==r||e[25]!==o?(J=k?u.jsx(Ft,{autoFocus:!0,defaultValue:s.word,onBlur:W,onKeyDown:v=>{v.key==="Enter"&&W(v)}}):u.jsxs(yn,{onOpenChange:v=>{v&&(_||(j(h=>{h.clear(),h.add(s.id)}),w(h=>{h.clear(),h.add(n.id)})))},children:[u.jsx(Tn,{children:u.jsx("span",{draggable:A===ie.Edit,onDragStart:v=>{v.dataTransfer.dropEffect="move",p.set(Ke,!0),p.set(tt,s.id),v.stopPropagation()},onDragEnd:()=>{p.set(Ke,!1)},onDragOver:v=>{if(!p.get(Ke)||p.get(tt)===s.id||_)return;v.preventDefault(),v.dataTransfer.dropEffect="move";const h=v.currentTarget.getBoundingClientRect();v.clientX-h.left<h.width/2?(v.currentTarget.classList.add(y.dropLeft),v.currentTarget.classList.remove(y.dropRight)):(v.currentTarget.classList.remove(y.dropLeft),v.currentTarget.classList.add(y.dropRight))},onDrop:v=>{if(v.currentTarget.classList.remove(y.dropLeft),v.currentTarget.classList.remove(y.dropRight),!p.get(Ke))return;const h=v.currentTarget.getBoundingClientRect(),q=v.clientX-h.left,R=new Set(p.get(je)),X=p.get(tt);_||(R.clear(),R.add(X)),q<h.width/2?m(O=>{const Q=[];for(const E of O.lyricLines){const Fe=E.words.filter(i=>R.has(i.id));Q.push(...Fe),E.words=E.words.filter(i=>!R.has(i.id))}const ee=O.lyricLines.find(E=>E.id===n.id);if(!ee)return;const ae=ee.words.findIndex(E=>E.id===s.id);ae<0||ee.words.splice(ae,0,...Q)}):m(O=>{const Q=[];for(const E of O.lyricLines){const Fe=E.words.filter(i=>R.has(i.id));Q.push(...Fe),E.words=E.words.filter(i=>!R.has(i.id))}const ee=O.lyricLines.find(E=>E.id===n.id);if(!ee)return;const ae=ee.words.findIndex(E=>E.id===s.id);ae<0||ee.words.splice(ae+1,0,...Q)})},onDragLeave:on,className:B,onDoubleClick:()=>{b(!0)},onClick:v=>{v.stopPropagation(),v.preventDefault(),v.ctrlKey||v.metaKey?j(h=>{h.has(s.id)?h.delete(s.id):h.add(s.id)}):v.shiftKey?j(h=>{if(h.size>0){let q;q=Number.NaN;let R;R=Number.NaN,n.words.forEach((X,O)=>{h.has(X.id)&&(Number.isNaN(q)&&(q=O),Number.isNaN(R)&&(R=O),q=Math.min(q,O,o),R=Math.max(R,O,o))});for(let X=q;X<=R;X++)h.add(n.words[X].id)}else h.add(s.id)}):(w(h=>{(!h.has(n.id)||h.size!==1)&&(h.clear(),h.add(n.id))}),j(h=>{(!h.has(s.id)||h.size!==1)&&(h.clear(),h.add(s.id))}))},children:d})}),u.jsx(en,{wordAtom:r,wordIndex:o,lineIndex:a})]}),e[10]=B,e[11]=d,e[12]=m,e[13]=k,e[14]=_,e[15]=n,e[16]=a,e[17]=W,e[18]=w,e[19]=j,e[20]=p,e[21]=A,e[22]=s.id,e[23]=s.word,e[24]=r,e[25]=o,e[26]=J):J=e[26],J},rn=t=>{const e=Ze.c(38),{wordAtom:r,line:o}=t,n=U(r);let a,s;e[0]!==r?(s=ye(Q=>Q(je).has(Q(r).id)),e[0]=r,e[1]=s):s=e[1],a=s;const p=U(a),m=Te(je),w=Te(Ve),f=U(Jt),x=xt(n.word),_=Mt(n.word,x),j=K.useRef(null),k=K.useRef(null);let b;e[2]!==f?(b=()=>{if(!f)return;const Q=j.current?.animate([{backgroundColor:"var(--green-a8)"},{backgroundColor:"var(--green-a4)"}],{duration:500});return()=>{Q?.cancel()}},e[2]=f,e[3]=b):b=e[3];let A;e[4]!==f||e[5]!==n.startTime?(A=[n.startTime,f],e[4]=f,e[5]=n.startTime,e[6]=A):A=e[6],K.useEffect(b,A);let c;e[7]!==f?(c=()=>{if(!f)return;const Q=k.current?.animate([{backgroundColor:"var(--red-a8)"},{backgroundColor:"var(--red-a4)"}],{duration:500});return()=>{Q?.cancel()}},e[7]=f,e[8]=c):c=e[8];let d;e[9]!==f||e[10]!==n.endTime?(d=[n.endTime,f],e[9]=f,e[10]=n.endTime,e[11]=d):d=e[11],K.useEffect(c,d);let I;const z=p&&y.selected,Y=x&&y.blank;let L;e[12]!==z||e[13]!==Y?(L=ze(y.lyricWord,y.sync,z,Y),e[12]=z,e[13]=Y,e[14]=L):L=e[14],I=L;const B=I;let G;e[15]!==o.id||e[16]!==w||e[17]!==m||e[18]!==n.id?(G=Q=>{Q.stopPropagation(),Q.preventDefault(),w(ee=>{ee.clear(),ee.add(o.id)}),m(ee=>{ee.clear(),ee.add(n.id)})},e[15]=o.id,e[16]=w,e[17]=m,e[18]=n.id,e[19]=G):G=e[19];let W;e[20]===Symbol.for("react.memo_cache_sentinel")?(W=ze(y.startTime),e[20]=W):W=e[20];let J;e[21]!==n.startTime?(J=dt(n.startTime),e[21]=n.startTime,e[22]=J):J=e[22];let v;e[23]!==J?(v=u.jsx("div",{className:W,ref:j,children:J}),e[23]=J,e[24]=v):v=e[24];let h;e[25]!==_?(h=u.jsx("div",{className:y.displayWord,children:_}),e[25]=_,e[26]=h):h=e[26];let q;e[27]===Symbol.for("react.memo_cache_sentinel")?(q=ze(y.endTime),e[27]=q):q=e[27];let R;e[28]!==n.endTime?(R=dt(n.endTime),e[28]=n.endTime,e[29]=R):R=e[29];let X;e[30]!==R?(X=u.jsx("div",{className:q,ref:k,children:R}),e[30]=R,e[31]=X):X=e[31];let O;return e[32]!==B||e[33]!==G||e[34]!==v||e[35]!==h||e[36]!==X?(O=u.jsxs("div",{className:B,onClick:G,children:[v,h,X]}),e[32]=B,e[33]=G,e[34]=v,e[35]=h,e[36]=X,e[37]=O):O=e[37],O},Mt=(t,e)=>{let r;e:{if(t===""){r="\u7A7A\u767D";break e}if(e){r=`\u7A7A\u683C x${t.length}`;break e}r=t}return r},nn=K.memo(t=>{const e=Ze.c(16),{wordAtom:r,wordIndex:o,line:n,lineIndex:a}=t,s=U(r),p=U(at),m=xt(s.word);let w;e[0]!==n||e[1]!==a||e[2]!==p||e[3]!==r||e[4]!==o?(w=p===ie.Edit&&u.jsx(tn,{wordAtom:r,line:n,lineIndex:a,wordIndex:o}),e[0]=n,e[1]=a,e[2]=p,e[3]=r,e[4]=o,e[5]=w):w=e[5];let f;e[6]!==m||e[7]!==n||e[8]!==a||e[9]!==p||e[10]!==r||e[11]!==o?(f=p===ie.Sync&&!m&&u.jsx(rn,{wordAtom:r,line:n,lineIndex:a,wordIndex:o}),e[6]=m,e[7]=n,e[8]=a,e[9]=p,e[10]=r,e[11]=o,e[12]=f):f=e[12];let x;return e[13]!==w||e[14]!==f?(x=u.jsxs("div",{children:[w,f]}),e[13]=w,e[14]=f,e[15]=x):x=e[15],x});function on(t){t.currentTarget.classList.remove(y.dropLeft),t.currentTarget.classList.remove(y.dropRight)}globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}},globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}};const Ye=globalThis.jotaiAtomCache.get("/home/runner/work/amll-ttml-tool/amll-ttml-tool/src/components/LyricLinesView/lyric-line-view.tsx/isDraggingAtom",ye(!1));Ye.debugLabel="isDraggingAtom",Ye.debugLabel="isDraggingAtom";const sn=t=>{const e=Ze.c(5),{lineAtom:r,wordsContainerRef:o}=t,n=U(r),a=U(je);let s,p;return e[0]!==n.words||e[1]!==a||e[2]!==o.current?(s=()=>{const m=o.current;if(!m)return;let w=Number.NaN,f=0;for(const _ of n.words){if(a.has(_.id)){w=f;break}f++}if(Number.isNaN(w))return;const x=m.children[w];x&&m.scrollTo({left:x.offsetLeft-m.clientWidth/2,behavior:"instant"})},p=[n.words,a,o.current],e[0]=n.words,e[1]=a,e[2]=o.current,e[3]=s,e[4]=p):(s=e[3],p=e[4]),K.useEffect(s,p),null},qt=K.memo(t=>{const e=Ze.c(15),{lineAtom:r,lineIndex:o,type:n}=t,a=Te(Je),s=U(r),[p,m]=K.useState(!1);let w;e[0]!==a||e[1]!==s||e[2]!==o||e[3]!==n?(w=A=>{m(!1);const c=A.currentTarget.value;c!==s[n]&&a(d=>{d.lyricLines[o][n]=c})},e[0]=a,e[1]=s,e[2]=o,e[3]=n,e[4]=w):w=e[4];const f=w;let x;x=n==="translatedLyric"?"\u7FFB\u8BD1\uFF1A":"\u97F3\u8BD1\uFF1A";const _=x;let j;e[5]!==_?(j=u.jsx(it,{size:"2",children:_}),e[5]=_,e[6]=j):j=e[6];let k;e[7]!==p||e[8]!==s||e[9]!==f||e[10]!==n?(k=p?u.jsx(Ft,{autoFocus:!0,size:"1",defaultValue:s[n],onBlur:f,onKeyDown:A=>{A.key==="Enter"&&f(A)}}):u.jsx(It,{size:"2",color:"gray",variant:"ghost",onClick:A=>{A.stopPropagation(),m(!0)},children:s[n]||u.jsx(it,{color:"gray",children:"\u65E0"})}),e[7]=p,e[8]=s,e[9]=f,e[10]=n,e[11]=k):k=e[11];let b;return e[12]!==j||e[13]!==k?(b=u.jsxs(Qe,{align:"baseline",children:[j,k]}),e[12]=j,e[13]=k,e[14]=b):b=e[14],b}),ln=K.memo(t=>{const e=Ze.c(130),{lineAtom:r,lineIndex:o}=t,n=U(r),a=Te(Ve);let s,p;e[0]!==n.id?(p=g=>g(Ve).has(n.id),e[0]=n.id,e[1]=p):p=e[1];let m;e[2]!==n.id||e[3]!==p?(m=ye(p),e[2]=n.id,e[3]=p,e[4]=m):m=e[4],s=m;const w=s;let f,x;e[5]!==r?(x=Qt(ye(g=>g(r).words)),e[5]=r,e[6]=x):x=e[6],f=x;const _=U(f),j=U(w),k=Te(je),b=Te(Je),A=U(Jt),c=U(at),d=Et(),I=K.useRef(null),z=K.useRef(null),Y=K.useRef(null),[L,B]=K.useState(!1);let G;e[7]!==A?(G=()=>{if(!A)return;const g=z.current?.animate([{backgroundColor:"var(--green-a8)"},{backgroundColor:"var(--green-a4)"}],{duration:500});return()=>{g?.cancel()}},e[7]=A,e[8]=G):G=e[8];let W;e[9]!==n.startTime||e[10]!==A?(W=[n.startTime,A],e[9]=n.startTime,e[10]=A,e[11]=W):W=e[11],K.useEffect(G,W);let J,v;e[12]!==c?(J=()=>{c!==ie.Edit&&B(!1)},v=[c],e[12]=c,e[13]=J,e[14]=v):(J=e[13],v=e[14]),K.useLayoutEffect(J,v);let h;e[15]!==A?(h=()=>{if(!A)return;const g=Y.current?.animate([{backgroundColor:"var(--red-a8)"},{backgroundColor:"var(--red-a4)"}],{duration:500});return()=>{g?.cancel()}},e[15]=A,e[16]=h):h=e[16];let q;e[17]!==n.endTime||e[18]!==A?(q=[n.endTime,A],e[17]=n.endTime,e[18]=A,e[19]=q):q=e[19],K.useEffect(h,q);let R;e[20]!==r?(R=u.jsx(sn,{lineAtom:r,wordsContainerRef:I}),e[20]=r,e[21]=R):R=e[21];let X;e[22]!==b||e[23]!==L||e[24]!==o?(X=L&&u.jsx(It,{mx:"2",my:"1",variant:"soft",size:"1",style:{width:"calc(100% - var(--space-4))"},onClick:()=>{b(g=>{g.lyricLines.splice(o,0,Ut())}),B(!1)},children:"\u5728\u6B64\u63D2\u5165\u65B0\u884C"}),e[22]=b,e[23]=L,e[24]=o,e[25]=X):X=e[25];const O=j&&y.selected,Q=c===ie.Sync&&y.sync,ee=c===ie.Edit&&y.edit,ae=n.ignoreSync&&y.ignoreSync;let E;e[26]!==O||e[27]!==Q||e[28]!==ee||e[29]!==ae?(E=ze(y.lyricLine,O,Q,ee,ae),e[26]=O,e[27]=Q,e[28]=ee,e[29]=ae,e[30]=E):E=e[30];const Fe=c===ie.Edit;let i;e[31]!==n.id||e[32]!==d?(i=g=>{g.dataTransfer.dropEffect="move",d.set(Ye,!0),d.set(qe,n.id)},e[31]=n.id,e[32]=d,e[33]=i):i=e[33];let xe;e[34]!==d?(xe=()=>{d.set(Ye,!1)},e[34]=d,e[35]=xe):xe=e[35];let ne;e[36]!==n.id||e[37]!==j||e[38]!==d?(ne=g=>{if(!d.get(Ye)||d.get(qe)===n.id||j)return;g.preventDefault(),g.dataTransfer.dropEffect="move";const P=g.currentTarget.getBoundingClientRect();g.clientY-P.top<P.height/2?(g.currentTarget.classList.add(y.dropTop),g.currentTarget.classList.remove(y.dropBottom)):(g.currentTarget.classList.remove(y.dropTop),g.currentTarget.classList.add(y.dropBottom))},e[36]=n.id,e[37]=j,e[38]=d,e[39]=ne):ne=e[39];let oe;e[40]!==b||e[41]!==n.id||e[42]!==d?(oe=g=>{if(g.currentTarget.classList.remove(y.dropTop),g.currentTarget.classList.remove(y.dropBottom),!d.get(Ye))return;const P=g.currentTarget.getBoundingClientRect(),l=g.clientY-P.top,T=d.get(Ve),S=T.has(d.get(qe))?T:new Set([d.get(qe)]);l<P.height/2?b(C=>{const V=C.lyricLines.filter(D=>!S.has(D.id)),me=C.lyricLines.filter(D=>S.has(D.id)),M=V.findIndex(D=>D.id===n.id);M<0||(C.lyricLines=[...V.slice(0,M),...me,...V.slice(M)])}):b(C=>{const V=C.lyricLines.filter(D=>!S.has(D.id)),me=C.lyricLines.filter(D=>S.has(D.id)),M=V.findIndex(D=>D.id===n.id);M<0||(C.lyricLines=[...V.slice(0,M+1),...me,...V.slice(M+2)])})},e[40]=b,e[41]=n.id,e[42]=d,e[43]=oe):oe=e[43];let Le;e[44]!==n.id||e[45]!==o||e[46]!==a||e[47]!==k||e[48]!==d?(Le=g=>{g.stopPropagation(),g.preventDefault(),g.ctrlKey?a(P=>{P.has(n.id)?P.delete(n.id):P.add(n.id)}):g.shiftKey?a(P=>{if(P.size>0){let l;l=Number.NaN;let T;T=Number.NaN;const S=d.get(Je).lyricLines;S.forEach((C,V)=>{P.has(C.id)&&(Number.isNaN(l)&&(l=V),Number.isNaN(T)&&(T=V),l=Math.min(l,V,o),T=Math.max(T,V,o))});for(let C=l;C<=T;C++)P.add(S[C].id)}else P.add(n.id)}):(a(P=>{(!P.has(n.id)||P.size!==1)&&(P.clear(),P.add(n.id))}),k(an))},e[44]=n.id,e[45]=o,e[46]=a,e[47]=k,e[48]=d,e[49]=Le):Le=e[49];let Xe;e[50]===Symbol.for("react.memo_cache_sentinel")?(Xe={minWidth:"2em"},e[50]=Xe):Xe=e[50];let de;e[51]!==o?(de=u.jsx(it,{style:Xe,align:"center",color:"gray",children:o}),e[51]=o,e[52]=de):de=e[52];let Ie;e[53]!==n.isBG?(Ie=n.isBG&&u.jsx(tr,{color:"#4466FF"}),e[53]=n.isBG,e[54]=Ie):Ie=e[54];let te;e[55]!==n.isDuet?(te=n.isDuet&&u.jsx(er,{color:"#44AA33"}),e[55]=n.isDuet,e[56]=te):te=e[56];let Se;e[57]!==de||e[58]!==Ie||e[59]!==te?(Se=u.jsxs(Qe,{direction:"column",align:"center",justify:"center",ml:"3",children:[de,Ie,te]}),e[57]=de,e[58]=Ie,e[59]=te,e[60]=Se):Se=e[60];const _e=c===ie.Edit&&y.edit,Ee=c===ie.Sync&&y.sync;let ue;e[61]!==_e||e[62]!==Ee?(ue=ze(y.lyricLineContainer,_e,Ee),e[61]=_e,e[62]=Ee,e[63]=ue):ue=e[63];const Ne=c===ie.Edit&&y.edit,Ge=c===ie.Sync&&y.sync;let ke;e[64]!==Ne||e[65]!==Ge?(ke=ze(y.lyricWordsContainer,Ne,Ge),e[64]=Ne,e[65]=Ge,e[66]=ke):ke=e[66];let pe;if(e[67]!==b||e[68]!==L||e[69]!==n||e[70]!==o||e[71]!==_){let g;e[73]!==b||e[74]!==L||e[75]!==n||e[76]!==o?(g=(P,l)=>u.jsxs(K.Fragment,{children:[L&&u.jsx(St,{size:"1",variant:"soft",onClick:T=>{T.preventDefault(),T.stopPropagation(),b(S=>{S.lyricLines[o].words.splice(l,0,ct())})},children:u.jsx(ut,{})}),u.jsx(nn,{wordAtom:P,wordIndex:l,line:n,lineIndex:o})]},`word-${P}-${l}`),e[73]=b,e[74]=L,e[75]=n,e[76]=o,e[77]=g):g=e[77],pe=_.map(g),e[67]=b,e[68]=L,e[69]=n,e[70]=o,e[71]=_,e[72]=pe}else pe=e[72];let ce;e[78]!==b||e[79]!==L||e[80]!==o?(ce=L&&u.jsx(St,{size:"1",variant:"soft",onClick:g=>{g.preventDefault(),g.stopPropagation(),b(P=>{P.lyricLines[o].words.push(ct())})},children:u.jsx(ut,{})}),e[78]=b,e[79]=L,e[80]=o,e[81]=ce):ce=e[81];let ve;e[82]!==b||e[83]!==o||e[84]!==c||e[85]!==_.length?(ve=c===ie.Edit&&u.jsx(Ft,{placeholder:"\u63D2\u5165\u5355\u8BCD\u2026",className:ze(y.insertWordField,_.length===0&&y.empty),style:{alignSelf:"center"},onKeyDown:g=>{g.key==="Enter"&&(g.preventDefault(),g.stopPropagation(),b(P=>{P.lyricLines[o].words.push({...ct(),word:g.currentTarget.value})}),g.currentTarget.value="")}}),e[82]=b,e[83]=o,e[84]=c,e[85]=_.length,e[86]=ve):ve=e[86];let se;e[87]!==ke||e[88]!==pe||e[89]!==ce||e[90]!==ve?(se=u.jsxs("div",{className:ke,ref:I,children:[pe,ce,ve]}),e[87]=ke,e[88]=pe,e[89]=ce,e[90]=ve,e[91]=se):se=e[91];let Ae;e[92]!==r||e[93]!==o||e[94]!==c?(Ae=c===ie.Edit&&u.jsxs(u.Fragment,{children:[u.jsx(qt,{lineAtom:r,lineIndex:o,type:"translatedLyric"}),u.jsx(qt,{lineAtom:r,lineIndex:o,type:"romanLyric"})]}),e[92]=r,e[93]=o,e[94]=c,e[95]=Ae):Ae=e[95];let we;e[96]!==ue||e[97]!==se||e[98]!==Ae?(we=u.jsxs("div",{className:ue,ref:I,children:[se,Ae]}),e[96]=ue,e[97]=se,e[98]=Ae,e[99]=we):we=e[99];let N;e[100]!==L||e[101]!==c?(N=c===ie.Edit&&u.jsx(Qe,{p:"3",children:u.jsx(St,{size:"1",variant:L?"solid":"soft",onClick:g=>{g.preventDefault(),g.stopPropagation(),B(dn)},children:u.jsx(ut,{})})}),e[100]=L,e[101]=c,e[102]=N):N=e[102];let $;e[103]!==n.endTime||e[104]!==n.startTime||e[105]!==c?($=c===ie.Sync&&u.jsxs(Qe,{pr:"3",gap:"1",direction:"column",align:"stretch",children:[u.jsx("div",{className:y.startTime,ref:z,children:dt(n.startTime)}),u.jsx("div",{className:y.endTime,ref:Y,children:dt(n.endTime)})]}),e[103]=n.endTime,e[104]=n.startTime,e[105]=c,e[106]=$):$=e[106];let Pe;e[107]!==Se||e[108]!==we||e[109]!==N||e[110]!==$?(Pe=u.jsxs("div",{children:[Se,we,N,$]}),e[107]=Se,e[108]=we,e[109]=N,e[110]=$,e[111]=Pe):Pe=e[111];let De;e[112]!==E||e[113]!==Fe||e[114]!==i||e[115]!==xe||e[116]!==ne||e[117]!==oe||e[118]!==Le||e[119]!==Pe?(De=u.jsx(Qe,{mx:"2",my:"1",direction:"row",className:E,align:"center",gapX:"4",draggable:Fe,onDragStart:i,onDragEnd:xe,onDragOver:ne,onDrop:oe,onDragLeave:cn,onClick:Le,asChild:!0,children:Pe}),e[112]=E,e[113]=Fe,e[114]=i,e[115]=xe,e[116]=ne,e[117]=oe,e[118]=Le,e[119]=Pe,e[120]=De):De=e[120];let fe;e[121]!==b||e[122]!==L||e[123]!==o?(fe=L&&u.jsx(It,{mx:"2",my:"1",variant:"soft",size:"1",style:{width:"calc(100% - var(--space-4))"},onClick:()=>{b(g=>{g.lyricLines.splice(o+1,0,Ut())}),B(!1)},children:"\u5728\u6B64\u63D2\u5165\u65B0\u884C"}),e[121]=b,e[122]=L,e[123]=o,e[124]=fe):fe=e[124];let He;return e[125]!==R||e[126]!==X||e[127]!==De||e[128]!==fe?(He=u.jsxs(u.Fragment,{children:[R,X,De,fe]}),e[125]=R,e[126]=X,e[127]=De,e[128]=fe,e[129]=He):He=e[129],He});function cn(t){t.currentTarget.classList.remove(y.dropTop),t.currentTarget.classList.remove(y.dropBottom)}function an(t){t.size!==0&&t.clear()}function dn(t){return!t}globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}},globalThis.jotaiAtomCache=globalThis.jotaiAtomCache||{cache:new Map,get(t,e){return this.cache.has(t)?this.cache.get(t):(this.cache.set(t,e),e)}};const Lt=globalThis.jotaiAtomCache.get("/home/runner/work/amll-ttml-tool/amll-ttml-tool/src/components/LyricLinesView/index.tsx/lyricLinesOnlyAtom",Qt(Rr(Je,t=>t.prop("lyricLines"))));Lt.debugLabel="lyricLinesOnlyAtom",Lt.debugLabel="lyricLinesOnlyAtom",kt=K.forwardRef((t,e)=>{const r=U(Lt),o=Te(Ve),n=Te(je),a=K.useRef(null),s=K.useRef(null),p=U(at),m=K.useMemo(()=>ye(f=>{if(p!==ie.Sync)return;const x=s.current;if(!x||!x.parentElement)return;const _=f(Ve);let j=Number.NaN,k=0;for(const b of r){const A=f(b);if(_.has(A.id)){j=k;break}k++}if(!Number.isNaN(j))return j}),[r,p]),w=U(m);return K.useEffect(()=>{if(w===void 0)return;const f=s.current;if(!f)return;const x=f.parentElement;x&&a.current?.scrollToIndex({index:w,offset:x.clientHeight/-2+50})},[w]),K.useImperativeHandle(e,()=>s.current,[]),r.length===0?u.jsxs(Qe,{flexGrow:"1",gap:"2",align:"center",justify:"center",direction:"column",height:"100%",ref:e,children:[u.jsx(it,{color:"gray",children:"\u6CA1\u6709\u6B4C\u8BCD\u884C"}),u.jsx(it,{color:"gray",children:"\u5728\u9876\u90E8\u9762\u677F\u4E2D\u6DFB\u52A0\u65B0\u6B4C\u8BCD\u884C\u6216\u4ECE\u83DC\u5355\u680F\u6253\u5F00 / \u5BFC\u5165\u5DF2\u6709\u6B4C\u8BCD"})]}):u.jsx(xn,{flexGrow:"1",style:{padding:p===ie.Sync?"20vh 0":void 0,maxHeight:"100%",overflowY:"auto"},onClick:f=>{o(x=>x.clear()),n(x=>x.clear()),f.stopPropagation()},ref:s,children:u.jsx(Pr.ViewportList,{overscan:10,items:r,ref:a,viewportRef:s,children:(f,x)=>u.jsx(ln,{lineAtom:f,lineIndex:x},`${f}`)})})})});export{kt as LyricLinesView,_n as __tla,kt as default};
