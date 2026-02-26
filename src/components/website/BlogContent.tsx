import ReactMarkdown from "react-markdown";
import Link from "next/link";

export function BlogContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-tobacco prose-headings:font-display prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-tobacco prose-a:text-green prose-a:underline hover:prose-a:text-green/80 prose-li:text-gray-600 prose-li:marker:text-green prose-ul:my-4 prose-ol:my-4">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("/")) {
              return (
                <Link href={href} className="text-green underline hover:text-green/80">
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-green underline hover:text-green/80">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
