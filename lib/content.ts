const photo = (name: string) => `/images/ashwiinii/${name}.webp`;

export const studio = {
  name: 'Interiors by Ashwiinii Dongare',
  designer: 'Ashwiinii Dongare',
  preloaderName: 'Ashwiinii Dongare',
  tagline: 'Vision To Realty',
  email: 'bizz.shd@gmail.com',
  phone: '+91 72197 24437',
  phoneHref: 'tel:+917219724437',
  location: 'Nyati Emporius, Baner, Pune 411045',
  founded: 2019,
  mark: photo('cropped-Picture1'),
  founderImage: photo('DSC00160'),
  website: 'https://ashwiiniidongare.com/',
};

export const socials = [
  { name: 'Instagram', handle: '@interiorsbyashwiiniidongare', url: 'https://www.instagram.com/interiorsbyashwiiniidongare/' },
  { name: 'Facebook', handle: 'Interiors by Ashwiinii Dongare', url: 'https://www.facebook.com/interiorsbyashwiiniidongare/' },
  { name: 'LinkedIn', handle: 'Ashwiinii Dongare', url: 'https://www.linkedin.com/in/ashwiinii-dongare-231a816b/' },
  { name: 'YouTube', handle: '@interiorsbyashwiiniidongare', url: 'https://www.youtube.com/@interiorsbyashwiiniidongare' },
];

export const studioCopy = {
  headline: 'A house isn’t just a house — it’s a reflection of who you are.',
  introduction: 'At Interiors by Ashwiinii Dongare, we’re all about ensuring every bit of a home reflects the personality and style of the people living there. By designing your house with dedication and skill, we ensure each corner of your living space echoes the quality of a house that’s designed well and a place you can call home.',
  mission: 'We create functional and aesthetically pleasing spaces that reflect your personality, meet your needs, and bring your vision to life — from full home interior design to execution.',
  team: 'Our team consists of highly skilled and experienced interior designers, architects, and artisans who share our passion for creating exceptional living spaces. Every project we undertake is a collaboration, where we consider your preferences and ensure every aspect of the design is personalized and executed with the utmost precision.',
  founder: [
    'Ashwiinii Dongare is the founder, CEO, and Principal Designer of Interiors by Ashwiinii Dongare. A Pune University graduate, she started her own interior design firm in 2019.',
    'Raised in a middle-class family in Khokarmoha, a rural community in Beed, Maharashtra, Ashwiinii developed a passion for drawing and sketching and dreamed of becoming an architect. When she was unable to gain admission to architecture after Class 12, she pursued engineering. Alongside her engineering studies, she invested in her passion for interior design and earned a diploma in the field.',
    'With Ashwiinii’s vision and a passionate team, we are committed to bringing our clients’ visions to life and creating beautiful, functional, and personalized living spaces. Our biggest desire is to transform your home into a vibrant, comfortable, and luxurious space that reflects your personality.',
    'Her approach brings function and aesthetics together, with attention to sustainable and universal design. She gives every client personal attention to understand their needs, preferences, and way of living.',
    'Based in Pune, the firm specializes in residential interiors and turnkey project management — full home interior design to execution.',
  ],
};

export const images = {
  hero: '/images/ashwiinii/herosection.jpg',
  heroAlt: 'Monochrome living room with a curved slatted ceiling, sectional sofa, lounge chair, and low coffee table',
  living: photo('InShot_20221117_103600123-scaled'),
  office: photo('photo-output-46'),
  contact: photo('photo-output-5-scaled'),
  about: photo('photo-output-52'),
  works: photo('Screen-Shot-2022-11-24-at-4.03.13-PM'),
  strip: ['photo-output-46', 'InShot_20221116_222935127', 'photo-output-30', 'photo-output-66', 'photo-output-5-scaled', 'InShot_20221116_224713646'].map(photo),
};

// Gallery collections, not invented client names or completed-project claims.
// Existing case-study URLs are retained so previous links keep working.
export const projects = [
  { slug: 'willow-house', title: 'Living & Dining', summary: 'Welcoming Indian homes, made for everyday togetherness.', category: 'Residential interiors', cover: photo('InShot_20221117_103600123-scaled'), alt: 'Pink sofa, white wall panelling and brass details in an Indian living room by Ashwiinii Dongare',
    intro: 'A home that feels like you.', description: 'Our living spaces begin with the people who use them. Seating, circulation, storage, and finishes are considered together to create a home that balances comfort, personality, and beauty.', challenge: 'Room for the way you live.', challengeBody: 'From family time to entertaining guests, a living and dining space needs to feel welcoming and work effortlessly. Our approach brings together furniture planning, layered lighting, thoughtful storage, and a palette shaped around your preferences.', outcome: 'Personal, practical, beautifully connected.', outcomeBody: 'Explore living and dining photographs from the studio’s published portfolio. Each image offers a closer look at the relationship between materials, detail, and everyday use.',
    gallery: ['photo-output-46', 'InShot_20221116_222935127', 'InShot_20221116_204334390', 'photo-output-52'].map(photo), related: ['loft-line', 'stonebay-bath'] },
  { slug: 'terra-garden', title: 'Bedrooms & Retreats', summary: 'Restful spaces with comfort and personality at their heart.', category: 'Bedroom design', cover: photo('InShot_20221116_224713646'), alt: 'Indian bedroom with a teal panelled wall, upholstered bed and warm bedside lighting',
    intro: 'Your own place to unwind.', description: 'A bedroom should feel comfortable, personal, and easy to live in. Soft textures, considered lighting, and a useful layout create a retreat shaped around your daily routine.', challenge: 'Comfort, without compromise.', challengeBody: 'We consider storage, movement, daylight, and the details that make a room feel personal. From wardrobes to a quiet study corner, each element has a purpose.', outcome: 'Designed around your everyday rituals.', outcomeBody: 'This collection brings together bedroom photographs from the studio’s public gallery, showing different palettes, furniture arrangements, and approaches to storage.',
    gallery: ['photo-output-66', 'InShot_20221116_230229838', 'photo-output-68', 'InShot_20221116_220205784'].map(photo), related: ['loft-line', 'willow-house'] },
  { slug: 'loft-line', title: 'Kitchens & Storage', summary: 'Considered layouts and crafted storage for real Indian homes.', category: 'Space planning & furniture', cover: photo('photo-output-30'), alt: 'Modular Indian kitchen with dark countertops, glass cabinetry and an integrated chimney',
    intro: 'Beautiful spaces that work harder.', description: 'Good design makes everyday life easier. We plan kitchens, wardrobes, and built-in furniture around the space available and the needs of the people using them.', challenge: 'Every detail has a job.', challengeBody: 'Practical layouts, accessible storage, suitable materials, and carefully resolved finishes work together. We coordinate the details from the design stage through execution.', outcome: 'Function, thoughtfully integrated.', outcomeBody: 'Explore kitchen and storage details from the studio’s gallery, including fitted cabinetry, dressing areas, and integrated home workspaces.',
    gallery: ['InShot_20221116_210153702', 'photo-output-10-scaled', 'photo-output-9-scaled', 'photo-output-66-scaled'].map(photo), related: ['terra-garden', 'stonebay-bath'] },
  { slug: 'stonebay-bath', title: 'Details & Finishes', summary: 'The materials, lighting, and personal touches that make a home.', category: 'Interior styling & execution', cover: photo('photo-output-5-scaled'), alt: 'Warm Indian bedroom with a carved jali partition, upholstered bed and personal decorative details',
    intro: 'A home is in the details.', description: 'Materials and finishing touches bring a space together. We take care with colour, texture, lighting, and craftsmanship so that the result feels cohesive and personal.', challenge: 'From the first sketch to the final finish.', challengeBody: 'Our team connects design intent with careful execution. Attention to proportion, material selection, and installation helps every corner feel considered.', outcome: 'Your vision, brought to life.', outcomeBody: 'A selection of photographs from the studio’s public portfolio, highlighting decorative partitions, furniture finishes, lighting, and the details that give a home its identity.',
    gallery: ['photo-output-3-scaled', 'photo-output-9-scaled', 'InShot_20221116_214854625', 'InShot_20221117_110134399'].map(photo), related: ['willow-house', 'terra-garden'] },
];

export const services = [
  { title: 'Interior Design', image: images.living, text: 'Personalized residential interiors, from space planning and material selection to lighting, furnishings, and the details that make your home feel like you.' },
  { title: 'Turnkey Projects', image: images.office, text: 'Full home interior design to execution. We bring the design, materials, craftspeople, and project coordination together for a cohesive result.' },
  { title: 'Home Remodeling', image: images.works, text: 'A fresh perspective on your existing home, with practical layouts, considered storage, and finishes that reflect your personality and needs.' },
  { title: 'Custom Furniture', image: photo('photo-output-30'), text: 'Furniture, cabinetry, wardrobes, and storage shaped around your space — combining useful details with a personal sense of style.' },
];

export const faqs = [
  ['Can you work with my chosen contractor?', 'We can discuss coordination with your preferred contractor during your consultation. For turnkey projects, our team brings design and execution together.'],
  ['Is there a minimum project size?', 'Tell us about your home, scope, and budget. We will discuss a suitable approach based on your needs.'],
  ['How do I start a project?', 'Tell us a little about your space, your ideas, and your timeline. You can call us, email us, or get in touch through our social profiles.'],
  ['Do you handle full home design and execution?', 'Yes. We specialize in residential interiors and turnkey project management, taking your home from interior design through to execution.'],
  ['How involved will I be in the process?', 'Your home should reflect you. We take time to understand your needs and preferences and work collaboratively through the design process.'],
  ['How long does a typical project take?', 'Timing depends on the scope, approvals, material availability, and execution requirements. We discuss a realistic schedule after understanding your project.'],
];
