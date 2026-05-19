import type { Block } from "./email-renderer";

export interface StarterTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  badge: string;
  badgeColor: string;
  blocks: Block[];
}

export const STARTER_TEMPLATES: StarterTemplate[] = [

  // ─── 1. LUXURY PROPERTY SHOWCASE ─────────────────────────────────────────────
  {
    id: "luxury-showcase",
    name: "Luxury Property Showcase",
    subject: "{{name}}, an extraordinary property awaits you",
    description: "Premium listing reveal with two Vimeo videos — cinematic tour + drone exterior. For high-end properties.",
    badge: "Luxury",
    badgeColor: "#f97316",
    blocks: [
      { type: "heading", content: "An Extraordinary Property", level: 1 },
      { type: "text", content: "Dear {{name}},\n\nI am thrilled to present an exceptional opportunity that perfectly matches your vision of the ideal home. This property represents the pinnacle of refined living — where every detail has been thoughtfully curated." },
      { type: "image", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=90", alt: "Luxury property exterior" },
      { type: "spacer", size: "sm" },
      { type: "heading", content: "Cinematic Interior Tour", level: 2 },
      { type: "text", content: "Step inside and experience the breathtaking interiors, bespoke finishes, and seamless indoor-outdoor living spaces." },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Full interior walkthrough — 4K cinematic tour" },
      { type: "divider" },
      { type: "heading", content: "Aerial Perspective", level: 2 },
      { type: "text", content: "Discover the commanding position of this estate, its surrounding landscape, and proximity to the finest amenities your lifestyle demands." },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Drone & aerial footage — estate grounds and location" },
      { type: "spacer", size: "md" },
      { type: "button", label: "Request Private Showing", url: "https://calendly.com/your-link", color: "#f97316" },
      { type: "button", label: "Download Property Brochure", url: "https://example.com/brochure", color: "#1e293b" },
    ],
  },

  // ─── 2. OPEN HOUSE INVITATION ─────────────────────────────────────────────────
  {
    id: "open-house",
    name: "Open House Invitation",
    subject: "You're invited — Exclusive Open House this Saturday",
    description: "Event-style invitation with property preview video, RSVP, and directions. Creates urgency.",
    badge: "Event",
    badgeColor: "#7c3aed",
    blocks: [
      { type: "heading", content: "You're Invited", level: 1 },
      { type: "text", content: "Dear {{name}},\n\nI would love for you to join me at an exclusive open house event this weekend. This is a rare opportunity to experience a truly remarkable home before it's listed to the public." },
      { type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=90", alt: "Open house property" },
      { type: "heading", content: "📅  Event Details", level: 2 },
      { type: "text", content: "📍  123 Maple Avenue, Beverly Hills, CA 90210\n🗓  Saturday, June 14th — 2:00 PM to 5:00 PM\n🍾  Light refreshments served\n🚗  Valet parking available" },
      { type: "divider" },
      { type: "heading", content: "Property Preview", level: 2 },
      { type: "text", content: "Get a sneak peek before you arrive. This 4-bedroom, 3.5-bath masterpiece has been featured in Architectural Digest." },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Property preview — 3 min walkthrough" },
      { type: "spacer", size: "sm" },
      { type: "heading", content: "The Neighborhood", level: 3 },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Neighborhood guide — local schools, dining & lifestyle" },
      { type: "spacer", size: "sm" },
      { type: "button", label: "RSVP — Reserve Your Spot", url: "https://calendly.com/your-link", color: "#7c3aed" },
      { type: "button", label: "Get Directions", url: "https://maps.google.com", color: "#374151" },
    ],
  },

  // ─── 3. JUST LISTED — HOT PROPERTY ───────────────────────────────────────────
  {
    id: "just-listed",
    name: "Just Listed — Hot Property",
    subject: "🔑 Just Listed: {{name}}, this one won't last long",
    description: "Urgent 'just listed' announcement with full walkthrough and key stats. Drives immediate action.",
    badge: "Just Listed",
    badgeColor: "#dc2626",
    blocks: [
      { type: "heading", content: "Just Listed", level: 1 },
      { type: "text", content: "{{name}}, this property just hit the market and I knew immediately you needed to see it. Based on your preferences, this checks every single box — and at this price, it will move fast." },
      { type: "image", url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=90", alt: "Just listed property" },
      { type: "heading", content: "Property Highlights", level: 2 },
      { type: "text", content: "💰  Listed at $1,295,000\n🛏  4 Bedrooms · 3 Bathrooms\n📐  3,200 sq ft on 0.4 acres\n🏊  Resort-style pool & outdoor kitchen\n⚡  Solar panels · Smart home system\n🏫  Top-rated school district" },
      { type: "divider" },
      { type: "heading", content: "Full Walkthrough Tour", level: 2 },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Complete interior & exterior tour" },
      { type: "heading", content: "Drone & Exterior View", level: 3 },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Aerial footage — lot, pool, and surroundings" },
      { type: "spacer", size: "sm" },
      { type: "text", content: "Properties like this typically receive multiple offers within 48 hours. I'd love to schedule a private showing at your earliest convenience." },
      { type: "button", label: "Book a Private Showing", url: "https://calendly.com/your-link", color: "#dc2626" },
    ],
  },

  // ─── 4. MONTHLY MARKET REPORT ────────────────────────────────────────────────
  {
    id: "market-report",
    name: "Monthly Market Report",
    subject: "{{name}}, your personalized market update — {{month}} 2025",
    description: "Stay top-of-mind with a data-driven market report. Includes video analysis and free valuation CTA.",
    badge: "Report",
    badgeColor: "#0891b2",
    blocks: [
      { type: "heading", content: "Your Monthly Market Update", level: 1 },
      { type: "text", content: "Hi {{name}},\n\nThe real estate market continues to evolve, and I want to ensure you have the most accurate, up-to-date information to make confident decisions — whether you're buying, selling, or simply keeping an eye on your investment." },
      { type: "image", url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=90", alt: "Market analysis" },
      { type: "heading", content: "📊  Market Snapshot", level: 2 },
      { type: "text", content: "📈  Median home price up 4.2% month-over-month\n⏱  Average days on market: 18 days (↓ from 24)\n🏠  Inventory down 12% — strong seller's market\n💵  Average list-to-sale ratio: 98.7%\n🔑  Mortgage rates: 6.85% (30-yr fixed)" },
      { type: "divider" },
      { type: "heading", content: "Video Market Analysis", level: 2 },
      { type: "text", content: "I've put together a detailed video breakdown of what these numbers mean specifically for your neighborhood and price range." },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Market analysis — your neighborhood deep dive" },
      { type: "heading", content: "Buyer vs. Seller Strategies", level: 3 },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Tips for buyers and sellers in this market" },
      { type: "spacer", size: "sm" },
      { type: "text", content: "Curious what your home is worth in today's market? I provide complimentary, no-obligation valuations for my clients." },
      { type: "button", label: "Get My Free Home Valuation", url: "https://calendly.com/your-link", color: "#0891b2" },
    ],
  },

  // ─── 5. NEIGHBORHOOD LIFESTYLE GUIDE ─────────────────────────────────────────
  {
    id: "neighborhood-guide",
    name: "Neighborhood Lifestyle Guide",
    subject: "{{name}}, discover the life waiting for you in {{neighborhood}}",
    description: "Sell the lifestyle, not just the property. Showcases dining, schools, culture, and community with two videos.",
    badge: "Lifestyle",
    badgeColor: "#059669",
    blocks: [
      { type: "heading", content: "Discover Your New Neighborhood", level: 1 },
      { type: "text", content: "Dear {{name}},\n\nBuying a home isn't just about the four walls — it's about the life you'll build around them. I want to give you an intimate look at what makes {{neighborhood}} one of the most sought-after communities in the area." },
      { type: "image", url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=90", alt: "Neighborhood street" },
      { type: "heading", content: "Life in {{neighborhood}}", level: 2 },
      { type: "text", content: "☕  Award-winning coffee shops & farm-to-table dining\n🎭  Vibrant arts district with galleries & live music\n🏃  28 miles of walking & biking trails\n🏫  Top 5% rated public schools (K-12)\n🛒  Whole Foods, Farmers Market every Sunday\n🌳  Over 40 parks and green spaces" },
      { type: "divider" },
      { type: "heading", content: "Neighborhood Walkthrough", level: 2 },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "A day in {{neighborhood}} — morning to night" },
      { type: "heading", content: "Schools & Family Life", level: 3 },
      { type: "text", content: "Families consistently rank {{neighborhood}} as one of the top communities for raising children. Here's an inside look at what makes the schools and community so special." },
      { type: "video", vimeoUrl: "https://vimeo.com/76979871", caption: "Schools, parks, and family amenities" },
      { type: "spacer", size: "sm" },
      { type: "text", content: "I'd love to take you on a personal tour of {{neighborhood}} and show you the properties that best fit your lifestyle and budget." },
      { type: "button", label: "Schedule a Neighborhood Tour", url: "https://calendly.com/your-link", color: "#059669" },
      { type: "button", label: "See Available Listings", url: "https://example.com/listings", color: "#1e293b" },
    ],
  },
];
