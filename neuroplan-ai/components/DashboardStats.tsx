"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Activity, Clock3, Trophy } from "lucide-react";

type StatsOverview = {
  totalTopics: number;
  averageEasinessFactor: number;
  retentionScore: number;
  dueTodayTopics: number;
  categories: {
    mastered: number;
    learning: number;
    struggling: number;
  };
};

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/stats/overview", { cache: "no-store" });
        const payload = (await res.json()) as StatsOverview & { error?: string };

        if (!res.ok) {
          throw new Error(payload.error || "Failed to fetch dashboard stats");
        }

        if (active) {
          setStats(payload);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch dashboard stats";
        if (active) {
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  const mastery = useMemo(() => {
    const total = stats?.totalTopics ?? 0;
    const mastered = stats?.categories.mastered ?? 0;
    const learning = stats?.categories.learning ?? 0;
    const struggling = stats?.categories.struggling ?? 0;

    if (total === 0) {
      return {
        masteredPercent: 0,
        learningPercent: 0,
        strugglingPercent: 0,
      };
    }

    return {
      masteredPercent: (mastered / total) * 100,
      learningPercent: (learning / total) * 100,
      strugglingPercent: (struggling / total) * 100,
    };
  }, [stats]);

  const totalProgress = useMemo(() => {
    if (!stats || stats.totalTopics === 0) {
      return 0;
    }

    return Number(((stats.categories.mastered / stats.totalTopics) * 100).toFixed(1));
  }, [stats]);

  const masterySegments = useMemo(() => {
    const slots = 40;
    const masteredSlots = Math.round((mastery.masteredPercent / 100) * slots);
    const learningSlots = Math.round((mastery.learningPercent / 100) * slots);
    const strugglingSlots = Math.max(0, slots - masteredSlots - learningSlots);

    return [
      ...Array.from({ length: masteredSlots }, () => "mastered" as const),
      ...Array.from({ length: learningSlots }, () => "learning" as const),
      ...Array.from({ length: strugglingSlots }, () => "struggling" as const),
    ];
  }, [mastery.learningPercent, mastery.masteredPercent]);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Overall Retention"
          value={loading ? "--" : `${stats?.retentionScore ?? 0}%`}
          subtitle={loading ? "Loading performance..." : `Avg EF: ${stats?.averageEasinessFactor ?? 0}`}
          icon={Activity}
        />

        <StatCard
          title="Topics Due Today"
          value={loading ? "--" : String(stats?.dueTodayTopics ?? 0)}
          subtitle={loading ? "Checking review queue..." : "Needs active review now"}
          icon={Clock3}
        />

        <StatCard
          title="Total Progress"
          value={loading ? "--" : `${totalProgress}%`}
          subtitle={
            loading
              ? "Calculating mastery..."
              : `${stats?.categories.mastered ?? 0} mastered of ${stats?.totalTopics ?? 0}`
          }
          icon={Trophy}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Mastery Progress</h3>
            <p className="text-sm text-slate-500">
              Distribution of mastered, learning, and struggling topics.
            </p>
          </div>
          {!loading && !error && (
            <p className="text-sm font-medium text-slate-700">{stats?.totalTopics ?? 0} total topics</p>
          )}
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
          <div className="grid h-full w-full grid-cols-[repeat(40,minmax(0,1fr))] gap-0.5">
            {masterySegments.map((segment, index) => (
              <div
                key={`${segment}-${index}`}
                className={
                  segment === "mastered"
                    ? "rounded-sm bg-emerald-500"
                    : segment === "learning"
                    ? "rounded-sm bg-amber-400"
                    : "rounded-sm bg-rose-500"
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <LegendItem
            label="Mastered"
            colorClass="bg-emerald-500"
            count={stats?.categories.mastered ?? 0}
            percent={mastery.masteredPercent}
          />
          <LegendItem
            label="Learning"
            colorClass="bg-amber-400"
            count={stats?.categories.learning ?? 0}
            percent={mastery.learningPercent}
          />
          <LegendItem
            label="Struggling"
            colorClass="bg-rose-500"
            count={stats?.categories.struggling ?? 0}
            percent={mastery.strugglingPercent}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

type IconType = ComponentType<{ className?: string }>;

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: IconType;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </article>
  );
}

function LegendItem({
  label,
  colorClass,
  count,
  percent,
}: {
  label: string;
  colorClass: string;
  count: number;
  percent: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="mb-1 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <p className="font-medium text-slate-700">{label}</p>
      </div>
      <p className="text-slate-500">
        {count} topics ({percent.toFixed(1)}%)
      </p>
    </div>
  );
}
