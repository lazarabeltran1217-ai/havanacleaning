import ReactMarkdown from "react-markdown";

export function BlogContent({ content }: { content: string }) {
  return (
    <div className="prose prose-tobacco max-w-none text-gray-600 leading-relaxed prose-headings:text-tobacco prose-headings:font-display prose-h2:text-2xl prose-h3:text-xl prose-strong:text-tobacco prose-a:text-green hover:prose-a:text-green/80 prose-li:marker:text-green">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
