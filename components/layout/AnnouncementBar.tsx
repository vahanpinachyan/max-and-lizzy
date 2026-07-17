import { getServerDictionary } from "@/lib/i18n/server";

function MessageGroup({ ariaHidden, announcements }: { ariaHidden?: boolean; announcements: readonly string[] }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {announcements.map((message, i) => (
        <span key={i} className="flex items-center whitespace-nowrap px-6 text-xs font-semibold uppercase tracking-wide">
          {message}
          <span className="ml-6 text-terracotta" aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </div>
  );
}

export async function AnnouncementBar() {
  const { dict } = await getServerDictionary();
  return (
    <div className="overflow-hidden overscroll-x-none bg-espresso py-2 text-cream" aria-label={dict.home.announcementsAria}>
      <div className="flex w-max animate-marquee">
        <MessageGroup announcements={dict.announcements} />
        <MessageGroup ariaHidden announcements={dict.announcements} />
      </div>
    </div>
  );
}
