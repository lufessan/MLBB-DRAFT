import { GoogleGenAI } from "@google/genai";

// API Key rotation system for load balancing and reliability
class ApiKeyManager {
  private keys: string[];
  private currentIndex: number = 0;
  private failedKeys: Map<string, number> = new Map();
  private readonly cooldownMs = 60000; // 1 minute cooldown

  constructor() {
    const keyEnvVars = [
      process.env.GEMINI_API_KEY_1 || "",
      process.env.GEMINI_API_KEY_2 || "",
      process.env.GEMINI_API_KEY_3 || "",
      process.env.GEMINI_API_KEY_4 || "",
      process.env.GEMINI_API_KEY_5 || "",
      process.env.GEMINI_API_KEY || "",
    ];
    const additionalKeys = (process.env.GEMINI_API_KEYS || "").split(",").filter(k => k.trim());
    this.keys = [...keyEnvVars, ...additionalKeys].filter(k => k.length > 0);
    
    if (this.keys.length === 0) {
      console.warn("No Gemini API keys configured!");
    } else {
      console.log(`API Key Manager initialized with ${this.keys.length} key(s)`);
    }
  }

  getCurrentKey(): string {
    if (this.keys.length === 0) return "";
    
    const now = Date.now();
    const startIndex = this.currentIndex;
    
    // Find a valid key starting from current index
    do {
      const key = this.keys[this.currentIndex];
      const failTime = this.failedKeys.get(key);
      
      if (!failTime || now - failTime > this.cooldownMs) {
        return key;
      }
      
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    } while (this.currentIndex !== startIndex);
    
    // All keys are in cooldown, clear oldest and use first key
    this.failedKeys.clear();
    this.currentIndex = 0;
    return this.keys[0];
  }

  advanceToNextKey(): void {
    if (this.keys.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }
  }

  markCurrentKeyFailed(): void {
    if (this.keys.length === 0) return;
    const key = this.keys[this.currentIndex];
    this.failedKeys.set(key, Date.now());
    console.warn(`API key marked as failed, will retry after cooldown`);
    this.advanceToNextKey();
  }

  clearCurrentKeyFailure(): void {
    if (this.keys.length === 0) return;
    const key = this.keys[this.currentIndex];
    this.failedKeys.delete(key);
  }

  getKeyCount(): number {
    return this.keys.length;
  }
}

const keyManager = new ApiKeyManager();

async function executeWithRetry<T>(operation: (ai: GoogleGenAI) => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    const key = keyManager.getCurrentKey();
    if (!key) {
      throw new Error("No API keys configured");
    }
    
    const ai = new GoogleGenAI({ apiKey: key });
    
    try {
      const result = await operation(ai);
      keyManager.clearCurrentKeyFailure();
      return result;
    } catch (error) {
      lastError = error as Error;
      keyManager.markCurrentKeyFailed();
      console.error(`API call failed (attempt ${i + 1}/${maxRetries}):`, error);
    }
  }
  
  throw lastError;
}

export interface CounterSuggestionResult {
  heroId: string;
  heroName: string;
  heroNameAr: string;
  reason: string;
  combatTips: string[];
  build: {
    items: string[];
    emblem: string;
    emblemTalent: string;
    skillOrder: string;
  };
  gamePhaseTips?: {
    earlyGame: {
      timing: string;
      strategy: string;
      farmTips: string[];
    };
    midGame: {
      timing: string;
      strategy: string;
      teamFightTiming: string;
    };
    lateGame: {
      timing: string;
      strategy: string;
      objectivePriority: string[];
    };
  };
  tricks?: Array<{
    name: string;
    description: string;
  }>;
}

export interface CoachResponse {
  response: string;
  heroMentioned?: string;
}

function createFallbackSuggestion(heroesData: any[], enemyHeroes: string[], preferredLane: string): CounterSuggestionResult {
  const fallbackHero = heroesData.find(
    (h: any) => h.lane.toLowerCase() === preferredLane.toLowerCase() && !enemyHeroes.includes(h.id)
  ) || heroesData.find((h: any) => !enemyHeroes.includes(h.id)) || heroesData[0];

  return {
    heroId: fallbackHero.id,
    heroName: fallbackHero.name,
    heroNameAr: fallbackHero.nameAr,
    reason: "هذا البطل مناسب للممر المختار ويمكنه التعامل مع تشكيلة العدو بشكل جيد. يتميز بقدرات قوية تساعده على الصمود والتفوق في المواجهات.",
    combatTips: [
      "حافظ على مسافة آمنة في بداية اللعبة وركز على جمع الذهب",
      "استخدم مهاراتك بحكمة ولا تهدرها في مواقف غير ضرورية",
      "تعاون مع فريقك في المعارك الجماعية وركز على الأهداف",
    ],
    build: {
      items: ["Tough Boots", "Blade of Despair", "Endless Battle", "Brute Force", "Athena's Shield", "Immortality"],
      emblem: "شعار المقاتل",
      emblemTalent: "Festival of Blood",
      skillOrder: "1-2-1-3-1-2-1-2-3-2-1-2-3",
    },
  };
}

export async function getCounterSuggestion(
  enemyHeroes: string[],
  preferredLane: string,
  heroesData: any[]
): Promise<CounterSuggestionResult> {
  const enemyHeroNames = enemyHeroes
    .map((id) => {
      const hero = heroesData.find((h: any) => h.id === id);
      return hero ? `${hero.name} (${hero.nameAr})` : id;
    })
    .join(", ");

  const laneMap: Record<string, string> = {
    gold: "Gold Lane (خط الذهب)",
    exp: "EXP Lane (خط الخبرة)",
    mid: "Mid Lane (الخط الأوسط)",
    jungle: "Jungle (الغابة)",
    roam: "Roam (التجوال)",
  };

  const laneName = laneMap[preferredLane] || preferredLane;

  const availableHeroes = heroesData
    .filter((h: any) => !enemyHeroes.includes(h.id))
    .slice(0, 50)
    .map((h: any) => `${h.id}: ${h.name} (${h.nameAr}) - ${h.role} - ${h.lane}`)
    .join("\n");

  const promptText = `أنت خبير في لعبة Mobile Legends: Bang Bang. قدم اقتراحاً لأفضل بطل كاونتر مع نصائح متقدمة لكل مرحلة من اللعبة.

أبطال العدو: ${enemyHeroNames}
الممر المفضل للاعب: ${laneName}

الأبطال المتاحة للاختيار:
${availableHeroes}

قدم إجابتك بصيغة JSON التالية بالضبط (كل النصوص بالعربية):
{
  "heroId": "معرف البطل من القائمة",
  "heroName": "اسم البطل بالإنجليزية",
  "heroNameAr": "اسم البطل بالعربية",
  "reason": "شرح مفصل لماذا هذا البطل هو أفضل كاونتر (3-4 جمل)",
  "combatTips": ["نصيحة قتالية 1", "نصيحة قتالية 2", "نصيحة قتالية 3"],
  "build": {
    "items": ["عنصر 1", "عنصر 2", "عنصر 3", "عنصر 4", "عنصر 5", "عنصر 6"],
    "emblem": "اسم الشعار",
    "emblemTalent": "اسم الموهبة",
    "skillOrder": "ترتيب رفع المهارات مثل: 1-2-1-3-1"
  },
  "gamePhaseTips": {
    "earlyGame": {
      "timing": "الدقيقة 0 إلى 5",
      "strategy": "استراتيجية البداية والفوكس على الفارم",
      "farmTips": ["نصيحة فارم 1", "نصيحة فارم 2", "كيف تسبق العدو في الجولد"]
    },
    "midGame": {
      "timing": "الدقيقة 5 إلى 12",
      "strategy": "متى تترك اللاين وتشارك في التيم فايت",
      "teamFightTiming": "متى يكون البطل قوي للمشاركة في التيم فايت (مثلا: بعد الحصول على البند الثاني أو عند المستوى 8)"
    },
    "lateGame": {
      "timing": "بعد الدقيقة 12",
      "strategy": "كيف تلعب في نهاية اللعبة وتحسم المباراة",
      "objectivePriority": ["الأهداف المهمة بالترتيب مثل: Lord, Turtle, Tower"]
    }
  },
  "tricks": [
    {
      "name": "اسم الخدعة أو الكومبو",
      "description": "شرح كيفية تنفيذ الخدعة ضد أبطال العدو المختارين"
    },
    {
      "name": "خدعة ثانية",
      "description": "شرح آخر"
    }
  ]
}`;

  try {
    const result = await executeWithRetry(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
      return response;
    });

    const text = result.text;
    if (!text || text.trim() === "") {
      console.error("Gemini returned empty response for counter suggestion");
      return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
    }

    try {
      const parsedResult = JSON.parse(text);
      if (!parsedResult.heroId || !parsedResult.heroName || !parsedResult.heroNameAr || !parsedResult.reason || !parsedResult.combatTips || !parsedResult.build) {
        console.error("Gemini response missing required fields:", parsedResult);
        return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
      }
      return parsedResult as CounterSuggestionResult;
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError, "Raw text:", text);
      return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
    }
  } catch (error) {
    console.error("Gemini counter API error:", error);
    return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
  }
}

export interface MetaHeroResult {
  heroes: Array<{
    heroId: string;
    tier: "S" | "A" | "B";
    reason: string;
  }>;
  lastUpdated: string;
  season: string;
}

function getCurrentDateArabic(): string {
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getCurrentSeason(): string {
  return `Season 38`;
}

export async function getMetaHeroes(heroesData: any[]): Promise<MetaHeroResult> {
  const heroList = heroesData
    .slice(0, 80)
    .map((h: any) => `${h.id}: ${h.name} (${h.nameAr}) - ${h.role} - ${h.lane}`)
    .join("\n");

  const currentDate = getCurrentDateArabic();
  const currentSeason = getCurrentSeason();

  const promptText = `أنت خبير في لعبة Mobile Legends: Bang Bang. قدم قائمة بأقوى 15 بطل في الميتا الحالية لسيزون ${currentDate}.

الأبطال المتاحة:
${heroList}

قدم إجابتك بصيغة JSON التالية:
{
  "heroes": [
    {"heroId": "معرف البطل", "tier": "S أو A أو B", "reason": "سبب قوته في الميتا الحالية"},
    ...
  ],
  "lastUpdated": "${currentDate}",
  "season": "${currentSeason}"
}

قواعد:
- اختر 15 بطل فقط من الأقوى
- 5 أبطال S-Tier (الأقوى)
- 5 أبطال A-Tier (قوي جداً)
- 5 أبطال B-Tier (قوي)
- استخدم heroId من القائمة بالضبط
- السبب يجب أن يكون جملة واحدة قصيرة بالعربية`;

  try {
    const result = await executeWithRetry(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
      return response;
    });

    const text = result.text;
    if (!text || text.trim() === "") {
      return getDefaultMetaHeroes();
    }

    try {
      const parsedResult = JSON.parse(text);
      if (!parsedResult.heroes || !Array.isArray(parsedResult.heroes)) {
        return getDefaultMetaHeroes();
      }
      return parsedResult as MetaHeroResult;
    } catch (parseError) {
      console.error("Failed to parse meta heroes JSON:", parseError);
      return getDefaultMetaHeroes();
    }
  } catch (error) {
    console.error("Gemini meta heroes API error:", error);
    return getDefaultMetaHeroes();
  }
}

function getDefaultMetaHeroes(): MetaHeroResult {
  return {
    heroes: [
      { heroId: "ling", tier: "S", reason: "قدرة عالية على التنقل والقتل السريع" },
      { heroId: "fanny", tier: "S", reason: "أقوى جانجلر في اللعبة" },
      { heroId: "wanwan", tier: "S", reason: "ضرر عالي ومناعة من الكراود كنترول" },
      { heroId: "valentina", tier: "S", reason: "قدرة على نسخ ألتميت أي بطل" },
      { heroId: "khufra", tier: "S", reason: "أفضل تانك للكاونتر" },
      { heroId: "beatrix", tier: "A", reason: "تنوع كبير في أسلوب اللعب" },
      { heroId: "lancelot", tier: "A", reason: "قدرة عالية على الهروب والقتل" },
      { heroId: "kagura", tier: "A", reason: "ضرر عالي وتحكم ممتاز" },
      { heroId: "chou", tier: "A", reason: "تنوع في الأدوار والكومبو القوي" },
      { heroId: "franco", tier: "A", reason: "هوك قوي يغير مجرى المعركة" },
      { heroId: "esmeralda", tier: "B", reason: "درع قوي وضرر مستمر" },
      { heroId: "yu_zhong", tier: "B", reason: "تحمل عالي وضرر ممتاز" },
      { heroId: "mathilda", tier: "B", reason: "دعم ممتاز مع حركة سريعة" },
      { heroId: "xavier", tier: "B", reason: "ضرر عالي من مسافة بعيدة" },
      { heroId: "julian", tier: "B", reason: "مرونة عالية في المهارات" },
    ],
    lastUpdated: getCurrentDateArabic(),
    season: getCurrentSeason(),
  };
}

export async function getCoachResponse(
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<CoachResponse> {
  const historyText = conversationHistory
    .map((msg) => `${msg.role === "user" ? "اللاعب" : "المدرب"}: ${msg.content}`)
    .join("\n");

  const promptText = `أنت مدرب خبير في لعبة Mobile Legends: Bang Bang. اسمك "المدرب الذكي".
  
قواعد مهمة جداً:
1. أجب دائماً بالعربية فقط - لا تستخدم الإنجليزية إطلاقاً
2. كن مختصراً جداً (جملة أو جملتين فقط) لأن الرد سيُقرأ صوتياً
3. قدم نصائح تكتيكية محددة وقابلة للتطبيق
4. إذا ذكر اللاعب بطلاً معيناً، اذكر اسمه بالعربية
5. كن ودوداً ومشجعاً
6. لا تستخدم أي كلمات إنجليزية حتى اسم اللعبة - استخدم "موبايل ليجند" بدلاً من "Mobile Legends"

${historyText ? `المحادثة السابقة:\n${historyText}\n\n` : ""}
سؤال اللاعب: ${question}

قدم إجابتك بصيغة JSON:
{
  "response": "إجابتك هنا",
  "heroMentioned": "اسم البطل إذا تم ذكره أو null"
}`;

  try {
    const response = await executeWithRetry(async (ai) => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
    });

    const text = response.text;
    if (!text || text.trim() === "") {
      console.error("Gemini returned empty response for coach");
      return {
        response: "عذراً، لم أتمكن من معالجة سؤالك. يرجى المحاولة مرة أخرى.",
      };
    }

    try {
      const result = JSON.parse(text);
      return {
        response: result.response || "عذراً، حدث خطأ غير متوقع.",
        heroMentioned: result.heroMentioned || undefined,
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini coach JSON:", parseError, "Raw text:", text);
      return {
        response: "عذراً، حدث خطأ في معالجة الرد. يرجى المحاولة مرة أخرى.",
      };
    }
  } catch (error) {
    console.error("Gemini coach API error:", error);
    return {
      response: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
    };
  }
}
