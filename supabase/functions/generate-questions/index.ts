import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Only POST requests are supported." }, 405);
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return jsonResponse({ error: "AI service is not configured." }, 500);
    }

    const body = await req.json();

    const subject = String(body.subject ?? "General Knowledge").slice(0, 150);
    const topic = String(body.topic ?? "Mixed topics").slice(0, 200);
    const difficulty = String(body.difficulty ?? "Medium").slice(0, 30);
    const count = Number(body.count ?? 10);

    if (!Number.isInteger(count) || count < 1 || count > 50) {
      return jsonResponse({
        error: "Request between 1 and 50 questions per batch.",
      }, 400);
    }

    const previousQuestions = Array.isArray(body.previousQuestions)
      ? body.previousQuestions
          .slice(-100)
          .map((q: unknown) => String(q).slice(0, 300))
      : [];

    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              question: { type: "string" },
              options: {
                type: "array",
                items: { type: "string" },
              },
              correctIndex: { type: "integer" },
              answer: { type: "string" },
              explanation: { type: "string" },
              optionExplanations: {
                type: "array",
                items: { type: "string" },
              },
              subject: { type: "string" },
              topic: { type: "string" },
              difficulty: { type: "string" },
            },
            required: [
              "question",
              "options",
              "correctIndex",
              "answer",
              "explanation",
              "optionExplanations",
              "subject",
              "topic",
              "difficulty",
            ],
          },
        },
      },
      required: ["questions"],
    };

    const prompt = `
Generate exactly ${count} original educational multiple-choice questions.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Requirements:
1. Each question must have exactly four distinct options.
2. correctIndex must be 0, 1, 2, or 3.
3. answer must exactly match options[correctIndex].
4. explanation must explain why the correct answer is correct.
5. optionExplanations must contain four explanations, one per option.
6. Explain why each incorrect option is wrong.
7. Use clear wording and accurate, unambiguous facts.
8. Avoid repeating questions in the supplied exclusion list.
9. Do not invent citations, sources, or statistics.
10. Return questions matching the requested JSON schema.

Previously used questions to avoid:
${previousQuestions.join("\n")}
`;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "You create high-quality educational MCQs with detailed explanations. Follow the schema exactly.",
            },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "openiq_question_bank",
              strict: true,
              schema,
            },
          },
        }),
      },
    );

    if (!aiResponse.ok) {
      const providerError = await aiResponse.text();
      console.error("AI provider returned an error:", providerError);
console.error("OpenAI HTTP status:", aiResponse.status);
console.error(
  "OpenAI error summary:",
  providerError.slice(0, 1000)
);
      return jsonResponse({
        error: "Question generation failed. Check the AI service configuration and try again.",
      }, 502);
    }

    const result = await aiResponse.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return jsonResponse({ error: "The AI returned an empty response." }, 502);
    }

    const parsed = JSON.parse(content);
    const questions = parsed.questions;

    if (!Array.isArray(questions) || questions.length !== count) {
      return jsonResponse({
        error: "The AI returned an unexpected number of questions. Please retry.",
      }, 502);
    }

    for (const q of questions) {
      if (
        typeof q.question !== "string" ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !q.options.every((o: unknown) => typeof o === "string") ||
        !Number.isInteger(q.correctIndex) ||
        q.correctIndex < 0 ||
        q.correctIndex > 3 ||
        q.answer !== q.options[q.correctIndex] ||
        typeof q.explanation !== "string" ||
        !Array.isArray(q.optionExplanations) ||
        q.optionExplanations.length !== 4 ||
        !q.optionExplanations.every((e: unknown) => typeof e === "string")
      ) {
        return jsonResponse({
          error: "A generated question failed validation. Please retry.",
        }, 502);
      }

      q.subject = subject;
      q.topic = topic;
      q.difficulty = difficulty;
    }

    return jsonResponse({ questions });
  } catch (error) {
    console.error("Question generator error:", error);

    return jsonResponse({
      error: "Unable to generate questions. Please retry.",
    }, 500);
  }
});
               
