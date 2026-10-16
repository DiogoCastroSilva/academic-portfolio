import { siteConfig } from "../../configs/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:px-6 dark:text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6">
            © {year} {siteConfig.name}. Licensed under{" "}
            <a
              href={siteConfig.contentLicenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors duration-200 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {siteConfig.contentLicenseName}
            </a>
            . Code licensed under{" "}
            <a
              href={siteConfig.repoLicenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors duration-200 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {siteConfig.repoLicenseName}
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href={siteConfig.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors duration-200 hover:text-slate-900 dark:hover:text-slate-100"
            >
              LinkedIn
            </a>
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors duration-200 hover:text-slate-900 dark:hover:text-slate-100"
            >
              GitHub
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="underline transition-colors duration-200 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
