import {Contact,Hero,Label,Metrics,Picture,MissionStatement,Reveal,SocialLinks} from '@/components/site';
import {images,studio,studioCopy} from '@/lib/content';
export const metadata={title:'Our founder & studio'};
const team=[
  {title:'Interior designers',text:'Personalized spaces, shaped around your preferences.',image:images.living},
  {title:'Architects',text:'Thoughtful planning that brings function and aesthetics together.',image:images.strip[0]},
  {title:'Artisans',text:'Care and craftsmanship in every material and detail.',image:images.contact},
  {title:'Execution team',text:'Collaboration and coordination from design to delivery.',image:images.strip[2]},
];
export default function About(){return <main id="main">
  <Hero type="about" src={images.about}/>
  <section id="mission" className="mission section"><Label>Our mission</Label><div><MissionStatement/><p>{studioCopy.introduction}</p></div></section>
  <div className="section metrics-section"><Metrics/></div>
  <section id="founder" className="founder-story section">
    <Reveal className="founder-portrait"><Picture src={studio.founderImage} alt="Ashwiinii Dongare, Founder, CEO and Principal Designer"/><span>ASHWIINII DONGARE / FOUNDER & PRINCIPAL DESIGNER</span></Reveal>
    <div className="founder-biography"><Label>Meet our founder</Label><h2>A passion for design.<br/>A personal vision.</h2><h3>{studio.designer}</h3><p className="founder-role">Founder, CEO & Principal Designer</p>{studioCopy.founder.map(paragraph=><p key={paragraph}>{paragraph}</p>)}<div className="founder-signature">{studio.tagline}<span>Full Home Interior Design to Execution</span></div><SocialLinks/></div>
  </section>
  <section className="team section"><Label>Our team of experts</Label><h2>One team.<br/>Your vision.</h2><p className="team-introduction">{studioCopy.team}</p><div className="team-grid">{team.map(member=><div className="team-card" key={member.title}><Picture src={member.image} alt={member.title+' — a detail from our interior portfolio'}/><div><h3>{member.title}</h3><p>{member.text}</p></div></div>)}</div><div className="partner-strip"><span>FROM VISION TO REALTY</span><strong>Discover</strong><strong>Design</strong><strong>Detail</strong><strong>Deliver</strong></div></section>
  <Contact/>
</main>}
