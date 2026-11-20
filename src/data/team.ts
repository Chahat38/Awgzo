export interface TeamMember {
  id: string;
  index: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  links: {
    linkedin: string;
    instagram: string;
  };
}

export const AWGZO_TEAM: TeamMember[] = [
  {
    id: 'member-01',
    index: '01',
    name: 'AR & Creative Direction',
    role: 'Spatial Campaigns & WebAR',
    bio: 'Leads interactive AR try-on experiences, scannable print campaigns, and real-time 3D creative pipelines.',
    photo: '/assets/team/team-1.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-02',
    index: '02',
    name: 'TikTok & Social Effects',
    role: 'Effect House & Face Tracking',
    bio: 'Designs custom TikTok filters, real-time shaders, and camera-first social AR activations.',
    photo: '/assets/team/team-2.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-03',
    index: '03',
    name: 'Web & Software Engineering',
    role: 'Web Platforms & E-Commerce',
    bio: 'Builds responsive websites, online storefronts, and custom software tailored for modern growth.',
    photo: '/assets/team/team-3.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-04',
    index: '04',
    name: 'Digital Marketing Strategy',
    role: 'Brand Positioning & Growth',
    bio: 'Connects creative design and digital marketing campaigns with measurable brand objectives.',
    photo: '/assets/team/team-1.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-05',
    index: '05',
    name: 'Creative Design & Consulting',
    role: 'Visual Identity & Strategy',
    bio: 'Shapes memorable visual systems and strategic consulting for product launches and campaigns.',
    photo: '/assets/team/team-2.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
];

export function getTeamMembers(): TeamMember[] {
  return AWGZO_TEAM;
}
