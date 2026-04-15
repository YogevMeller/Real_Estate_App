import { createClient } from "./client";

// ── Generic row types (flat DB shapes) ─────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

// ── Properties ─────────────────────────────────────────────────────────────

export type PropertyView = {
  id: string;
  address: string;
  city: string;
  rooms: number;
  sqm: number;
  floor: number;
  totalFloors: number;
  price: number;
  yearBuilt: number | null;
  parking: string | null;
  hoa: number | null;
  elevator: boolean;
  balcony: boolean;
  storage: boolean;
  description: string | null;
  sellerName: string | null;
  sellerVerified: boolean;
  photos: string[];
  status: "active" | "sold" | "draft";
  createdAt: string;
};

function mapProperty(row: Row): PropertyView {
  const photos = (row.property_photos as Row[])
    ?.sort((a: Row, b: Row) => (a.position ?? 0) - (b.position ?? 0))
    .map((p: Row) => p.url as string) ?? [];

  const seller = row.profiles as Row | null;

  return {
    id: row.id,
    address: row.address,
    city: row.city,
    rooms: row.rooms,
    sqm: row.sqm,
    floor: row.floor,
    totalFloors: row.total_floors,
    price: row.price,
    yearBuilt: row.year_built,
    parking: row.parking,
    hoa: row.hoa,
    elevator: row.elevator,
    balcony: row.balcony,
    storage: row.storage,
    description: row.description,
    sellerName: seller?.first_name ?? null,
    sellerVerified: seller?.is_verified ?? false,
    photos,
    status: row.status,
    createdAt: row.created_at,
  };
}

export type PropertyFilters = {
  city?: string;
  roomsMin?: number;
  roomsMax?: number;
  priceMin?: number;
  priceMax?: number;
  sqmMin?: number;
  sqmMax?: number;
  floorMin?: number;
  floorMax?: number;
  elevator?: boolean;
  balcony?: boolean;
  parking?: boolean;
  storage?: boolean;
  ceilingHeightMin?: number;
  kitchenWall?: string;       // "drywall" → open-plan potential
  search?: string;
};

export async function getProperties(filters?: PropertyFilters, limit = 50) {
  const supabase = createClient();
  let query = supabase
    .from("properties")
    .select("*, property_photos(url, position), profiles!seller_id(first_name, is_verified)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters?.city) query = query.eq("city", filters.city);
  if (filters?.roomsMin) query = query.gte("rooms", filters.roomsMin);
  if (filters?.roomsMax) query = query.lte("rooms", filters.roomsMax);
  if (filters?.priceMin) query = query.gte("price", filters.priceMin);
  if (filters?.priceMax) query = query.lte("price", filters.priceMax);
  if (filters?.sqmMin) query = query.gte("sqm", filters.sqmMin);
  if (filters?.sqmMax) query = query.lte("sqm", filters.sqmMax);
  if (filters?.floorMin) query = query.gte("floor", filters.floorMin);
  if (filters?.floorMax) query = query.lte("floor", filters.floorMax);
  if (filters?.elevator) query = query.eq("elevator", true);
  if (filters?.balcony) query = query.eq("balcony", true);
  if (filters?.parking) query = query.neq("parking", null);
  if (filters?.storage) query = query.eq("storage", true);
  if (filters?.ceilingHeightMin) query = query.gte("ceiling_height", filters.ceilingHeightMin);
  if (filters?.kitchenWall) query = query.eq("kitchen_wall", filters.kitchenWall);
  if (filters?.search) query = query.or(`address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapProperty);
}

export async function getPropertyById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_photos(url, position), profiles!seller_id(first_name, is_verified)")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapProperty(data);
}

// ── Alerts ─────────────────────────────────────────────────────────────────

export type AlertView = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  propertyId: string | null;
};

export async function getUserAlerts(userId: string, limit = 20) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((a: Row): AlertView => ({
    id: a.id,
    title: a.title,
    description: a.description,
    type: a.type,
    isRead: a.is_read,
    createdAt: a.created_at,
    propertyId: a.property_id,
  }));
}

export async function markAlertsRead(userId: string) {
  const supabase = createClient();
  await supabase
    .from("alerts")
    .update({ is_read: true } as never)
    .eq("user_id", userId)
    .eq("is_read", false);
}

// ── Match Scores ───────────────────────────────────────────────────────────

export type MatchView = {
  id: string;
  propertyId: string;
  score: number;
  aiSummary: string | null;
  matchTags: string[];
  status: string;
  property: PropertyView | null;
};

export async function getUserMatches(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_scores")
    .select("*, properties(*, property_photos(url, position), profiles!seller_id(first_name, is_verified))")
    .eq("user_id", userId)
    .neq("status", "not_interested")
    .order("score", { ascending: false });
  if (error) return [];
  return (data ?? []).map((m: Row): MatchView => ({
    id: m.id,
    propertyId: m.property_id,
    score: m.score,
    aiSummary: m.ai_summary,
    matchTags: m.match_tags ?? [],
    status: m.status,
    property: m.properties ? mapProperty(m.properties) : null,
  }));
}

export async function dismissMatch(matchId: string) {
  const supabase = createClient();
  await supabase
    .from("match_scores")
    .update({ status: "not_interested" } as never)
    .eq("id", matchId);
}

// ── Saved Properties ───────────────────────────────────────────────────────

export async function getSavedProperties(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_properties")
    .select("*, properties(*, property_photos(url, position), profiles!seller_id(first_name, is_verified))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((s: Row) => mapProperty(s.properties));
}

export async function toggleSaveProperty(userId: string, propertyId: string, save: boolean) {
  const supabase = createClient();
  if (save) {
    await supabase.from("saved_properties").insert({ user_id: userId, property_id: propertyId } as never);
  } else {
    await supabase.from("saved_properties").delete().eq("user_id", userId).eq("property_id", propertyId);
  }
}

// ── Visits ─────────────────────────────────────────────────────────────────

export type VisitView = {
  id: string;
  propertyId: string;
  address: string;
  city: string;
  rooms: number;
  sqm: number;
  price: number;
  scheduledAt: string;
  status: string;
  sellerName: string | null;
};

export async function getUserVisits(userId: string, type: "upcoming" | "past") {
  const supabase = createClient();
  const now = new Date().toISOString();
  let query = supabase
    .from("visits")
    .select("*, properties(address, city, rooms, sqm, price)")
    .eq("buyer_id", userId);

  if (type === "upcoming") {
    query = query.in("status", ["pending", "confirmed"]).gte("scheduled_at", now).order("scheduled_at");
  } else {
    query = query.or(`status.eq.completed,scheduled_at.lt.${now}`).order("scheduled_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((v: Row): VisitView => ({
    id: v.id,
    propertyId: v.property_id,
    address: v.properties?.address ?? "",
    city: v.properties?.city ?? "",
    rooms: v.properties?.rooms ?? 0,
    sqm: v.properties?.sqm ?? 0,
    price: v.properties?.price ?? 0,
    scheduledAt: v.scheduled_at,
    status: v.status,
    sellerName: v.seller_name,
  }));
}

export async function cancelVisit(visitId: string) {
  const supabase = createClient();
  await supabase.from("visits").update({ status: "cancelled" } as never).eq("id", visitId);
}

// ── Reviews ────────────────────────────────────────────────────────────────

export type ReviewView = {
  id: string;
  propertyId: string;
  address: string;
  city: string;
  rating: number;
  text: string | null;
  tags: string[];
  helpfulCount: number;
  createdAt: string;
};

export async function getUserReviews(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, properties(address, city)")
    .eq("reviewer_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r: Row): ReviewView => ({
    id: r.id,
    propertyId: r.property_id,
    address: r.properties?.address ?? "",
    city: r.properties?.city ?? "",
    rating: r.rating,
    text: r.text,
    tags: r.tags ?? [],
    helpfulCount: r.helpful_count ?? 0,
    createdAt: r.created_at,
  }));
}

export async function submitReview(review: {
  propertyId: string;
  reviewerId: string;
  visitId?: string;
  rating: number;
  text?: string;
  tags?: string[];
  matchRating?: number;
}) {
  const supabase = createClient();
  await supabase.from("reviews").insert({
    property_id: review.propertyId,
    reviewer_id: review.reviewerId,
    visit_id: review.visitId ?? null,
    rating: review.rating,
    text: review.text ?? null,
    tags: review.tags ?? [],
    match_rating: review.matchRating ?? null,
  } as never);
}

// ── Buyer Profile ──────────────────────────────────────────────────────────

export type BuyerProfileView = {
  budgetMin: number | null;
  budgetMax: number | null;
  roomsMin: number | null;
  cities: string[];
  semanticTags: string[];
  freeText: string | null;
  purpose: string;
  hasKids: boolean;
};

export async function getBuyerProfile(userId: string): Promise<BuyerProfileView | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("buyer_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  const d = data as Row;
  return {
    budgetMin: d.budget_min,
    budgetMax: d.budget_max,
    roomsMin: d.rooms_min,
    cities: d.cities ?? [],
    semanticTags: d.semantic_tags ?? [],
    freeText: d.free_text,
    purpose: d.purpose,
    hasKids: d.has_kids ?? false,
  };
}

// ── Notification Preferences ───────────────────────────────────────────────

export type NotifPrefsView = {
  emailMatches: boolean;
  pushMatches: boolean;
  emailVisits: boolean;
  pushVisits: boolean;
  priceDrops: boolean;
  weeklyReport: boolean;
  newNeighborhood: boolean;
  aiInsights: boolean;
};

export async function getNotificationPrefs(userId: string): Promise<NotifPrefsView> {
  const supabase = createClient();
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (!data) return {
    emailMatches: true, pushMatches: true, emailVisits: true, pushVisits: true,
    priceDrops: true, weeklyReport: false, newNeighborhood: false, aiInsights: true,
  };
  const d = data as Row;
  return {
    emailMatches: d.email_matches ?? true,
    pushMatches: d.push_matches ?? true,
    emailVisits: d.email_visits ?? true,
    pushVisits: d.push_visits ?? true,
    priceDrops: d.price_drops ?? true,
    weeklyReport: d.weekly_report ?? false,
    newNeighborhood: d.new_neighborhood ?? false,
    aiInsights: d.ai_insights ?? true,
  };
}

export async function saveNotificationPrefs(userId: string, prefs: NotifPrefsView) {
  const supabase = createClient();
  await supabase.from("notification_preferences").upsert({
    user_id: userId,
    email_matches: prefs.emailMatches,
    push_matches: prefs.pushMatches,
    email_visits: prefs.emailVisits,
    push_visits: prefs.pushVisits,
    price_drops: prefs.priceDrops,
    weekly_report: prefs.weeklyReport,
    new_neighborhood: prefs.newNeighborhood,
    ai_insights: prefs.aiInsights,
  } as never, { onConflict: "user_id" });
}
