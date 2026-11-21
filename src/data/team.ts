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
    name: 'Ahmad Waleed',
    role: 'Founder & CEO | AR Developer',
    bio: 'Founder and CEO of AWGZO, Ahmad Waleed leads AR development and client strategy, turning early ideas into practical mobile, web and iOS experiences for brands across Pakistan.',
    photo: '/assets/team/team-1.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-02',
    index: '02',
    name: 'Chahat',
    role: 'Lead Creative Developer (WebXR & 3D)',
    bio: 'Chahat led the development of the AWGZO website, including its 3D scene and WebXR experience. She shapes creative web builds that stay fast, readable and fun to explore.',
    photo: '/assets/team/team-2.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-03',
    index: '03',
    name: 'Shawal Manzoor',
    role: 'Web Developer',
    bio: 'Shawal builds responsive websites and e-commerce pages with clean structure and dependable performance. He focuses on layouts that stay clear from first scroll to checkout on every screen size.',
    photo: '/assets/team/team-3.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-04',
    index: '04',
    name: 'Remsha',
    role: 'Web Developer',
    bio: 'Remsha turns design files into accessible, maintainable web interfaces. Her work keeps typography, spacing and interaction details consistent so every page feels considered and easy to use.',
    photo: '/assets/team/team-1.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-05',
    index: '05',
    name: 'Fatima Huma',
    role: 'Content Writer',
    bio: 'Fatima writes clear, useful copy for service pages, campaign landing pages and case studies. She keeps the AWGZO voice friendly and direct while making technical ideas easy to understand.',
    photo: '/assets/team/team-2.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-06',
    index: '06',
    name: 'Mohid',
    role: 'Digital Marketing Specialist',
    bio: 'Mohid plans focused digital campaigns that connect search, social and content. He helps brands show up with a consistent message and turn everyday engagement into clear enquiries.',
    photo: '/assets/team/team-3.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-07',
    index: '07',
    name: 'Saeed',
    role: 'SEO Specialist',
    bio: 'Saeed improves search visibility through careful keyword mapping, on-page clarity and technical checks. He helps AWGZO and its clients get found for the services people are already looking for.',
    photo: '/assets/team/team-1.jpg',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
];

export function getTeamMembers(): TeamMember[] {
  return AWGZO_TEAM;
}
