!function(t,e){t&&!t.getElementById("livereloadscript")&&((e=t.createElement("script")).async=1,e.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",e.id="livereloadscript",t.getElementsByTagName("head")[0].appendChild(e))}(self.document),function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(require("jquery"),require("underscore")):"function"==typeof define&&define.amd?define(["jquery","underscore"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).$,t._)}(this,(function(t,e){"use strict";function r(t,e,r,n){return new(r||(r=Promise))((function(o,a){function c(t){try{u(n.next(t))}catch(t){a(t)}}function i(t){try{u(n.throw(t))}catch(t){a(t)}}function u(t){var e;t.done?o(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e)}))).then(c,i)}u((n=n.apply(t,e||[])).next())}))}!function(t,e){void 0===e&&(e={});var r=e.insertAt;if(t&&"undefined"!=typeof document){var n=document.head||document.getElementsByTagName("head")[0],o=document.createElement("style");o.type="text/css","top"===r&&n.firstChild?n.insertBefore(o,n.firstChild):n.appendChild(o),o.styleSheet?o.styleSheet.cssText=t:o.appendChild(document.createTextNode(t))}}(".box {\n  width: 200px;\n  height: 200px;\n  border-radius: 25px;\n  background-color: red;\n}");var n="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var o=function(){this.__data__=[],this.size=0};var a=function(t,e){return t===e||t!=t&&e!=e},c=a;var i=function(t,e){for(var r=t.length;r--;)if(c(t[r][0],e))return r;return-1},u=i,s=Array.prototype.splice;var f=function(t){var e=this.__data__,r=u(e,t);return!(r<0)&&(r==e.length-1?e.pop():s.call(e,r,1),--this.size,!0)},l=i;var p=function(t){var e=this.__data__,r=l(e,t);return r<0?void 0:e[r][1]},v=i;var b=i;var y=function(t,e){var r=this.__data__,n=b(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this},d=o,h=f,j=p,_=function(t){return v(this.__data__,t)>-1},g=y;function w(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}w.prototype.clear=d,w.prototype.delete=h,w.prototype.get=j,w.prototype.has=_,w.prototype.set=g;var O=w,m=O;var A=function(){this.__data__=new m,this.size=0};var x=function(t){var e=this.__data__,r=e.delete(t);return this.size=e.size,r};var S=function(t){return this.__data__.get(t)};var P=function(t){return this.__data__.has(t)},z="object"==typeof n&&n&&n.Object===Object&&n,T=z,U="object"==typeof self&&self&&self.Object===Object&&self,E=T||U||Function("return this")(),F=E.Symbol,I=F,B=Object.prototype,N=B.hasOwnProperty,C=B.toString,M=I?I.toStringTag:void 0;var $=function(t){var e=N.call(t,M),r=t[M];try{t[M]=void 0;var n=!0}catch(t){}var o=C.call(t);return n&&(e?t[M]=r:delete t[M]),o},k=Object.prototype.toString;var D=$,q=function(t){return k.call(t)},R="[object Null]",V="[object Undefined]",W=F?F.toStringTag:void 0;var L=function(t){return null==t?void 0===t?V:R:W&&W in Object(t)?D(t):q(t)};var G=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)},H=L,J=G,K="[object AsyncFunction]",Q="[object Function]",X="[object GeneratorFunction]",Y="[object Proxy]";var Z,tt=function(t){if(!J(t))return!1;var e=H(t);return e==Q||e==X||e==K||e==Y},et=E["__core-js_shared__"],rt=(Z=/[^.]+$/.exec(et&&et.keys&&et.keys.IE_PROTO||""))?"Symbol(src)_1."+Z:"";var nt=function(t){return!!rt&&rt in t},ot=Function.prototype.toString;var at=function(t){if(null!=t){try{return ot.call(t)}catch(t){}try{return t+""}catch(t){}}return""},ct=tt,it=nt,ut=G,st=at,ft=/^\[object .+?Constructor\]$/,lt=Function.prototype,pt=Object.prototype,vt=lt.toString,bt=pt.hasOwnProperty,yt=RegExp("^"+vt.call(bt).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var dt=function(t){return!(!ut(t)||it(t))&&(ct(t)?yt:ft).test(st(t))},ht=function(t,e){return null==t?void 0:t[e]};var jt=function(t,e){var r=ht(t,e);return dt(r)?r:void 0},_t=jt(E,"Map"),gt=jt(Object,"create"),wt=gt;var Ot=function(){this.__data__=wt?wt(null):{},this.size=0};var mt=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},At=gt,xt="__lodash_hash_undefined__",St=Object.prototype.hasOwnProperty;var Pt=function(t){var e=this.__data__;if(At){var r=e[t];return r===xt?void 0:r}return St.call(e,t)?e[t]:void 0},zt=gt,Tt=Object.prototype.hasOwnProperty;var Ut=function(t){var e=this.__data__;return zt?void 0!==e[t]:Tt.call(e,t)},Et=gt,Ft="__lodash_hash_undefined__";var It=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=Et&&void 0===e?Ft:e,this},Bt=Ot,Nt=mt,Ct=Pt,Mt=Ut,$t=It;function kt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}kt.prototype.clear=Bt,kt.prototype.delete=Nt,kt.prototype.get=Ct,kt.prototype.has=Mt,kt.prototype.set=$t;var Dt=kt,qt=O,Rt=_t;var Vt=function(t){var e=typeof t;return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t};var Wt=function(t,e){var r=t.__data__;return Vt(e)?r["string"==typeof e?"string":"hash"]:r.map},Lt=Wt;var Gt=Wt;var Ht=Wt;var Jt=Wt;var Kt=function(t,e){var r=Jt(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this},Qt=function(){this.size=0,this.__data__={hash:new Dt,map:new(Rt||qt),string:new Dt}},Xt=function(t){var e=Lt(this,t).delete(t);return this.size-=e?1:0,e},Yt=function(t){return Gt(this,t).get(t)},Zt=function(t){return Ht(this,t).has(t)},te=Kt;function ee(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}ee.prototype.clear=Qt,ee.prototype.delete=Xt,ee.prototype.get=Yt,ee.prototype.has=Zt,ee.prototype.set=te;var re=O,ne=_t,oe=ee,ae=200;var ce=function(t,e){var r=this.__data__;if(r instanceof re){var n=r.__data__;if(!ne||n.length<ae-1)return n.push([t,e]),this.size=++r.size,this;r=this.__data__=new oe(n)}return r.set(t,e),this.size=r.size,this},ie=O,ue=A,se=x,fe=S,le=P,pe=ce;function ve(t){var e=this.__data__=new ie(t);this.size=e.size}ve.prototype.clear=ue,ve.prototype.delete=se,ve.prototype.get=fe,ve.prototype.has=le,ve.prototype.set=pe;var be=ve;var ye=function(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r,t););return t},de=jt,he=function(){try{var t=de(Object,"defineProperty");return t({},"",{}),t}catch(t){}}();var je=function(t,e,r){"__proto__"==e&&he?he(t,e,{configurable:!0,enumerable:!0,value:r,writable:!0}):t[e]=r},_e=je,ge=a,we=Object.prototype.hasOwnProperty;var Oe=function(t,e,r){var n=t[e];we.call(t,e)&&ge(n,r)&&(void 0!==r||e in t)||_e(t,e,r)},me=Oe,Ae=je;var xe=function(t,e,r,n){var o=!r;r||(r={});for(var a=-1,c=e.length;++a<c;){var i=e[a],u=n?n(r[i],t[i],i,r,t):void 0;void 0===u&&(u=t[i]),o?Ae(r,i,u):me(r,i,u)}return r};var Se=function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n};var Pe=function(t){return null!=t&&"object"==typeof t},ze=L,Te=Pe,Ue="[object Arguments]";var Ee=function(t){return Te(t)&&ze(t)==Ue},Fe=Pe,Ie=Object.prototype,Be=Ie.hasOwnProperty,Ne=Ie.propertyIsEnumerable,Ce=Ee(function(){return arguments}())?Ee:function(t){return Fe(t)&&Be.call(t,"callee")&&!Ne.call(t,"callee")},Me=Ce,$e=Array.isArray,ke={};var De=function(){return!1};!function(t,e){var r=E,n=De,o=e&&!e.nodeType&&e,a=o&&t&&!t.nodeType&&t,c=a&&a.exports===o?r.Buffer:void 0,i=(c?c.isBuffer:void 0)||n;t.exports=i}({get exports(){return ke},set exports(t){ke=t}},ke);var qe=9007199254740991,Re=/^(?:0|[1-9]\d*)$/;var Ve=function(t,e){var r=typeof t;return!!(e=null==e?qe:e)&&("number"==r||"symbol"!=r&&Re.test(t))&&t>-1&&t%1==0&&t<e},We=9007199254740991;var Le=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=We},Ge=L,He=Le,Je=Pe,Ke={};Ke["[object Float32Array]"]=Ke["[object Float64Array]"]=Ke["[object Int8Array]"]=Ke["[object Int16Array]"]=Ke["[object Int32Array]"]=Ke["[object Uint8Array]"]=Ke["[object Uint8ClampedArray]"]=Ke["[object Uint16Array]"]=Ke["[object Uint32Array]"]=!0,Ke["[object Arguments]"]=Ke["[object Array]"]=Ke["[object ArrayBuffer]"]=Ke["[object Boolean]"]=Ke["[object DataView]"]=Ke["[object Date]"]=Ke["[object Error]"]=Ke["[object Function]"]=Ke["[object Map]"]=Ke["[object Number]"]=Ke["[object Object]"]=Ke["[object RegExp]"]=Ke["[object Set]"]=Ke["[object String]"]=Ke["[object WeakMap]"]=!1;var Qe=function(t){return Je(t)&&He(t.length)&&!!Ke[Ge(t)]};var Xe=function(t){return function(e){return t(e)}},Ye={};!function(t,e){var r=z,n=e&&!e.nodeType&&e,o=n&&t&&!t.nodeType&&t,a=o&&o.exports===n&&r.process,c=function(){try{var t=o&&o.require&&o.require("util").types;return t||a&&a.binding&&a.binding("util")}catch(t){}}();t.exports=c}({get exports(){return Ye},set exports(t){Ye=t}},Ye);var Ze=Qe,tr=Xe,er=Ye&&Ye.isTypedArray,rr=er?tr(er):Ze,nr=Se,or=Me,ar=$e,cr=ke,ir=Ve,ur=rr,sr=Object.prototype.hasOwnProperty;var fr=function(t,e){var r=ar(t),n=!r&&or(t),o=!r&&!n&&cr(t),a=!r&&!n&&!o&&ur(t),c=r||n||o||a,i=c?nr(t.length,String):[],u=i.length;for(var s in t)!e&&!sr.call(t,s)||c&&("length"==s||o&&("offset"==s||"parent"==s)||a&&("buffer"==s||"byteLength"==s||"byteOffset"==s)||ir(s,u))||i.push(s);return i},lr=Object.prototype;var pr=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||lr)};var vr=function(t,e){return function(r){return t(e(r))}},br=vr(Object.keys,Object),yr=pr,dr=br,hr=Object.prototype.hasOwnProperty;var jr=tt,_r=Le;var gr=function(t){return null!=t&&_r(t.length)&&!jr(t)},wr=fr,Or=function(t){if(!yr(t))return dr(t);var e=[];for(var r in Object(t))hr.call(t,r)&&"constructor"!=r&&e.push(r);return e},mr=gr;var Ar=function(t){return mr(t)?wr(t):Or(t)},xr=xe,Sr=Ar;var Pr=function(t,e){return t&&xr(e,Sr(e),t)};var zr=G,Tr=pr,Ur=function(t){var e=[];if(null!=t)for(var r in Object(t))e.push(r);return e},Er=Object.prototype.hasOwnProperty;var Fr=fr,Ir=function(t){if(!zr(t))return Ur(t);var e=Tr(t),r=[];for(var n in t)("constructor"!=n||!e&&Er.call(t,n))&&r.push(n);return r},Br=gr;var Nr=function(t){return Br(t)?Fr(t,!0):Ir(t)},Cr=xe,Mr=Nr;var $r=function(t,e){return t&&Cr(e,Mr(e),t)},kr={};!function(t,e){var r=E,n=e&&!e.nodeType&&e,o=n&&t&&!t.nodeType&&t,a=o&&o.exports===n?r.Buffer:void 0,c=a?a.allocUnsafe:void 0;t.exports=function(t,e){if(e)return t.slice();var r=t.length,n=c?c(r):new t.constructor(r);return t.copy(n),n}}({get exports(){return kr},set exports(t){kr=t}},kr);var Dr=function(t,e){var r=-1,n=t.length;for(e||(e=Array(n));++r<n;)e[r]=t[r];return e};var qr=function(){return[]},Rr=function(t,e){for(var r=-1,n=null==t?0:t.length,o=0,a=[];++r<n;){var c=t[r];e(c,r,t)&&(a[o++]=c)}return a},Vr=qr,Wr=Object.prototype.propertyIsEnumerable,Lr=Object.getOwnPropertySymbols,Gr=Lr?function(t){return null==t?[]:(t=Object(t),Rr(Lr(t),(function(e){return Wr.call(t,e)})))}:Vr,Hr=xe,Jr=Gr;var Kr=function(t,e){return Hr(t,Jr(t),e)};var Qr=function(t,e){for(var r=-1,n=e.length,o=t.length;++r<n;)t[o+r]=e[r];return t},Xr=vr(Object.getPrototypeOf,Object),Yr=Qr,Zr=Xr,tn=Gr,en=qr,rn=Object.getOwnPropertySymbols?function(t){for(var e=[];t;)Yr(e,tn(t)),t=Zr(t);return e}:en,nn=xe,on=rn;var an=function(t,e){return nn(t,on(t),e)},cn=Qr,un=$e;var sn=function(t,e,r){var n=e(t);return un(t)?n:cn(n,r(t))},fn=sn,ln=Gr,pn=Ar;var vn=function(t){return fn(t,pn,ln)},bn=sn,yn=rn,dn=Nr;var hn=function(t){return bn(t,dn,yn)},jn=jt(E,"DataView"),_n=_t,gn=jt(E,"Promise"),wn=jt(E,"Set"),On=jt(E,"WeakMap"),mn=L,An=at,xn="[object Map]",Sn="[object Promise]",Pn="[object Set]",zn="[object WeakMap]",Tn="[object DataView]",Un=An(jn),En=An(_n),Fn=An(gn),In=An(wn),Bn=An(On),Nn=mn;(jn&&Nn(new jn(new ArrayBuffer(1)))!=Tn||_n&&Nn(new _n)!=xn||gn&&Nn(gn.resolve())!=Sn||wn&&Nn(new wn)!=Pn||On&&Nn(new On)!=zn)&&(Nn=function(t){var e=mn(t),r="[object Object]"==e?t.constructor:void 0,n=r?An(r):"";if(n)switch(n){case Un:return Tn;case En:return xn;case Fn:return Sn;case In:return Pn;case Bn:return zn}return e});var Cn=Nn,Mn=Object.prototype.hasOwnProperty;var $n=function(t){var e=t.length,r=new t.constructor(e);return e&&"string"==typeof t[0]&&Mn.call(t,"index")&&(r.index=t.index,r.input=t.input),r},kn=E.Uint8Array;var Dn=function(t){var e=new t.constructor(t.byteLength);return new kn(e).set(new kn(t)),e},qn=Dn;var Rn=function(t,e){var r=e?qn(t.buffer):t.buffer;return new t.constructor(r,t.byteOffset,t.byteLength)},Vn=/\w*$/;var Wn=function(t){var e=new t.constructor(t.source,Vn.exec(t));return e.lastIndex=t.lastIndex,e},Ln=F?F.prototype:void 0,Gn=Ln?Ln.valueOf:void 0;var Hn=Dn;var Jn=Dn,Kn=Rn,Qn=Wn,Xn=function(t){return Gn?Object(Gn.call(t)):{}},Yn=function(t,e){var r=e?Hn(t.buffer):t.buffer;return new t.constructor(r,t.byteOffset,t.length)},Zn="[object Boolean]",to="[object Date]",eo="[object Map]",ro="[object Number]",no="[object RegExp]",oo="[object Set]",ao="[object String]",co="[object Symbol]",io="[object ArrayBuffer]",uo="[object DataView]",so="[object Float32Array]",fo="[object Float64Array]",lo="[object Int8Array]",po="[object Int16Array]",vo="[object Int32Array]",bo="[object Uint8Array]",yo="[object Uint8ClampedArray]",ho="[object Uint16Array]",jo="[object Uint32Array]";var _o=function(t,e,r){var n=t.constructor;switch(e){case io:return Jn(t);case Zn:case to:return new n(+t);case uo:return Kn(t,r);case so:case fo:case lo:case po:case vo:case bo:case yo:case ho:case jo:return Yn(t,r);case eo:return new n;case ro:case ao:return new n(t);case no:return Qn(t);case oo:return new n;case co:return Xn(t)}},go=G,wo=Object.create,Oo=function(){function t(){}return function(e){if(!go(e))return{};if(wo)return wo(e);t.prototype=e;var r=new t;return t.prototype=void 0,r}}(),mo=Xr,Ao=pr;var xo=function(t){return"function"!=typeof t.constructor||Ao(t)?{}:Oo(mo(t))},So=Cn,Po=Pe,zo="[object Map]";var To=function(t){return Po(t)&&So(t)==zo},Uo=Xe,Eo=Ye&&Ye.isMap,Fo=Eo?Uo(Eo):To,Io=Cn,Bo=Pe,No="[object Set]";var Co=function(t){return Bo(t)&&Io(t)==No},Mo=Xe,$o=Ye&&Ye.isSet,ko=$o?Mo($o):Co,Do=be,qo=ye,Ro=Oe,Vo=Pr,Wo=$r,Lo=kr,Go=Dr,Ho=Kr,Jo=an,Ko=vn,Qo=hn,Xo=Cn,Yo=$n,Zo=_o,ta=xo,ea=$e,ra=ke,na=Fo,oa=G,aa=ko,ca=Ar,ia=Nr,ua=1,sa=2,fa=4,la="[object Arguments]",pa="[object Function]",va="[object GeneratorFunction]",ba="[object Object]",ya={};ya[la]=ya["[object Array]"]=ya["[object ArrayBuffer]"]=ya["[object DataView]"]=ya["[object Boolean]"]=ya["[object Date]"]=ya["[object Float32Array]"]=ya["[object Float64Array]"]=ya["[object Int8Array]"]=ya["[object Int16Array]"]=ya["[object Int32Array]"]=ya["[object Map]"]=ya["[object Number]"]=ya[ba]=ya["[object RegExp]"]=ya["[object Set]"]=ya["[object String]"]=ya["[object Symbol]"]=ya["[object Uint8Array]"]=ya["[object Uint8ClampedArray]"]=ya["[object Uint16Array]"]=ya["[object Uint32Array]"]=!0,ya["[object Error]"]=ya[pa]=ya["[object WeakMap]"]=!1;var da=function t(e,r,n,o,a,c){var i,u=r&ua,s=r&sa,f=r&fa;if(n&&(i=a?n(e,o,a,c):n(e)),void 0!==i)return i;if(!oa(e))return e;var l=ea(e);if(l){if(i=Yo(e),!u)return Go(e,i)}else{var p=Xo(e),v=p==pa||p==va;if(ra(e))return Lo(e,u);if(p==ba||p==la||v&&!a){if(i=s||v?{}:ta(e),!u)return s?Jo(e,Wo(i,e)):Ho(e,Vo(i,e))}else{if(!ya[p])return a?e:{};i=Zo(e,p,u)}}c||(c=new Do);var b=c.get(e);if(b)return b;c.set(e,i),aa(e)?e.forEach((function(o){i.add(t(o,r,n,o,e,c))})):na(e)&&e.forEach((function(o,a){i.set(a,t(o,r,n,a,e,c))}));var y=l?void 0:(f?s?Qo:Ko:s?ia:ca)(e);return qo(y||e,(function(o,a){y&&(o=e[a=o]),Ro(i,a,t(o,r,n,a,e,c))})),i},ha=da,ja=1,_a=4;var ga=function(t){return ha(t,ja|_a)};console.log(undefined);console.log("Util Name");console.log("Util Name");r(void 0,void 0,void 0,(function*(){const t=yield new Promise(((t,e)=>{t(200)}));console.log(t)}));const wa={name:"dataName"},Oa=ga(wa);Oa.name="dataCopyName",console.log(wa),console.log(Oa);const ma=e.clone(wa);ma.name="dataCopy1Name",console.log(wa),console.log(ma),console.log(t(".box")),console.log("fddddddsdsffdds")}));