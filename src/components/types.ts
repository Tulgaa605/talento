export interface JobListing {
  title: string;
  type: string;
  salary: string;
  company: {
    name: string;
    logo: string;
    location: string;
  };
}

export interface ProcessStep {
  icon: string;
  title: string;
  description: string;
}

export interface StatCard {
  icon: string;
  value: string;
  label: string;
}
