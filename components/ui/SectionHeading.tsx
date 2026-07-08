import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-sage-dark">
          {eyebrow}
        </p>
      )}
      <Tag className="text-4xl sm:text-5xl font-bold text-espresso">{title}</Tag>
      {description && <p className="mt-3 text-lg text-espresso/80">{description}</p>}
    </div>
  );
}
