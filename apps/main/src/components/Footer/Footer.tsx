import { siteConfig } from "../../configs/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-4">
      <div className="text-text-primary mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
          <p className="min-w-0 text-sm leading-6">
            © {year} {siteConfig.name}. Licensed under{" "}
            <a
              href={siteConfig.contentLicenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-link focus-visible:outline-focus underline transition-colors duration-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {siteConfig.contentLicenseName}
            </a>
            . Code licensed under{" "}
            <a
              href={siteConfig.repoLicenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-link focus-visible:outline-focus underline transition-colors duration-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {siteConfig.repoLicenseName}
            </a>
            .
          </p>
          <div className="flex flex-shrink-0 flex-wrap gap-4 text-sm">
            {siteConfig.linkedInUrl ? (
              <a
                href={siteConfig.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-link focus-visible:outline-focus underline transition-colors duration-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                LinkedIn
              </a>
            ) : null}
            {siteConfig.githubUrl ? (
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-link focus-visible:outline-focus underline transition-colors duration-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                GitHub
              </a>
            ) : null}
            {siteConfig.email ? (
              <a
                href={`mailto:${siteConfig.email}`}
                className="hover:text-link focus-visible:outline-focus underline transition-colors duration-200 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Email
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
