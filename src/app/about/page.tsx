import type { Metadata } from "next";
import Image from "next/image";
import Avatar from "@/components/Avatar";
import { experiences, projects } from "@/data/experience";

export const metadata: Metadata = {
  title: "About",
  description: "Background, experience and projects of Dalin Kim, staff engineer.",
};

const LIKES = [
  { src: "/images/the-shot.jpg", alt: "The Shot", width: 1599, height: 1079 },
  { src: "/images/aj4-bred.jpg", alt: "Air Jordan 4 Bred sneakers", width: 1600, height: 1070 },
  { src: "/images/slam-dunk.jpg", alt: "Slam Dunk", width: 1600, height: 1074 },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 md:pt-20">
      {/* Intro */}
      <section className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <Avatar className="h-40 shrink-0 self-start rounded-2xl [&>span]:text-4xl md:[&>span]:text-4xl" />
        <div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight">About me</h1>
          <p className="mt-4 text-xl text-ink-muted">
            I&apos;m a husband, a father and a staff engineer at Thrivent, where I lead engineering
            for the enterprise data and AI/ML platform.
          </p>
          <p className="mt-4 text-ink-muted">
            {/* Placeholder: replace with a longer personal bio. */}
            I like turning messy data problems into platforms that other engineers enjoy using.
            Outside of work you&apos;ll find me with my family, or watching (and arguing about)
            basketball.
          </p>
        </div>
      </section>

      {/* Experience */}
      <section className="mt-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Experience</h2>
        <div className="mt-8 space-y-10">
          {experiences.map((company) => (
            <div key={company.company}>
              <h3 className="font-display text-2xl font-extrabold text-secondary">{company.company}</h3>
              <ol className="mt-4 space-y-6 border-l-2 border-line">
                {company.roles.map((role) => (
                  <li key={role.title} className="relative pl-6">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full ${
                        role.current ? "bg-primary ring-4 ring-primary-soft" : "bg-line"
                      }`}
                    />
                    <p className="text-lg font-bold">{role.title}</p>
                    <p className="text-sm text-ink-muted">{role.period}</p>
                    <p className="mt-1 text-ink-muted">{role.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mt-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Projects</h2>
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

      {/* Likes */}
      <section className="mt-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">Things I like</h2>
        <p className="mt-2 text-ink-muted">Basketball, mostly.</p>
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
