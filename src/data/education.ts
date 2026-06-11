export interface EducationActivity {
  name: string;
  role: string;
  period: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
  details: string;
  activities: EducationActivity[];
}

export const education: EducationItem = {
  degree: 'B.Eng in Electrical & Electronic Engineering',
  school: 'Nanyang Technological University, Singapore',
  period: '2023 – 2027 (expected)',
  details: "CGPA 4.96/5.0 · Dean's List ×2 · ASEAN Undergraduate Scholar",
  activities: [
    {
      name: 'Machine Learning and Data Analytics Club @ NTU EEE',
      role: 'Projects Tech Lead (Main Committee)',
      period: 'Aug 2024 – May 2025',
      description: "Led the development of AI projects within the club's main committee.",
    },
  ],
};
