import Image from "next/image";

export function PickCallout({
  pickBy,
  note,
  label,
}: {
  pickBy: "max" | "lizzy";
  note: string;
  label: string;
}) {
  const isMax = pickBy === "max";
  return (
    <div
      className={`mt-6 flex items-start gap-3 rounded-3xl border p-4 ${
        isMax ? "border-wood/30 bg-wood/5" : "border-rose/30 bg-rose/5"
      }`}
    >
      <Image
        src={isMax ? "/images/max-avatar.png" : "/images/lizzy-avatar.png"}
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className={`text-sm font-bold ${isMax ? "text-wood-dark" : "text-rose-dark"}`}>{label}</p>
        <p className="mt-1 text-sm italic text-espresso/80">&ldquo;{note}&rdquo;</p>
      </div>
    </div>
  );
}
