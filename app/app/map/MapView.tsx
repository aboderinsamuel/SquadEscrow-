"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { categoryLabel, naira } from "@/lib/utils";
import { SocialChip } from "@/components/SocialChip";

interface ArtisanPin {
  id: string;
  name: string;
  area: string;
  category: string;
  avg_rating: number;
  jobs_completed: number;
  credibility: number;
  source: "registered" | "discovered" | "claimed";
  claimed: boolean;
  followers: number;
  response_time_min: number | null;
  hourly_rate: number | null;
  photos: string[];
  socials: { platform: string; handle: string; verified: boolean; followers?: number }[];
  geo: { lat: number; lng: number };
}

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

declare global { interface Window { L?: any } }

export function MapView({ artisans }: { artisans: ArtisanPin[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const meMarker = useRef<any>(null);
  const markerLayer = useRef<any>(null);
  const [selected, setSelected] = useState<ArtisanPin | null>(null);
  const [filter, setFilter] = useState<"all" | "registered" | "discovered" | "top">("all");
  const [category, setCategory] = useState<string>("all");
  const [me, setMe] = useState<[number, number] | null>(null);

  const filtered = useMemo(() => {
    return artisans.filter((a) => {
      if (filter === "registered" && a.source !== "registered" && !a.claimed) return false;
      if (filter === "discovered" && a.source !== "discovered") return false;
      if (filter === "top" && a.credibility < 85) return false;
      if (category !== "all" && a.category !== category) return false;
      return true;
    });
  }, [artisans, filter, category]);

  // Load Leaflet via CDN once, init map
  useEffect(() => {
    let canceled = false;
    function ensureLeaflet(): Promise<any> {
      if (window.L) return Promise.resolve(window.L);
      return new Promise((resolve) => {
        // CSS
        if (!document.querySelector("link[data-leaflet]")) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.setAttribute("data-leaflet", "1");
          document.head.appendChild(link);
        }
        // JS
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.onload = () => resolve(window.L);
        document.head.appendChild(s);
      });
    }

    ensureLeaflet().then((L) => {
      if (canceled || !mapRef.current) return;
      const map = L.map(mapRef.current, {
        center: LAGOS_CENTER,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstance.current = map;

      // CartoDB Voyager — clean, light, modern look (matches our cream theme)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: "",
      }).addTo(map);

      markerLayer.current = L.layerGroup().addTo(map);

      // Try real geolocation, fallback to Lekki
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setMe([pos.coords.latitude, pos.coords.longitude]),
          () => setMe([6.4474, 3.4724]),
          { timeout: 4000 },
        );
      } else setMe([6.4474, 3.4724]);
    });

    return () => {
      canceled = true;
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  // Place "me" pin
  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstance.current || !me) return;
    if (meMarker.current) meMarker.current.remove();
    const icon = L.divIcon({
      className: "",
      html: `<div style="position:relative">
        <div style="position:absolute;inset:-12px;border-radius:50%;background:rgba(224,72,72,0.18);animation:pulseme 1.6s ease-out infinite"></div>
        <div style="width:18px;height:18px;border-radius:50%;background:#E04848;border:3px solid #FDF8EF;box-shadow:0 4px 10px rgba(0,0,0,0.25)"></div>
        <style>@keyframes pulseme{0%{transform:scale(0.6);opacity:0.6}100%{transform:scale(2);opacity:0}}</style>
      </div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    meMarker.current = L.marker(me, { icon }).addTo(mapInstance.current);
  }, [me]);

  // Re-render markers when filter changes
  useEffect(() => {
    const L = window.L;
    if (!L || !markerLayer.current) return;
    markerLayer.current.clearLayers();
    for (const a of filtered) {
      const top = a.credibility >= 85;
      const isReg = a.source === "registered" || a.claimed;
      const bg = top ? "#0E2A1F" : isReg ? "#3E8E5C" : "#F0A04A";
      const ring = top ? "#F0A04A" : isReg ? "#0E2A1F" : "#0A0A0A";
      const photoChar = a.photos[0] || "•";
      const icon = L.divIcon({
        className: "",
        html: `<div style="position:relative;cursor:pointer">
          <div style="width:36px;height:36px;border-radius:14px 14px 14px 4px;background:${bg};border:2px solid ${ring};box-shadow:0 6px 12px rgba(0,0,0,0.25);display:grid;place-items:center;font-size:18px;line-height:1;transform:rotate(-8deg)"><span style="transform:rotate(8deg)">${photoChar}</span></div>
          ${top ? `<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:#F0A04A;border:2px solid #FDF8EF"></div>` : ""}
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
      const m = L.marker([a.geo.lat, a.geo.lng], { icon }).addTo(markerLayer.current);
      m.on("click", () => setSelected(a));
    }
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-0 bg-cream-200">
      {/* Header overlay */}
      <header className="absolute top-0 inset-x-0 z-30 px-5 pt-[max(env(safe-area-inset-top),12px)] pb-3 bg-gradient-to-b from-cream-200 to-transparent">
        <div className="flex items-center justify-between gap-2">
          <Link href="/app/feed" className="grid h-10 w-10 place-items-center rounded-full bg-cream-50 ring-1 ring-ink/10 shadow-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <Logo size={26} />
          <Link href="/app/discover" className="grid h-10 w-10 place-items-center rounded-full bg-cream-50 ring-1 ring-ink/10 shadow-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          </Link>
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto -mx-5 px-5 pb-1">
          {(["all", "top", "registered", "discovered"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={"shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ring-1 transition " + (filter === f ? "bg-ink text-cream-50 ring-ink" : "bg-cream-50 text-ink/70 ring-ink/10")}>
              {f === "all" ? "All" : f === "top" ? "★ Top-rated" : f === "registered" ? "Verified" : "Discovered"}
            </button>
          ))}
          <span className="w-2" />
          {["all", "generator", "ac_hvac", "plumbing", "electrical", "cleaning", "hairstyling", "tailoring", "photography", "data_entry", "graphic_design"].map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={"shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium ring-1 transition " + (category === c ? "bg-coral-500 text-cream-50 ring-coral-500" : "bg-cream-50 text-ink/65 ring-ink/10")}>
              {c === "all" ? "Any service" : categoryLabel[c] || c}
            </button>
          ))}
        </div>
      </header>

      {/* Map */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Stat overlay */}
      <div className="absolute top-[150px] left-5 z-20 rounded-2xl bg-cream-50 ring-1 ring-ink/10 shadow-card px-3 py-2 text-[12px] text-ink/75">
        <b className="text-ink">{filtered.length}</b> artisans · <b className="text-ink">{filtered.filter(a => a.source === "discovered").length}</b> scraped · <b className="text-ink">{filtered.filter(a => a.credibility >= 85).length}</b> top-rated
      </div>

      {/* Legend */}
      <div className="absolute bottom-[110px] right-4 z-20 rounded-2xl bg-cream-50/95 ring-1 ring-ink/10 shadow-card p-2.5 text-[11px] text-ink/75">
        <Dot color="#0E2A1F" ring="#F0A04A" /> Top-rated
        <Dot color="#3E8E5C" /> Verified
        <Dot color="#F0A04A" /> Discovered
        <div className="flex items-center gap-1.5 mt-1"><span className="h-2 w-2 rounded-full bg-coral-500" /><span>You</span></div>
      </div>

      {/* Bottom sheet */}
      {selected && (
        <BottomSheet artisan={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function Dot({ color, ring }: { color: string; ring?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-0.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: ring ? `0 0 0 1.5px ${ring}` : undefined }} />
    </div>
  );
}

function BottomSheet({ artisan, onClose }: { artisan: ArtisanPin; onClose: () => void }) {
  const top = artisan.credibility >= 85;
  const isReg = artisan.source === "registered" || artisan.claimed;
  return (
    <div className="absolute inset-x-0 bottom-0 z-40 px-3 pb-3 animate-rise">
      <div className="rounded-3xl bg-cream-50 ring-1 ring-ink/10 shadow-card overflow-hidden">
        <div className="flex items-start gap-3 p-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-cream-50 text-2xl shrink-0">
            {artisan.photos[0] || "•"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-[17px] tracking-tight text-ink truncate">{artisan.name}</h3>
              {top && <Badge tone="gold">Top-rated</Badge>}
              {isReg ? <Badge tone="forest">Verified</Badge> : <Badge tone="outline">Scraped</Badge>}
            </div>
            <div className="text-[12.5px] text-ink/65 mt-0.5">
              {categoryLabel[artisan.category] || artisan.category} · {artisan.area} · ★ {artisan.avg_rating.toFixed(1)} ({artisan.jobs_completed})
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-ink/5 hover:bg-ink/10 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="px-4 pb-4">
          {/* Socials strip */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {artisan.socials.slice(0, 4).map((s, i) => (
              <SocialChip key={i} platform={s.platform as any} handle={s.handle} verified={s.verified} compact />
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat label="Credibility" v={`${artisan.credibility}/100`} />
            <Stat label="Followers" v={artisan.followers >= 1000 ? `${(artisan.followers/1000).toFixed(1)}k` : String(artisan.followers)} />
            <Stat label="Responds" v={artisan.response_time_min ? `${artisan.response_time_min}m` : "—"} />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link href={`/app/artisans/${artisan.id}`} className="flex-1"><Button block size="md" variant="secondary">View profile</Button></Link>
            <Link href={`/app/post?to=${artisan.id}`} className="flex-1"><Button block size="md">Hire now</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-xl bg-cream-100 ring-1 ring-ink/10 py-2">
      <div className="text-[10px] uppercase tracking-wider text-ink/55">{label}</div>
      <div className="text-[14px] font-bold text-ink mt-0.5">{v}</div>
    </div>
  );
}
