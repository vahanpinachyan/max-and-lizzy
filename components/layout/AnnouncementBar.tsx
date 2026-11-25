import { getServerDictionary } from "@/lib/i18n/server";
import { getSeason } from "@/lib/season-server";

function MessageGroup({
  ariaHidden,
  announcements,
  christmas,
}: {
  ariaHidden?: boolean;
  announcements: readonly string[];
  christmas?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {announcements.map((message, i) => (
        <span key={i} className="flex items-center whitespace-nowrap px-6 text-xs font-semibold uppercase tracking-wide">
          {message}
          <span className={`ml-6 ${christmas ? "text-gold" : "text-terracotta"}`} aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </div>
  );
}

export async function AnnouncementBar() {
  const { dict } = await getServerDictionary();
  const christmas = (await getSeason()) === "christmas";

  // In season the bar carries the Christmas messages instead of the usual
  // ones, rather than both: doubling the marquee's length halves how often
  // any single line is read. The everyday facts it would push out — free
  // pickup, safety testing, local delivery — are repeated in the Christmas
  // set for that reason.
  const announcements = christmas ? dict.christmas.announcements : dict.announcements;

  return (
    <div
      className={`overflow-hidden py-2 ${christmas ? "bg-holly text-snow" : "bg-espresso text-cream"}`}
      aria-label={dict.home.announcementsAria}
    >
      <div className="flex w-max animate-marquee">
        <MessageGroup announcements={announcements} christmas={christmas} />
        <MessageGroup ariaHidden announcements={announcements} christmas={christmas} />
      </div>
    </div>
  );
}
