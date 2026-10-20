import type { ContentItemMeta } from "@academic-portfolio/content";
import { dates } from "@academic-portfolio/utils";
import { ContentImage } from "./ContentImage";
import { JsonLd } from "./JsonLd";
import { buildArticleSchema } from "../lib/structured-data";

interface ContentDetailProps {
  content: ContentItemMeta;
}

export function ContentDetail({ content }: ContentDetailProps) {
  return (
    <article className="mx-auto flex w-full max-w-3xl grow flex-col gap-8 rounded-2xl bg-white p-8 dark:bg-sky-50">
      <JsonLd data={buildArticleSchema(content)} />
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-300">
        <ContentImage
          src={content.imageSrc}
          alt={content.title}
          className="h-full w-full object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 768px"
        />
      </div>
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl leading-tight font-bold md:text-4xl">
          {content.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <time
            dateTime={content.date}
            className="text-sm text-gray-600 dark:text-zinc-600"
          >
            {dates.formatISODate(content.date)}
          </time>
          {content.tags && content.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm font-medium text-zinc-600 dark:border-zinc-500 dark:text-zinc-600"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <div className="flex flex-col gap-6 text-slate-900 dark:text-slate-900">
        <div
          dangerouslySetInnerHTML={{ __html: content.body }}
          className="prose prose-lg prose-headings:font-bold prose-p:leading-7 prose-p:my-4 prose-p:break-words prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm prose-a:break-words prose-a:no-underline prose-a:hover:underline prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-li:my-2 prose-img:rounded-lg prose-img:my-6 prose-table:border-collapse prose-table:w-full prose-table:my-4 prose-thead:bg-gray-100 dark:prose-thead:bg-gray-800 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:p-2 prose-th:text-left prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:p-2 prose-strong:font-bold prose-em:italic max-w-none text-gray-800 dark:text-gray-600"
        />
      </div>
    </article>
  );
}
