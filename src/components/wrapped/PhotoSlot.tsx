import type { Photo } from "@/content/cv";

/**
 * Photo frame. If `src` is empty it renders a clearly marked placeholder,
 * which is intentional: see the "blunder" about not photographing yourself.
 */
export function PhotoSlot({
  photo,
  className = "",
  ratio = "aspect-[4/5]",
}: {
  photo: Photo;
  className?: string;
  ratio?: string;
}) {
  return (
    <figure className={className}>
      <div
        className={`relative ${ratio} w-full overflow-hidden rounded-lg border border-border bg-card`}
      >
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.caption || photo.label}
            loading="lazy"
            className="h-full w-full object-cover"
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
      {photo.caption ? (
        <figcaption className="mt-3 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground">
          {photo.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
