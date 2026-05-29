type FeatureCardProps = {
  title: string;
  text: string;
};

export default function FeatureCard({ title, text }: FeatureCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-black/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#7f1010]/25 hover:shadow-xl">
      <div className="mb-6 h-1 w-10 rounded-full bg-[#7f1010]" />
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-4 leading-7 text-[#6b7280]">{text}</p>
    </article>
  );
}
