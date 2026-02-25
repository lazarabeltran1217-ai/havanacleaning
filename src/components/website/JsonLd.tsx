interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any> | null;
}

export function JsonLd({ data }: Props) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
