import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateTasksFromText(projectText, skillsList) {
  const prompt = `
Lies die folgende Projektbeschreibung und leite daraus konkrete Aufgaben ab.
Ordne jeder Aufgabe eine passende Rolle, eine Skill-Kategorie und exakt einen Skill aus der folgenden Liste zu:

${skillsList.map((s) => `- ${s.kategorie}: ${s.skill}`).join("\n")}

Format:
Aufgabe; Rolle; Kategorie; Skill

Projektbeschreibung:
${projectText}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  const result = completion.choices[0].message.content;
  return result
    .split("\n")
    .filter((line) => line.includes(";") && line.split(";").length === 4)
    .map((line) => {
      const [aufgabe, rolle, kategorie, skill] = line.split(";").map(s => s.trim());
      return { aufgabe, rolle, kategorie, skill, soll: 3 };
    });
}
