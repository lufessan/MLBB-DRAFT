import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

  const promptText = `أنت خبير في لعبة Mobile Legends: Bang Bang. قدم اقتراحاً لأفضل بطل كاونتر.

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
  }
}`;

  try {
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

    const text = response.text;
    if (!text || text.trim() === "") {
      console.error("Gemini returned empty response for counter suggestion");
      return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
    }

    try {
      const result = JSON.parse(text);
      if (!result.heroId || !result.heroName || !result.heroNameAr || !result.reason || !result.combatTips || !result.build) {
        console.error("Gemini response missing required fields:", result);
        return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
      }
      return result as CounterSuggestionResult;
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError, "Raw text:", text);
      return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
    }
  } catch (error) {
    console.error("Gemini counter API error:", error);
    return createFallbackSuggestion(heroesData, enemyHeroes, preferredLane);
  }
}

export async function getCoachResponse(
  question: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<CoachResponse> {
  const historyText = conversationHistory
    .map((msg) => `${msg.role === "user" ? "اللاعب" : "المدرب"}: ${msg.content}`)
    .join("\n");

  const promptText = `أنت مدرب خبير في لعبة Mobile Legends: Bang Bang. اسمك "المدرب الذكي".
  
قواعد مهمة:
1. أجب دائماً بالعربية فقط
2. كن مختصراً وعملياً (2-4 جمل كحد أقصى)
3. قدم نصائح تكتيكية محددة وقابلة للتطبيق
4. إذا ذكر اللاعب بطلاً معيناً، اذكر اسمه في الإجابة
5. كن ودوداً ومشجعاً

${historyText ? `المحادثة السابقة:\n${historyText}\n\n` : ""}
سؤال اللاعب: ${question}

قدم إجابتك بصيغة JSON:
{
  "response": "إجابتك هنا",
  "heroMentioned": "اسم البطل إذا تم ذكره أو null"
}`;

  try {
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
