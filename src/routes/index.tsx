import { createFileRoute } from "@tanstack/react-router";
import { Story } from "@/components/wrapped/Story";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pranav Wrapped — The Chess Edition" },
      {
        name: "description",
        content:
          "An interactive creative CV: a personal story told as a chess game, one move at a time. Opening, development, beauty, blunder, endgame.",
      },
      { property: "og:title", content: "Pranav Wrapped — The Chess Edition" },
      {
        property: "og:description",
        content:
          "Not a résumé. A chapter-by-chapter story about the player behind it — passions, family, beauty and one very repeatable blunder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Story />;
}
