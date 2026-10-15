'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {TransitionLink as Link,RouteTransitionProvider} from '@/components/route-transition';
import {ArrowIcon} from '@/components/arrow-icon';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {AnimatePresence,MotionConfig,motion,useReducedMotion,useScroll,useTransform,useInView} from 'motion/react';
import {faqs,images,projects,services,studio,studioCopy,socials} from '@/lib/content';
import {IntroProvider,HeroEntrance,ViewportReveal} from '@/components/page-motion';
import {motionSettings} from '@/lib/motion';
export function MotionProvider({children}:{children:React.ReactNode}){return <MotionConfig reducedMotion="user"><IntroProvider><RouteTransitionProvider>{children}</RouteTransitionProvider></IntroProvider></MotionConfig>}
export function Picture({src,alt,className='',priority=false}:{src:string;alt:string;className?:string;priority?:boolean}){return <div className={'picture '+className}><Image src={src} alt={alt} fill sizes="(max-width: 809px) 100vw, 70vw" priority={priority}/></div>}
export function Reveal({children,className='',delay=0}:{children:React.ReactNode;className?:string;delay?:number}){return <ViewportReveal className={className} delay={delay}>{children}</ViewportReveal>}
export function Label({children}:{children:React.ReactNode}){return <div className="label"><span/>{children}</div>}
const nav=[['Home','/'],['About','/about/'],['Gallery','/works/'],['Services','/#service'],['Contact','/#contact']];
export function BrandLogo({className='',onNavigate}:{className?:string;onNavigate?:()=>void}){return <Link href="/" className={'brand-logo '+className} onClick={onNavigate} aria-label={studio.name+' home'}><Image src={studio.mark} alt="" width={36} height={36}/><span><small>Interiors by</small><strong>{studio.designer}</strong></span></Link>}
export function SocialLinks({className=''}:{className?:string}){return <div className={'social-links '+className}>{socials.map(s=><a key={s.name} href={s.url} target="_blank" rel="noreferrer" aria-label={s.name+' — '+s.handle}>{s.name}<span className="link-icon"><ArrowIcon/></span></a>)}</div>}
export function Header(){
 const [open,setOpen]=useState(false);
 const path=usePathname();
 const openedPath=useRef(path);
 const button=useRef<HTMLButtonElement>(null);
 const panel=useRef<HTMLDivElement>(null);
 const visible=open&&openedPath.current===path;
 const light=path.startsWith('/works/')&&path!='/works/';
 useEffect(()=>setOpen(false),[path]);
 useLayoutEffect(()=>{
   if(!visible)return;
   const previous=document.body.style.overflow;
   document.body.style.overflow='hidden';
   const backgrounds=[...document.querySelectorAll<HTMLElement>('main,footer')];
   const previousInert=backgrounds.map(element=>element.inert);
   backgrounds.forEach(element=>{element.inert=true});
   panel.current?.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true});
   function key(event:KeyboardEvent){
     if(event.key==='Escape'){
       event.preventDefault();setOpen(false);button.current?.focus({preventScroll:true});
     }
     if(event.key==='Tab'){
       const elements=[button.current!,...panel.current!.querySelectorAll<HTMLElement>('a,button')];
       if(event.shiftKey&&document.activeElement===elements[0]){
         event.preventDefault();elements[elements.length-1]?.focus();
       }else if(!event.shiftKey&&document.activeElement===elements[elements.length-1]){
         event.preventDefault();elements[0]?.focus();
       }
     }
   }
   document.addEventListener('keydown',key);
   return()=>{
     document.body.style.overflow=previous;
     backgrounds.forEach((element,index)=>{element.inert=previousInert[index]});
     document.removeEventListener('keydown',key);
   };
 },[visible]);
 function closeNavigation(){setOpen(false);button.current?.focus({preventScroll:true})}
 return <>
   <header className={`header ${light?'ink':''} ${visible?'is-open':''}`}>
     <BrandLogo onNavigate={()=>setOpen(false)}/>
     <button ref={button} className={'menu-toggle '+(visible?'active':'')} aria-label={visible?'Close navigation':'Open navigation'} aria-expanded={visible} aria-controls="navigation" onClick={()=>{openedPath.current=path;setOpen(!visible)}}><span/><span/></button>
   </header>
   {/* Unmount on selection: no exiting panel or shadow over the destination page. */}
   {visible&&<motion.div ref={panel} id="navigation" role="dialog" aria-modal="true" aria-label="Site navigation" className="nav-panel" initial={{y:'-100%'}} animate={{y:0}} transition={{duration:.5,ease:[.22,1,.36,1]}}>
     <nav>{nav.map(([name,url],i)=><Link key={name} href={url} onClick={closeNavigation}><small>0{i+1}</small>{name}<span className="link-icon"><ArrowIcon/></span></Link>)}</nav>
     <div className="nav-aside"><Picture src={images.contact} alt="Residential interior by Interiors by Ashwiinii Dongare"/><a href={'mailto:'+studio.email}>{studio.email} <ArrowIcon/></a><p>{studio.location}</p></div>
   </motion.div>}
 </>;
}
export function Hero({type='home',src=images.hero}:{type?:'home'|'about'|'works';src?:string}){
 const section=useRef<HTMLElement>(null);
 const reduced=useReducedMotion();
 const [travel,setTravel]=useState(motionSettings.hero.desktopTravel);
 const {scrollYProgress}=useScroll({target:section,offset:['start start','end start']});
 const y=useTransform(scrollYProgress,[0,1],[0,travel]);
 const opacity=useTransform(scrollYProgress,motionSettings.hero.fadeProgress,motionSettings.hero.fadeOpacity);
 const home=type==='home';
 useEffect(()=>{if(!section.current)return;const resize=new ResizeObserver(([entry])=>{const mobile=window.innerWidth<810;setTravel(Math.min(entry.contentRect.height*.2,mobile?motionSettings.hero.mobileTravel:motionSettings.hero.desktopTravel))});resize.observe(section.current);return()=>resize.disconnect()},[]);
 return <section ref={section} className={'hero hero-'+type}>
   <motion.div className="hero-scene" style={{opacity:home&&!reduced?opacity:1}}>
     <HeroEntrance enabled={home} kind="image" className="hero-image-entrance">
       <motion.div className="hero-image-parallax" style={{y:home&&!reduced?y:0}}>
         <Picture src={src} alt={home?images.heroAlt:'Residential interior from the studio’s Indian home portfolio'} priority/>
       </motion.div>
     </HeroEntrance>
     <div className="hero-shade"/>
     <div className="hero-intro"><HeroEntrance enabled={home} kind="intro">
       <span className="eyebrow">PUNE · RESIDENTIAL INTERIORS · DESIGN TO EXECUTION</span>
       <p>{home?studioCopy.headline:type==='about'?'Meet the founder and team bringing your vision to life, one home at a time.':'Indian homes, designed around the people who live in them. Explore our gallery.'}</p>
     </HeroEntrance><HeroEntrance enabled={home} kind="heading">
       <a className="text-link" href={home?'#work':type==='about'?'#mission':'#projects'}>{home?'Explore the gallery':type==='about'?'Meet the studio':'View projects'}<span className="link-icon"><ArrowIcon direction="down"/></span></a>
     </HeroEntrance></div>
     <div className="hero-title-position"><HeroEntrance enabled={home} kind="heading"><h1 className="hero-title" aria-label={home?studio.name:undefined}>{home?<><span className="hero-brand-prefix">Interiors by</span><span className="hero-brand-name">Ashwiinii</span><span className="hero-brand-surname">Dongare</span></>:type==='about'?'About us.':'Gallery.'}</h1></HeroEntrance></div>
     <div className="hero-bottom"><span>{home?'INTERIORS BY ASHWIINII DONGARE':'PUNE · MAHARASHTRA'}</span><span>VISION TO REALTY. <span className="orange">●</span></span></div>
   </motion.div>
 </section>
}
export function ProjectCard({project,index=0}:{project:typeof projects[number];index?:number}){return <Link href={'/works/'+project.slug+'/'} className="project-card"><div className="card-media"><Picture src={project.cover} alt={project.alt}/><span className="corner tl"/><span className="corner tr"/><span className="corner bl"/><span className="corner br"/><span className="card-arrow"><ArrowIcon/></span><span className="card-number">0{index+1} / RESIDENTIAL</span></div><div className="card-info"><div><h3>{project.title}</h3><p>{project.summary}</p></div><span className="year">Explore <ArrowIcon/></span></div></Link>}
export function StudioIntro(){
 const strip=useRef<HTMLDivElement>(null);
 const visible=useInView(strip);
 return <section className="studio-section"><div ref={strip} className="image-strip" data-running={visible}>
   <div className="image-strip-track" style={{animationDuration:`${motionSettings.ticker.duration}s`}}>
     {[0,1].map(copy=><div className="image-strip-group" key={copy} aria-hidden={copy===1?true:undefined}>{images.strip.map((src,i)=><Picture key={src} src={src} alt={copy===0?`Indian home interiors by Ashwiinii Dongare, view ${i+1}`:''}/>)}</div>)}
   </div>
 </div><Reveal className="studio-copy"><Label>A considered approach</Label><h2>A reflection of you.<br/>In every detail.</h2><p className="studio-introduction">{studioCopy.introduction}</p><Link href="/about/" className="text-link">Inside our studio <span className="link-icon"><ArrowIcon/></span></Link></Reveal></section>
}
export function SelectedProjects(){return <section id="work" className="selected section"><div className="section-top"><Label>Our gallery</Label><span className="small-muted">INDIAN HOMES / PERSONAL STORIES</span></div><div className="project-stage"><div className="project-backdrop" aria-hidden="true"><span>Our gallery.</span></div><div className="project-grid staggered">{projects.map((p,i)=><Reveal key={p.slug} delay={i%2*.07}><ProjectCard project={p} index={i}/></Reveal>)}</div></div><div className="all-works"><Link href="/works/" className="text-link">Explore the gallery <span className="link-icon"><ArrowIcon/></span></Link></div></section>}
export function ServiceSelector(){const [active,setActive]=useState(0);return <section id="service" className="services section"><Label>What we do</Label><div className="service-grid"><div className="service-list">{services.map((s,i)=><button key={s.title} className={active===i?'selected-service':''} aria-pressed={active===i} onClick={()=>setActive(i)}><small>0{i+1}</small><span>{s.title}</span><i><ArrowIcon/></i></button>)}</div><div className="service-detail" aria-live="polite"><AnimatePresence mode="wait"><motion.div key={active} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.25}}><Picture src={services[active].image} alt={services[active].title+' example'}/><p>{services[active].text}</p></motion.div></AnimatePresence><a href="#contact" className="text-link">Let’s talk about your space <span className="link-icon"><ArrowIcon/></span></a></div></div></section>}
export function FAQ(){const [active,setActive]=useState<number|null>(0);return <section className="faq section"><div><Label>A little clarity</Label><h2>Your questions,<br/>answered.</h2><p>Good projects start with a conversation.<br/>Here are a few things you might be wondering.</p></div><div>{faqs.map(([q,a],i)=><div className="faq-row" key={q}><button aria-expanded={active===i} aria-controls={'faq-'+i} onClick={()=>setActive(active===i?null:i)}>{q}<span>{active===i?'−':'+'}</span></button><AnimatePresence initial={false}>{active===i&&<motion.div id={'faq-'+i} initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.3}}><p>{a}</p></motion.div>}</AnimatePresence></div>)}</div></section>}
const quotes=[
 {quote:studioCopy.headline,name:studio.designer,role:'Founder & Principal Designer'},
 {quote:'Our biggest desire is to transform your home into a vibrant, comfortable, and luxurious space that reflects your personality.',name:studio.designer,role:'Founder & Principal Designer'},
 {quote:'We create functional and aesthetically pleasing spaces that meet the needs of our clients.',name:studio.designer,role:'Founder & Principal Designer'}
];
export function Testimonials(){const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const reduced=useReducedMotion();useEffect(()=>{if(paused||reduced)return;const timer=setInterval(()=>setIndex(i=>(i+1)%quotes.length),6000);return()=>clearInterval(timer)},[paused,reduced]);return <section className="testimonials founder-spotlight" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)}><div className="quote-panel"><Label>Meet our founder</Label><div aria-live="polite"><span className="quote-mark">“</span><AnimatePresence mode="wait"><motion.blockquote key={index} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{quotes[index].quote}</motion.blockquote></AnimatePresence><div className="quote-person"><span className="avatar">AD</span><div>{quotes[index].name}<small>{quotes[index].role}</small></div></div><Link href="/about/#founder" className="text-link founder-link">Read Ashwiinii’s story <span className="link-icon"><ArrowIcon/></span></Link></div><div className="quote-controls"><span>0{index+1} <span className="muted">/ 03</span></span><div><button aria-label="Previous founder statement" onClick={()=>setIndex((index+2)%3)}><ArrowIcon direction="left"/></button><button aria-label="Next founder statement" onClick={()=>setIndex((index+1)%3)}><ArrowIcon direction="right"/></button></div></div></div><Picture src={studio.founderImage} alt="Ashwiinii Dongare, Founder and Principal Designer"/></section>}
export function SocialGallery(){return <section className="social-gallery section"><div className="section-top"><div><Label>Indian interiors, personal stories</Label><h2>Designed here.<br/>Made for you.</h2></div><a href={socials[0].url} target="_blank" rel="noreferrer" className="text-link">Follow on Instagram <span className="link-icon"><ArrowIcon/></span></a></div><div className="social-photo-grid">{[images.living,images.strip[1],images.strip[3],images.contact].map((src,i)=><a href={socials[0].url} key={src} target="_blank" rel="noreferrer" aria-label={'Explore the studio on Instagram — interior view '+(i+1)}><Picture src={src} alt={['Personalized living room with a pink sofa','Blue seating and a decorative feature wall','A restful Indian bedroom with warm timber details','Bedroom with a carved jali partition and warm finishes'][i]}/><span>Interiors by Ashwiinii Dongare <ArrowIcon/></span></a>)}</div><SocialLinks/></section>}
export function Contact(){const [message,setMessage]=useState('');const [pending,setPending]=useState(false);async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setPending(true);const endpoint=process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;if(!endpoint){setMessage('Your enquiry has not been sent. Please email '+studio.email+' or call '+studio.phone+'.');setPending(false);return}try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))});if(!res.ok)throw Error();setMessage('Thank you. Your enquiry has been received.')}catch{setMessage('We couldn’t send your message. Please try again later.')}finally{setPending(false)}}return <section id="contact" className="contact section"><div className="contact-grid"><div><Label>Have a project in mind?</Label><h2>Good things start<br/>with a conversation.</h2><a className="contact-email" href={'mailto:'+studio.email}>{studio.email} <ArrowIcon/></a><div className="contact-details"><a href={studio.phoneHref}>{studio.phone}</a><p>{studio.location}</p><SocialLinks/></div></div><form onSubmit={submit}><label>Name<input name="name" placeholder="Your name" required autoComplete="name"/></label><label>Email<input type="email" name="email" placeholder="you@example.com" required autoComplete="email"/></label><label>Tell us about your project<textarea name="message" placeholder="A little about your space, ideas, and timeline…" required rows={2}/></label><button className="text-link" type="submit" disabled={pending}>{pending?'Sending…':'Send your enquiry'}<span className="link-icon"><ArrowIcon/></span></button><p className="form-status" role="status">{message||'For enquiries, you can also call or email us directly.'}</p></form></div><div className="contact-cta"><Picture src={images.contact} alt="Warm Indian home interior by Ashwiinii Dongare"/><a href={'mailto:'+studio.email}>Your vision.<br/>Our craft.<span className="cta-icon"><ArrowIcon/></span></a></div></section>}
export function Footer(){const [status,setStatus]=useState('');const [pending,setPending]=useState(false);async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const endpoint=process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;if(!endpoint){setStatus('Signup is not available yet. Follow us on Instagram for studio updates.');return}setPending(true);try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});if(!res.ok)throw Error();setStatus('You’re subscribed. Thank you.');form.reset()}catch{setStatus('Signup could not be completed. Please try again.')}finally{setPending(false)}}return <footer><div className="footer-panel"><div><h3>A little inspiration,<br/>every now and then.</h3><form className="newsletter" onSubmit={submit}><label className="sr-only" htmlFor="newsletter">Email for the newsletter</label><input id="newsletter" name="email" type="email" placeholder="Your email address" required/><button disabled={pending} aria-label="Subscribe to newsletter">{pending?'…':<ArrowIcon/>}</button></form><p className="form-status" role="status">{status}</p></div><div className="footer-right"><nav>{nav.map(([name,url])=><Link key={name} href={url}>{name} <ArrowIcon/></Link>)}</nav><div className="footer-brand"><BrandLogo/><SocialLinks/></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {studio.name}</span><span>{studio.tagline}</span><span>Designed and developed by Work Globally</span></div></div></footer>}
export function MissionStatement(){const ref=useRef<HTMLHeadingElement>(null);const {scrollYProgress}=useScroll({target:ref,offset:['start 85%','end 45%']});const text=studioCopy.mission;const words=text.split(' ');return <h2 ref={ref} aria-label={text}>{words.map((word,i)=><MissionWord key={i} word={word} progress={scrollYProgress} start={i/words.length} end={(i+1)/words.length}/>)}</h2>}
function MissionWord({word,progress,start,end}:{word:string;progress:import('motion/react').MotionValue<number>;start:number;end:number}){const color=useTransform(progress,[start,end],['#c6c6c6','#171717']);const reduced=useReducedMotion();return <motion.span aria-hidden="true" style={{color:reduced?'#171717':color}}>{word} </motion.span>}
export function Metrics(){return <div className="metrics"><Metric value={studio.founded} suffix="" label="Founded by Ashwiinii" description="A passion for drawing, brought home."/><div className="metric"><strong className="text-stat">Pune</strong><div><h3>Rooted in Maharashtra</h3><p>Baner, Pune · Residential interiors</p></div></div><div className="metric"><strong className="text-stat">Full home</strong><div><h3>Design to execution</h3><p>Personalized interiors. Turnkey delivery.</p></div></div></div>}
function Metric({value,suffix,label,description}:{value:number;suffix:string;label:string;description:string}){
 const [n,setN]=useState(value);
 const ref=useRef<HTMLDivElement>(null);
 const reduced=useReducedMotion();
 const started=useRef(false);
 useEffect(()=>{
   if(reduced){setN(value);return}
   let frameId=0;
   const observer=new IntersectionObserver(([entry])=>{
     if(!entry.isIntersecting||started.current)return;
     started.current=true;
     let start:number|undefined;
     function frame(t:number){start??=t;const progress=Math.min((t-start)/motionSettings.metrics.durationMs,1);setN(Math.round(value*(1-(1-progress)**3)));if(progress<1)frameId=requestAnimationFrame(frame)}
     frameId=requestAnimationFrame(frame);
     observer.disconnect();
   },{threshold:.4});
   if(ref.current)observer.observe(ref.current);
   return()=>{observer.disconnect();cancelAnimationFrame(frameId)};
 },[value,reduced]);
 return <div className="metric" ref={ref}><strong aria-label={`${value}${suffix}`}><span aria-hidden="true">{n}{suffix}</span></strong><div><h3>{label}</h3><p>{description}</p></div></div>
}
