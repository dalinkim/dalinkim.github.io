export interface Role {
    title: string;
    period: string;
    highlights: string[];
    current?: boolean;
}

export interface CompanyExperience {
    company: string;
    location: string;
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

export interface Education {
    degree: string;
    school: string;
    date: string;
}

export const experiences: CompanyExperience[] = [
    {
        company: "Thrivent",
        location: "Appleton, WI (Remote)",
        roles: [
            {
                title: "Staff Engineer - Enterprise AI/ML Platform (Engineering Lead)",
                period: "01/2025 – Present",
                current: true,
                highlights: [
                    "Designed and drove the foundational AI/ML platform architecture on Databricks, establishing a new home for data science teams and migrating them off a legacy data platform.",
                    "Led a paved-path approach to AI/ML delivery, building an MLOps framework with standardized CI/CD so deployments are repeatable across teams and environments.",
                    "Served as a primary engineering lead in the enterprise AI/ML charter, driving cross-org alignment on AI/ML direction, ownership, and delivery standards.",
                    "Shaped a hybrid Databricks + AWS architecture for batch and real-time ML, guiding teams through RBAC, environment readiness, cross-account networking, and IaC patterns on a new AWS platform.",
                    "Authored foundational ADRs on environment isolation and IaC standards, and owned the batch and real-time ML reference architecture as the source of truth for delivery decisions.",
                    "Reduced support load and onboarding time with self-service onboarding guides, support documentation, and reusable templates.",
                    "Ran hands-on lab sessions at the Thrivent Engineering Conference, organized recurring AI/ML communities of practice, and mentored engineers on platform architecture and intent.",
                ],
            },
            {
                title: "Staff Engineer - Enterprise Data Platform (Engineering Lead)",
                period: "11/2023 – 01/2025",
                highlights: [
                    "Orchestrated development and optimization of core data platform infrastructure streamlining end-to-end data engineering lifecycle and service reliability.",
                    "Engineered ingestion and transformation frameworks that productionalized 3k+ quality datasets accelerating data activation and time-to-delivery for downstream consumers.",
                    "Redesigned and automated data access request workflow achieving 90%+ reduction in fulfillment latency while strengthening security compliance.",
                ],
            },
        ],
    },
    {
        company: "Northwestern Mutual",
        location: "Milwaukee, WI",
        roles: [
            {
                title: "Senior Data Engineer - Data Platform (Team Lead)",
                period: "08/2022 – 11/2023",
                highlights: [
                    "Spearheaded development of unified data platform supporting DataOps. Enabled self-service data engineering artifact deployment, automated access controls, and integrated observability for distributed engineering teams.",
                    "Increased orchestration scalability by 10x while reducing infrastructure overhead by re-engineering Airflow DAG parsing and dynamic generation logic.",
                    "Modernized data workflow pattern that reduced compute costs and pipeline runtimes by over 60% through optimized infrastructure management.",
                ],
            },
            {
                title: "Data Engineer - Data Platform",
                period: "11/2020 – 08/2022",
                highlights: [
                    "Led design and implementation of core platform APIs and ETL framework.",
                    "Developed standardized internal microservice templates used to build and deploy 20+ core platform services.",
                    "Made OSS contributions to integrate OpenLineage with Dagster and automate metadata extraction for observability.",
                ],
            },
        ],
    },
    {
        company: "FIS",
        location: "Milwaukee, WI",
        roles: [
            {
                title: "Intern | Software Engineer - Data Platform (Team Lead)",
                period: "06/2019 – 10/2020",
                highlights: [
                    "Led two teams of 8 developers and built platform entitlement and configuration microservices with GraphQL API.",
                    "Built configurable ELT data pipelines and backend web services for Ethos data analytics platform.",
                ],
            },
        ],
    },
    {
        company: "Harley-Davidson Motor Company – Product Development Center",
        location: "Wauwatosa, WI",
        roles: [
            {
                title: "Data Analyst",
                period: "07/2016 – 08/2018",
                highlights: [
                    "Worked with various Test Engineering department's data and automated data collection, analysis, and reporting processes.",
                    "Maintained fleet management system and administered vehicle ordering process for internal stakeholders.",
                ],
            },
        ],
    },
    {
        company: "LG Electronics – Home Appliance R&D Center",
        location: "Buffalo Grove, IL",
        roles: [
            {
                title: "R&D Lab Engineer | Senior R&D Lab Engineer (Team Lead)",
                period: "01/2013 – 06/2016",
                highlights: [
                    "Founding member of R&D organization supporting the entire North American market.",
                    "Contributed to 30+ product launches with lab engineering, consumer research, and data analysis.",
                ],
            },
            {
                title: "Assistant Engineering Manager - OEM",
                period: "01/2011 – 01/2013",
                highlights: [
                    "Single engineering point of contact facilitating cross-functional communication for OEM business with Sears.",
                    "Supported the development of data-driven marketing claims and settled 200+ engineering design changes.",
                ],
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

export const education: Education[] = [
    {
        degree: "Master of Science in Computer Science",
        school: "University of Wisconsin – Milwaukee",
        date: "12/2019",
    },
    {
        degree: "Bachelor of Science in Electrical Engineering",
        school: "University of Wisconsin – Madison",
        date: "12/2010",
    },
];

export const skills: string[] = [
    "Java", "Scala", "Python", "SQL", "NoSQL", "AWS", "Spark", "Databricks", "Snowflake", "Airflow",
    "Dagster", "dbt", "REST", "GraphQL", "Spring Boot", "OpenFaaS", "Vert.x", "OpenLineage", "Marquez",
    "DataHub", "AWS Deequ", "Trino (Presto)", "Privacera", "Kafka", "DevOps", "Kubernetes", "Istio",
    "Helm", "Argo", "Docker", "Terraform", "GitLab", "GitHub", "BitBucket", "CICD", "Jenkins", "Linux",
    "Git", "Jira", "SAFe",
];

export const certifications: string[] = [
    "AWS Certified Cloud Practitioner",
    "AWS Certified AI Practitioner (Early Adopter)",
    "Databricks Certified Generative AI Engineer Associate",
    "Databricks Certified Associate Developer for Apache Spark 3.0",
    "Data Engineering with Databricks",
    "Optimizing Apache Spark™ on Databricks",
    "Airflow Fundamentals",
    "Certified SAFe 5 Practitioner",
    "Six Sigma Green Belt",
];
