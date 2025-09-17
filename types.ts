
export interface ProjectLink {
  type: 'github' | 'postman' | 'live';
  url: string;
}

export interface Project {
  name: string;
  description: string;
  problem: string;
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
