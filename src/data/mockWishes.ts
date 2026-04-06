export interface Wish {
  id: string;
  text: string;
  author: string;
  handle: string;
  likes: number;
  replies: number;
  retweets: number;
  date: string;
  cluster: string;
  demandLevel: "high" | "medium" | "low";
  quoteSuggestions: string[];
  aiProductName?: string;
  aiDescription?: string;
  competitorGaps?: string[];
  saved?: boolean;
}

export const mockWishes: Wish[] = [
  {
    id: "1",
    text: "I wish there was a simple expense tracker designed specifically for freelancers that auto-categorizes by tax deduction type. Every app tries to be QuickBooks.",
    author: "Sarah Chen",
    handle: "@sarahchendev",
    likes: 1423,
    replies: 287,
    retweets: 342,
    date: "2024-03-15",
    cluster: "Freelance Finance",
    demandLevel: "high",
    quoteSuggestions: [
      "Add automatic tax categorization for Schedule C",
      "Simple CSV export for accountants",
      "Receipt photo scanning with OCR",
      "Quarterly estimated tax calculator",
      "Integration with Stripe & PayPal"
    ],
    aiProductName: "FreelanceLedger",
    aiDescription: "Dead-simple expense tracking built for solo creators — auto-categorizes deductions, calculates quarterly taxes, and exports clean reports for your accountant.",
    competitorGaps: ["QuickBooks too complex for solopreneurs", "Wave shutting down key features", "No app focuses on Schedule C specifically"],
  },
  {
    id: "2",
    text: "Why isn't there a bra sizing tool that actually works? Every calculator gives different results. Someone please make an AI-powered one with photo measurement.",
    author: "Maya Rodriguez",
    handle: "@mayarod",
    likes: 2891,
    replies: 543,
    retweets: 891,
    date: "2024-03-12",
    cluster: "Fashion Tech",
    demandLevel: "high",
    quoteSuggestions: [
      "Use phone camera for measurements",
      "Include brand-specific sizing charts",
      "Factor in different body shapes",
      "Recommend specific bras per size",
      "Privacy-first — process on device"
    ],
    aiProductName: "TrueFit Bra",
    aiDescription: "AI-powered bra sizing that uses your phone camera for accurate measurements, cross-references 200+ brands, and recommends your perfect fit.",
    competitorGaps: ["Current calculators use outdated formulas", "No brand-specific recommendations", "Privacy concerns with existing solutions"],
  },
  {
    id: "3",
    text: "Someone should make a meal prep planner that generates grocery lists based on what's on sale at YOUR local store. I'm tired of planning meals then finding nothing's on sale.",
    author: "James Park",
    handle: "@jamespcooks",
    likes: 892,
    replies: 156,
    retweets: 234,
    date: "2024-03-14",
    cluster: "Meal Prep & Food",
    demandLevel: "high",
    quoteSuggestions: [
      "Pull weekly flyers from local grocery stores",
      "Suggest recipes based on sale items",
      "Family size portion scaling",
      "Dietary restriction filters",
      "Automatic Instacart integration"
    ],
    aiProductName: "SaleMeal",
    aiDescription: "Meal prep planner that builds your weekly plan around local grocery store sales — save 30%+ on groceries while eating well.",
    competitorGaps: ["Mealime doesn't check local prices", "No app connects sales to recipes", "Manual process to check flyers"],
  },
  {
    id: "4",
    text: "I need an AI agent that monitors my competitors' pricing pages and alerts me when they change prices or add new tiers. Manual checking is killing me.",
    author: "David Liu",
    handle: "@davidliusaas",
    likes: 673,
    replies: 89,
    retweets: 178,
    date: "2024-03-13",
    cluster: "AI Tools & SaaS",
    demandLevel: "medium",
    quoteSuggestions: [
      "Screenshot comparison with visual diffs",
      "Slack/email alerts on changes",
      "Track feature comparison tables too",
      "Historical pricing data charts",
      "Monitor review sites for sentiment shifts"
    ],
    aiProductName: "PriceRadar",
    aiDescription: "AI agent that monitors competitor pricing pages 24/7 and alerts you to changes within minutes — never miss a pricing move again.",
    competitorGaps: ["Visualping too generic", "No SaaS-specific monitoring", "No pricing history analytics"],
  },
  {
    id: "5",
    text: "Why isn't there a niche directory builder? I want to create curated directories (best remote-friendly cafes, best indie dev tools) without coding. Like Notion but purpose-built.",
    author: "Alex Turner",
    handle: "@alextbuilds",
    likes: 1156,
    replies: 234,
    retweets: 321,
    date: "2024-03-11",
    cluster: "No-Code Tools",
    demandLevel: "high",
    quoteSuggestions: [
      "Embeddable widgets for blogs",
      "Community submission forms",
      "Monetization with featured listings",
      "SEO-optimized pages auto-generated",
      "Airtable/Notion import"
    ],
    aiProductName: "DirectoryKit",
    aiDescription: "Build beautiful, SEO-optimized niche directories in minutes — no code needed. Perfect for curators, communities, and affiliate marketers.",
    competitorGaps: ["Softr requires Airtable knowledge", "Carrd too limited for directories", "No built-in monetization"],
  },
  {
    id: "6",
    text: "I wish someone would make a simple habit tracker that works with my calendar. I don't want another app — just overlay habits on Google Calendar.",
    author: "Priya Sharma",
    handle: "@priyabuilds",
    likes: 456,
    replies: 78,
    retweets: 123,
    date: "2024-03-10",
    cluster: "Productivity",
    demandLevel: "medium",
    quoteSuggestions: [
      "Google Calendar native integration",
      "Streak tracking with visual heatmap",
      "Morning/evening routine templates",
      "Weekly review summaries via email"
    ],
    aiProductName: "CalHabit",
    aiDescription: "Habit tracking that lives inside your Google Calendar — no new app to open, just beautiful overlay streaks and weekly email reviews.",
    competitorGaps: ["Habitica too gamified", "Streaks is iOS only", "No calendar-native solution exists"],
  },
  {
    id: "7",
    text: "Need an app for parents that suggests age-appropriate activities based on weather, kid's age, and what supplies you actually have at home. Pinterest fails me daily.",
    author: "Emma Wilson",
    handle: "@emmawparenting",
    likes: 1834,
    replies: 412,
    retweets: 567,
    date: "2024-03-09",
    cluster: "Parenting",
    demandLevel: "high",
    quoteSuggestions: [
      "Weather-aware activity suggestions",
      "Filter by supplies already at home",
      "Age-appropriate developmental tags",
      "Save favorites and rate activities",
      "Community-submitted activities"
    ],
    aiProductName: "KidSpark",
    aiDescription: "Smart activity planner for parents — suggests age-perfect activities based on weather, available supplies, and developmental stage.",
    competitorGaps: ["Pinterest too broad and unfiltered", "No weather-aware suggestions", "No supply-based filtering"],
  },
  {
    id: "8",
    text: "Someone should build a fitness app for people who travel constantly. Hotel gym workouts, bodyweight routines for tiny Airbnb spaces, jet lag recovery protocols.",
    author: "Marcus Chen",
    handle: "@marcusfittravel",
    likes: 567,
    replies: 134,
    retweets: 189,
    date: "2024-03-08",
    cluster: "Fitness & Health",
    demandLevel: "medium",
    quoteSuggestions: [
      "Hotel gym equipment database",
      "Bodyweight-only small space routines",
      "Jet lag recovery with sleep/exercise timing",
      "Timezone-aware workout scheduling",
      "Offline mode for flights"
    ],
    aiProductName: "NomadFit",
    aiDescription: "Fitness companion for travelers — adaptive workouts for hotel gyms, tiny spaces, and jet lag recovery protocols synced to your timezone.",
    competitorGaps: ["Nike Training Club not travel-aware", "No jet lag exercise protocols", "No hotel gym equipment database"],
  },
];

export const trendingNiches = [
  { name: "AI Tools", count: 342, trend: "+24%" },
  { name: "Freelance Finance", count: 218, trend: "+18%" },
  { name: "Parenting Tech", count: 189, trend: "+31%" },
  { name: "Meal Prep", count: 156, trend: "+12%" },
  { name: "No-Code Tools", count: 134, trend: "+8%" },
  { name: "Fitness Tech", count: 98, trend: "+15%" },
];
