import type { ContentItemMeta } from "@academic-portfolio/content";
import { dates } from "@academic-portfolio/utils";
import { ContentImage } from "@academic-portfolio/design-system";
import { JsonLd } from "../../../lib/JsonLd";
import { buildArticleSchema } from "../../../app/lib/structured-data";

export interface ContentDetailProps {
  content: ContentItemMeta;
}

export function ContentDetail({ content }: ContentDetailProps) {
  return (
    <article className="text-text-primary mx-auto flex w-full max-w-3xl flex-col gap-8 p-8">
      <JsonLd data={buildArticleSchema(content)} />
      <div className="bg-surface-elevated aspect-[16/9] w-full overflow-hidden rounded-xl">
        <ContentImage
          src={content.imageSrc}
          alt={content.title}
          className="h-full w-full object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 768px"
        />
      </div>
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-text-primary text-3xl leading-tight font-normal md:text-4xl">
          {content.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <time dateTime={content.date} className="text-text-secondary text-sm">
            {dates.formatISODate(content.date)}
          </time>
          {content.tags && content.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <li
                  key={tag}
                  className="border-border text-text-secondary rounded-full border px-3 py-1 text-sm font-medium"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        {content.authors && content.authors.length > 0 && (
          <p className="text-text-secondary text-sm">
            <span className="font-medium">Authors:</span>{" "}
            {content.authors.join(", ")}
            {content.venue && (
              <>
                {" · "}
                <span className="font-medium">Venue:</span> {content.venue}
              </>
            )}
            {content.doi && (
              <>
                {" · "}
                <a
                  href={`https://doi.org/${content.doi}`}
                  className="text-link hover:text-link-hover focus-visible:outline-focus break-all focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label={`DOI: ${content.doi}`}
                >
                  {content.doi}
                </a>
              </>
            )}
          </p>
        )}
      </header>
      <div className="text-text-primary flex flex-col gap-6">
        <div
          dangerouslySetInnerHTML={{ __html: content.body }}
          className="prose prose-lg prose-headings:text-text-primary prose-headings:font-bold prose-p:leading-[1.7] prose-p:my-4 prose-p:break-words prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm prose-a:text-link prose-a:break-words prose-a:no-underline prose-a:hover:underline prose-code:bg-code-bg prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-pre-bg prose-pre:text-pre-text prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-li:my-2 prose-img:max-w-full prose-img:rounded-lg prose-img:my-6 prose-table:border-collapse prose-table:w-full prose-table:my-4 prose-thead:bg-surface-tinted prose-th:border prose-th:border-border prose-th:p-2 prose-th:text-left prose-td:border prose-td:border-border prose-td:p-2 prose-strong:font-bold prose-strong:text-text-primary prose-em:italic text-text-primary max-w-none"
        />
      </div>
    </article>
  );
}
