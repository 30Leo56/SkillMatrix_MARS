import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import * as XLSX from 'xlsx';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req, res) {
  try {
    const { projectText } = await req.json();

    const filePath = path.join(process.cwd(), 'public', 'skills.xlsx');
    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    const allSkills = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      sheet.slice(1).forEach((row) => {
        if (row[0]) {
          allSkills.push({ kategorie: sheetName, skill: row[0] });
        }
      });
    });

    const prompt = `
Lies die folgende Projektbeschreibung und leite daraus konkrete Aufgaben ab.
Ordne jeder Aufgabe eine passende Rolle, eine der folgenden Skill-Kategorien und einen konkreten Skill aus dieser Kategorie zu:

Kategorien und Skills:
${allSkills.map((s) => `- ${s.kategorie}: ${s.skill}`).join('\n')}

Antwortformat (jede Aufgabe in einer neuen Zeile):
Aufgabe; Rolle; Kategorie; Skill

Projektbeschreibung:
${projectText}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    const responseText = completion.choices[0].message.content.trim();
    const lines = responseText.split("\n").filter(line => line.includes(";"));

    res.status(200).json({ tasks: lines });
  } catch (error) {
    console.error("Fehler beim Generieren:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}
