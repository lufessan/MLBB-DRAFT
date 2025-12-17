import { z } from "zod";

export const heroSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string(),
  role: z.string(),
  roleAr: z.string(),
  lane: z.string(),
  laneAr: z.string(),
  image: z.string(),
});

export const laneSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string(),
});

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string(),
});

export const championsDataSchema = z.object({
  heroes: z.array(heroSchema),
  lanes: z.array(laneSchema),
  roles: z.array(roleSchema),
});

export type Hero = z.infer<typeof heroSchema>;
export type Lane = z.infer<typeof laneSchema>;
export type Role = z.infer<typeof roleSchema>;
export type ChampionsData = z.infer<typeof championsDataSchema>;

export const counterRequestSchema = z.object({
  enemyHeroes: z.array(z.string()).min(1).max(5),
  preferredLane: z.string(),
});

export const counterSuggestionSchema = z.object({
  heroId: z.string(),
  heroName: z.string(),
  heroNameAr: z.string(),
  reason: z.string(),
  combatTips: z.array(z.string()),
  build: z.object({
    items: z.array(z.string()),
    emblem: z.string(),
    emblemTalent: z.string(),
    skillOrder: z.string(),
  }),
  gamePhaseTips: z.object({
    earlyGame: z.object({
      timing: z.string(),
      strategy: z.string(),
      farmTips: z.array(z.string()),
    }),
    midGame: z.object({
      timing: z.string(),
      strategy: z.string(),
      teamFightTiming: z.string(),
    }),
    lateGame: z.object({
      timing: z.string(),
      strategy: z.string(),
      objectivePriority: z.array(z.string()),
    }),
  }).optional(),
  tricks: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
});

export const coachMessageSchema = z.object({
  role: z.enum(["user", "coach"]),
  content: z.string(),
  heroMentioned: z.string().optional(),
});

export const coachRequestSchema = z.object({
  userHero: z.string().optional(),
  enemyHeroes: z.array(z.string()).optional(),
  question: z.string(),
  conversationHistory: z.array(coachMessageSchema).optional(),
});

export type CounterRequest = z.infer<typeof counterRequestSchema>;
export type CounterSuggestion = z.infer<typeof counterSuggestionSchema>;
export type CoachMessage = z.infer<typeof coachMessageSchema>;
export type CoachRequest = z.infer<typeof coachRequestSchema>;
