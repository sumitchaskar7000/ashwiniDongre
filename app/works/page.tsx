import {Hero,Label,ProjectCard} from '@/components/site';
import {projects} from '@/lib/content';
export const metadata={title:'Our works'};
export default function Works(){return <main id="main"><Hero type="works" src="/images/cdgoVpLYsHMLXUYXbZEVBOtCEk.png"/><section id="projects" className="section works-index"><div className="section-top"><Label>A selection of our work</Label><span className="small-muted">FOUR SPACES. ENDLESS POSSIBILITIES.</span></div><div className="project-grid">{projects.map((p,i)=><ProjectCard project={p} index={i} key={p.slug}/>)}</div></section></main>}
