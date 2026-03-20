export type FeatureCardData = {
  title: string;
  copy: string;
  cta: string;
  image: string;
};

export const featureCards: FeatureCardData[] = [
  {
    title: "Context-perfect AI chat",
    copy: "Ask once, get exactly what you need. Our AI understands your entire codebase and gives you precise answers with exact line references.",
    cta: "Try AI chat",
    image: "https://picsum.photos/1360/780?random=301",
  },
  {
    title: "Precision autocomplete",
    copy: "Stop choosing between 10 suggestions. capy gives you one perfect completion that matches your code style and intent.",
    cta: "See it in action",
    image: "https://picsum.photos/1360/780?random=302",
  },
  {
    title: "Agentic code actions",
    copy: "Delegate repetitive edits and keep full control while capy batches safe, reviewable changes directly in context.",
    cta: "Explore actions",
    image: "https://picsum.photos/1360/780?random=303",
  },
  {
    title: "Exact line references",
    copy: "Every suggestion links back to real files and lines, so reviews are faster and changes stay grounded in source of truth.",
    cta: "View references",
    image: "https://picsum.photos/1360/780?random=304",
  },
];
