import {useEffect,useRef} from 'react';

/** Native, perspective-projected mesh. Decorative only; never changes learning state. */
export function WireframeGlobe(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;const ctx=canvas?.getContext('2d');if(!canvas||!ctx)return;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const ratio=Math.min(devicePixelRatio||1,2);canvas.width=320*ratio;canvas.height=280*ratio;
    ctx.scale(ratio,ratio);let frame=0,last=0,angle=.3;
    function draw(){
      ctx!.clearRect(0,0,320,280);
      const project=(lat:number,lon:number)=>{
        const x=Math.cos(lat)*Math.cos(lon+angle),y=Math.sin(lat),z=Math.cos(lat)*Math.sin(lon+angle);
        const tilt=.27,yy=y*Math.cos(tilt)-z*Math.sin(tilt),zz=y*Math.sin(tilt)+z*Math.cos(tilt);
        const scale=102*3.6/(3.6-zz);return {x:160+x*scale,y:133-yy*scale,z:zz};
      };
      ctx!.lineWidth=.8;
      const curve=(points:{x:number;y:number;z:number}[])=>{
        for(let i=1;i<points.length;i++){
          const a=points[i-1],b=points[i];ctx!.strokeStyle=(a.z+b.z)/2<0?'#3048DB80':'#2386FFEE';
          ctx!.beginPath();ctx!.moveTo(a.x,a.y);ctx!.lineTo(b.x,b.y);ctx!.stroke();
        }
      };
      for(let lat=-75;lat<=75;lat+=15)curve(Array.from({length:65},(_,i)=>project(lat*Math.PI/180,i*Math.PI/32)));
      for(let lon=0;lon<360;lon+=20)curve(Array.from({length:33},(_,i)=>project(-Math.PI/2+i*Math.PI/32,lon*Math.PI/180)));
      ctx!.strokeStyle='#3048DB';ctx!.lineWidth=.7;
      for(let i=0;i<9;i++){ctx!.beginPath();ctx!.moveTo(160,224);ctx!.lineTo(-80+i*60,280);ctx!.stroke();}
      for(const y of [232,242,257,279]){ctx!.beginPath();ctx!.moveTo(12,y);ctx!.lineTo(308,y);ctx!.stroke();}
      ctx!.strokeStyle='#F4D5A366';
      for(const [x,y,dx,dy] of [[12,12,14,14],[308,12,-14,14],[12,216,14,-14],[308,216,-14,-14]]){
        ctx!.beginPath();ctx!.moveTo(x+dx,y);ctx!.lineTo(x,y);ctx!.lineTo(x,y+dy);ctx!.stroke();
      }
    }
    function tick(time:number){
      if(time-last>=50){angle+=Math.min(time-last,100)*.00009;last=time;draw();}
      frame=requestAnimationFrame(tick);
    }
    function sync(){cancelAnimationFrame(frame);draw();last=performance.now();if(!motion.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
    motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
    return()=>{cancelAnimationFrame(frame);motion.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
  },[]);
  return <figure className="mesh-art" aria-hidden="true"><canvas ref={ref} className="wireframe-globe"/></figure>;
}
