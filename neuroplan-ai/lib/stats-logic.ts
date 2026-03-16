import { db } from "@/lib/db";

const EF_BASELINE = 2.5;

type TopicStatsInput = {
  easinessFactor: number;
};

export type CalculatedStats = {
  totalTopics: number;
  averageEasinessFactor: number;
  retentionScore: number;
  categories: {
    mastered: number;
    learning: number;
    struggling: number;
  };
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateStats(topics: TopicStatsInput[]): CalculatedStats {
  const totalTopics = topics.length;

  if (totalTopics === 0) {
    return {
      totalTopics: 0,
      averageEasinessFactor: 0,
      retentionScore: 0,
      categories: {
        mastered: 0,
        learning: 0,
        struggling: 0,
      },
    };
  }

  const sumEF = topics.reduce((sum, topic) => sum + topic.easinessFactor, 0);
  const averageEasinessFactor = sumEF / totalTopics;
  const retentionScore = clamp((averageEasinessFactor / EF_BASELINE) * 100, 0, 100);

  const mastered = topics.filter((topic) => topic.easinessFactor > 2.8).length;
  const learning = topics.filter(
    (topic) => topic.easinessFactor >= 2.0 && topic.easinessFactor <= 2.8
  ).length;
  const struggling = topics.filter((topic) => topic.easinessFactor < 2.0).length;

  return {
    totalTopics,
    averageEasinessFactor: Number(averageEasinessFactor.toFixed(2)),
    retentionScore: Number(retentionScore.toFixed(2)),
    categories: {
      mastered,
      learning,
      struggling,
    },
  };
}

export async function calculateRetentionScore(): Promise<number> {
  const result = await db.topic.aggregate({
    _avg: {
      easinessFactor: true,
    },
  });

  const averageEF = result._avg.easinessFactor ?? 0;
  const score = clamp((averageEF / EF_BASELINE) * 100, 0, 100);

  return Number(score.toFixed(2));
}

export type TopicEasinessCategories = {
  mastered: number;
  learning: number;
  struggling: number;
  total: number;
};

export async function categorizeTopicsByEasiness(): Promise<TopicEasinessCategories> {
  const [mastered, learning, struggling, total] = await Promise.all([
    db.topic.count({
      where: {
        easinessFactor: {
          gt: 2.8,
        },
      },
    }),
    db.topic.count({
      where: {
        easinessFactor: {
          gte: 2.0,
          lte: 2.8,
        },
      },
    }),
    db.topic.count({
      where: {
        easinessFactor: {
          lt: 2.0,
        },
      },
    }),
    db.topic.count(),
  ]);

  return {
    mastered,
    learning,
    struggling,
    total,
  };
}
