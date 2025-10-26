export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="mx-auto mt-2 max-w-prose text-muted-foreground">{description}</p>}
      <p className="mx-auto mt-6 max-w-prose text-sm text-muted-foreground">This is a placeholder. Ask to generate this page's contents next and we'll build it with the same layout and style.</p>
    </div>
  );
}
