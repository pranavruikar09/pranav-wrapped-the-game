import type { ReactNode } from "react";

/**
 * Every chapter (and the chess transition) is a single 100dvh slide:
 * header / content / footer, nothing scrolls. `overflow-hidden` on the
 * outer section is the enforcement — content must be sized to fit, not
 * left to spill and get clipped.
 */
export function ChapterLayout({
  id,
  header,
  footer,
  children,
  className = "",
  contentClassName = "",
}: {
  id?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      id={id}
      data-chapter-section
      // The larger bottom padding below lg reserves room for the ProgressRail's
      // fixed mobile chapter chip, which is pinned bottom-centre and would
      // otherwise sit on top of whatever the footer puts there.
      className={`relative grid h-dvh max-h-dvh w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden px-6 pb-16 pt-4 sm:px-10 sm:pt-6 lg:px-16 lg:pb-8 lg:pt-8 ${className}`}
    >
      <div className="min-h-0 min-w-0">{header}</div>
      <div
        className={`flex min-h-0 min-w-0 flex-col justify-center overflow-hidden ${contentClassName}`}
      >
        {children}
      </div>
      <div className="min-h-0 min-w-0">{footer}</div>
    </section>
  );
}
