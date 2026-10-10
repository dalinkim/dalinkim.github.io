import type { Metadata } from "next";
import Image from "next/image";
import { certifications, education, experiences, projects, skills } from "@/data/experience";

export const metadata: Metadata = {
  title: "About",
  description: "Experience, education and skills of Dalin Kim, staff engineer.",
};

const LIKES = [
  { src: "/images/the-shot.jpg", alt: "The Shot", width: 1599, height: 1079 },
  { src: "/images/aj4-bred.jpg", alt: "Air Jordan 4 Bred sneakers", width: 1600, height: 1070 },
  { src: "/images/slam-dunk.jpg", alt: "Slam Dunk", width: 1600, height: 1074 },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-3xl font-extrabold tracking-tight">{children}</h2>;
}

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 md:pt-20">
      <section>
        <h1 className="font-display text-5xl font-extrabold tracking-tight">About me</h1>
        <p className="mt-4 text-xl text-ink-muted">
          I&apos;m a husband, a father and a staff engineer at Thrivent, where I lead engineering
          for the enterprise AI platform.
        </p>
      </section>

      <section className="mt-20">
        <SectionHeading>Experience</SectionHeading>
        <div className="mt-8 space-y-12">
          {experiences.map((company) => (
            <div key={company.company}>
              <div className="flex flex-col gap-x-4 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-display text-2xl font-extrabold text-secondary">{company.company}</h3>
                <p className="shrink-0 text-sm text-ink-muted">{company.location}</p>
              </div>
              <ol className="mt-4 space-y-8 border-l-2 border-line">
                {company.roles.map((role) => (
                  <li key={role.title} className="relative pl-6">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full ${
                        role.current ? "bg-primary ring-4 ring-primary-soft" : "bg-line"
                      }`}
                    />
                    <p className="text-lg font-bold leading-snug">{role.title}</p>
                    <p className="text-sm text-ink-muted">{role.period}</p>
                    <ul className="mt-3 space-y-2 text-base text-ink-muted">
                      {role.highlights.map((item) => (
                        <li key={item} className="relative pl-4">
                          <span aria-hidden="true" className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading>Projects</SectionHeading>
        <div className="mt-8 grid gap-5">
          {projects.map((project) => (
            <div
              key={project.title}
              className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow)]"
            >
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                {project.type} · {project.period}
              </p>
              <h3 className="mt-2 font-display text-xl font-extrabold">{project.title}</h3>
              <p className="mt-2 text-ink-muted">{project.description}</p>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-semibold text-primary hover:underline"
                >
                  {project.linkText ?? "View project"} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading>Education</SectionHeading>
        <div className="mt-8 space-y-5">
          {education.map((item) => (
            <div key={item.degree} className="flex flex-col gap-x-4 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-lg font-bold">{item.degree}</p>
                <p className="text-ink-muted">{item.school}</p>
              </div>
              <p className="shrink-0 text-sm text-ink-muted">{item.date}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <SectionHeading>Skills</SectionHeading>
        <ul className="mt-6 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li key={skill} className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20">
        <SectionHeading>Certifications</SectionHeading>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {certifications.map((cert) => (
            <li key={cert} className="rounded-xl border border-line bg-surface px-4 py-3 text-base font-semibold">
              {cert}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20">
        <SectionHeading>Things I like</SectionHeading>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {LIKES.map((img, i) => (
            <figure key={img.src} className={i % 2 ? "sm:translate-y-4" : ""}>
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 640px) 33vw, 100vw"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow)] transition-transform hover:-rotate-1 hover:scale-[1.02]"
              />
              <figcaption className="mt-2 text-center text-sm font-semibold text-ink-muted">{img.alt}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
