export interface TeamMember {
  id: string;
  index: string;
  name: string;
  role: string;
  bio: string;
  // Optional real photo. Drop files in /public/assets/team/ and set e.g. '/assets/team/ahmad.jpg'.
  // When omitted, the holographic card falls back to initials.
  photo?: string;
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
    bio: 'Founder and CEO leading AR development and AR VR XR strategy from Islamabad.',
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
    bio: 'Lead creative developer for WebXR and 3D experiences on the AWGZO site.',
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
    bio: 'Web developer building responsive sites and e-commerce pages at AWGZO.',
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
    bio: 'Web developer turning designs into accessible, clean interfaces across devices.',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-05',
    index: '05',
    name: 'Fatima Huma',
    role: 'Digital Marketing Specialist',
    bio: 'Digital marketing specialist supporting campaigns and content for AR, VR and web services.',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
  {
    id: 'member-06',
    index: '06',
    name: 'Mohid',
    role: 'Lead Generation Specialist',
    bio: 'Lead generation specialist finding and qualifying enquiries for AR, VR and web services.',
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
    bio: 'SEO specialist improving visibility for AR VR XR and web service pages.',
    links: {
      linkedin: 'https://www.linkedin.com/company/awgzo/',
      instagram: 'https://www.instagram.com/awgzo/',
    },
  },
];

export function getTeamMembers(): TeamMember[] {
  return AWGZO_TEAM;
}
