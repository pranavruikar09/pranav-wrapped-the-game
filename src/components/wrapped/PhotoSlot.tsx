import type { Photo } from "@/content/cv";

/**
 * Photo frame. If `src` is empty it renders a clearly marked placeholder,
 * which is intentional: see the "blunder" about not photographing yourself.
 */
export function PhotoSlot({
  photo,
  className = "",
  ratio = "aspect-[4/5]",
  captionClassName = "mt-3 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground",
}: {
  photo: Photo;
  className?: string;
  ratio?: string;
  /** Override when a dense rail needs tighter caption spacing than the default. */
  captionClassName?: string;
}) {
  return (
    <figure className={className}>
      <div
        className={`hover-lift relative ${ratio} w-full overflow-hidden rounded-lg border border-border bg-card`}
      >
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.caption || photo.label}
            className="h-full w-full object-cover transition-[filter] duration-400 hover:brightness-110"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="grain absolute inset-0 opacity-60" aria-hidden />
            <div className="relative">
              <div className="font-mono text-[0.65rem] tracking-[0.3em] text-accent">
                {photo.label}
              </div>
              <p className="mt-3 max-w-[22ch] text-xs leading-relaxed text-muted-foreground">
                Frame reserved. A photograph belongs here.
              </p>
            </div>
          </div>
        )}
      </div>
      {photo.caption ? <figcaption className={captionClassName}>{photo.caption}</figcaption> : null}
    </figure>
  );
}
