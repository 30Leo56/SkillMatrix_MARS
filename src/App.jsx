import { useState } from "react";
import * as XLSX from "xlsx";

const initialTeamMembers = [
  "Name 1", "Name 2", "Name 3", "Name 4",
  "Name 5", "Name 6", "Name 7", "Name 8"
];

export default function SkillMatrixSetup() {
  const [rows, setRows] = useState([]);
  const [projectText, setProjectText] = useState("");
  const [skills, setSkills] = useState({});
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = field === "soll" ? parseInt(value) || 1 : value;
    setRows(updated);
  };

  const handleSkillChange = (skillKey, member, value) => {
    setSkills({
      ...skills,
      [skillKey]: {
        ...skills[skillKey],
        [member]: parseInt(value) || 0
      }
    });
  };

  const handleNameChange = (index, value) => {
    const updated = [...teamMembers];
    updated[index] = value;
    setTeamMembers(updated);
  };

  const autoGenerateFromText = async () => {
    const response = await fetch("/skills.xlsx");
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    const skillsByCategory = {};
    workbook.SheetNames.forEach((sheetName) => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      skillsByCategory[sheetName] = rows.map((r) => r.Skill);
    });

    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}
`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Analysiere den Projekttext und gib Aufgaben mit zugehöriger Rolle, Kategorie und passenden Skills zurück. Die Skills dürfen nur aus den bereitgestellten Listen verwendet werden."
          },
          {
            role: "user",
            content: projectText
          }
        ]
      })
    });

    const apiData = await apiResponse.json();
    const parsedText = apiData.choices?.[0]?.message?.content || "";
    const lines = parsedText.split("\n").filter((line) => line.includes(";") && line.split(";").length >= 4);

    const generated = lines.map((line) => {
      const [aufgabe, rolle, kategorie, skill] = line.split(";").map((s) => s.trim());
      return { aufgabe, rolle, kategorie, skill, soll: 3 };
    });

    setRows(generated);
  };

  return (
    <div className="p-4 space-y-10">
      <h1 className="text-xl font-bold">SkillMatrix NG - GPT API</h1>

      <section className="w-full px-4 mb-16">
        <label htmlFor="projektbeschreibung" className="block text-sm font-semibold mb-2">
          Projektbeschreibung eingeben:
        </label>
        <textarea
          id="projektbeschreibung"
          value={projectText}
          onChange={(e) => setProjectText(e.target.value)}
          className="w-full h-48 p-3 border border-gray-300 rounded text-sm"
          placeholder="Hier Projektbeschreibung eingeben..."
        />
        <div className="mt-4">
          <button
            onClick={autoGenerateFromText}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Projektstruktur mit KI erzeugen
          </button>
        </div>
      </section>

      <h2 className="text-lg font-semibold pt-6">Team-Profile & Skill-Levels</h2>
      <div className="overflow-auto">
        <table className="min-w-full border text-sm mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">Aufgabe</th>
              <th className="border px-2 py-1">Rolle</th>
              <th className="border px-2 py-1">Kategorie</th>
              <th className="border px-2 py-1">Skill</th>
              <th className="border px-2 py-1">Soll</th>
              <th className="border px-2 py-1">Lücke</th>
              <th className="border px-2 py-1">Defizit</th>
              {teamMembers.map((name, index) => (
                <th key={index} className="border px-2 py-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="text-center w-20"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const skillName = row.skill;
              const soll = row.soll;
              const skillLevels = skills[skillName] || {};
              const allZeros = teamMembers.every(member => (skillLevels[member] || 0) === 0);
              const allDeficit = teamMembers.every(member => (skillLevels[member] || 0) < soll);
              const zeilenDefizit = !allZeros && allDeficit ? "!" : "";

              return (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.aufgabe}</td>
                  <td className="border px-2 py-1">{row.rolle}</td>
                  <td className="border px-2 py-1">{row.kategorie}</td>
                  <td className="border px-2 py-1">{skillName}</td>
                  <td className="border px-2 py-1 text-center">{soll}</td>
                  <td className="border px-2 py-1 text-center font-bold text-red-600">{allZeros ? "!!!" : ""}</td>
                  <td className="border px-2 py-1 text-center font-bold text-yellow-600">{zeilenDefizit}</td>
                  {teamMembers.map(member => {
                    const ist = skillLevels[member] || 0;
                    const defizit = soll - ist >= 2 ? "!" : "";

                    return (
                      <td
                        key={member}
                        className="border px-2 py-1 text-center"
                        style={{
                          backgroundColor:
                            ist === soll
                              ? "#BBF7D0"
                              : soll - ist === 1
                              ? "#FEF08A"
                              : soll - ist >= 2
                              ? "#FECACA"
                              : "transparent"
                        }}
                      >
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={4}
                            value={ist}
                            onChange={(e) => handleSkillChange(skillName, member, e.target.value)}
                            className="w-12 text-center bg-transparent"
                          />
                          {defizit && (
                            <span className="absolute right-1 top-0 text-red-500 font-bold">{defizit}</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
