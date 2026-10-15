import {Hero,Label,ProjectCard} from '@/components/site';
import {projects,images} from '@/lib/content';
export const metadata={title:'Interior design gallery'};
export default function Works(){return <main id="main"><Hero type="works" src={images.works}/><section id="projects" className="section works-index"><div className="section-top"><Label>Our portfolio</Label><span className="small-muted">INDIAN HOMES. PERSONAL STORIES.</span></div><div className="project-grid">{projects.map((p,i)=><ProjectCard project={p} index={i} key={p.slug}/>)}</div></section></main>}
