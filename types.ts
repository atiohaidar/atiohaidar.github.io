
export interface ProjectLink {
  type: 'github' | 'postman' | 'live';
  url: string;
}

export interface Project {
  name: string;
  description: string;
  contribution: string;
  tech?: string[];
  links: ProjectLink[];
}

export interface Experience {
  date: string;
  title: string;
  company: string;
  description: string;
}

export interface Education {
    date: string;
    degree: string;
    institution: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
}

export interface Profile {
  name: string;
  logoSrc: string;
  heroGreeting: string;
  heroTagline: string;
  heroBio: string;
  contactPitch: string;
  socials: SocialLinks;
  copyright: string;
}

export interface CoreValue {
  title: string;
  description: string;
}

export interface Interest {
  title: string;
  description: string;
}

export interface About {
  description: string[];
  coreValues: CoreValue[];
  interests: Interest[];
}