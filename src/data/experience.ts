export interface Role {
    title: string;
    period: string;
    description: string;
    current?: boolean;
}

export interface CompanyExperience {
    company: string;
    location?: string;
    roles: Role[];
}

export interface Project {
    title: string;
    type: string;
    period: string;
    description: string;
    link?: string;
    linkText?: string;
}

export const experiences: CompanyExperience[] = [
    {
        company: "Thrivent",
        roles: [
            {
                title: "Staff Engineer | Engineering Lead",
                period: "November 2023 - Present",
                description: "Enterprise Data & AI/ML Platform Engineering & Architecture",
                current: true,
            },
        ],
    },
    {
        company: "Northwestern Mutual",
        roles: [
            {
                title: "Senior Data Engineer | Team Lead",
                period: "August 2022 - November 2023",
                description: "Unified Data Platform Engineering",
            },
            {
                title: "Data Engineer",
                period: "November 2020 - August 2022",
                description: "Unified Data Platform Engineering",
            },
        ],
    },
    {
        company: "FIS",
        roles: [
            {
                title: "Software Engineer - Data Platform | Team Lead",
                period: "January 2020 - November 2022",
                description: "Ethos - Digital Analytics Platform",
            },
            {
                title: "Software Engineer Intern - Data Platform",
                period: "June 2019 - December 2019",
                description: "Ethos - Digital Analytics Platform",
            },
        ],
    },
];

export const projects: Project[] = [
    {
        title: "OpenLineage-Dagster Integration",
        type: "OSS Contribution",
        period: "Jan 2022 - Feb 2022",
        description: "Contributed to the open-source integration between OpenLineage and Dagster, enhancing data lineage visibility for data orchestration pipelines.",
        link: "https://github.com/OpenLineage/OpenLineage/pulls?q=is%3Apr+author%3Adalinkim",
        linkText: "View Contribution",
    },
];
