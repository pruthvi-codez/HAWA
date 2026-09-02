export default function ContentPage({ title, body }: { title: string; body: string }) {
  const paragraphs = body.split('\n\n');
  return (
    <div className="container-page max-w-2xl py-14">
      <h1 className="font-display text-3xl font-black uppercase tracking-tight">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/70">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
