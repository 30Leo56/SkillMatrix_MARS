import { useState } from "react";
import * as XLSX from "xlsx";

const initialRows = [];
const teamMembers = ["Anna", "Ben", "Chris"];

export default function SkillMatrixSetup() {
  const [rows, setRows] = useState(initialRows);
  const [projectText, setProjectText] = useState("");
  const [skills, setSkills] = useState({});

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

  const autoGenerateFromText = async () => {
    const response = await fetch("/skills.xlsx");
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    const skillsByCategory = {};
    workbook.SheetNames.forEach((sheetName) => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      skillsByCategory[sheetName] = rows.map((r) => r.Skill);
    });

    const tasks = [
      {
        aufgabe: "Insektenhotels konstruieren",
        rolle: "Bauleitung",
        kategorie: "Handwerk",
        skill: "Holzbearbeitung",
        soll: 3
      },
      {
        aufgabe: "Projekt dokumentieren",
        rolle: "Dokumentation",
        kategorie: "Kommunikation",
        skill: "Fotografie",
        soll: 2
      },
      {
        aufgabe: "Öffentlichkeitsarbeit planen",
        rolle: "PR",
        kategorie: "Marketing",
        skill: "Social Media",
        soll: 4
      }
    ];

    setRows(tasks);
  };

  return (
    <div className="p-4 space-y-10">
      <h1 className="text-xl font-bold">SkillMatrix NG - FINALTEST</h1>

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

      {rows.length > 0 && (
        <div className="pt-10">
          <table className="min-w-full border text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Aufgabe</th>
                <th className="border px-2 py-1">Rolle</th>
                <th className="border px-2 py-1">Kategorie</th>
                <th className="border px-2 py-1">Skill</th>
                <th className="border px-2 py-1">Soll</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">
                    <input type="text" placeholder="Aufgabe" value={row.aufgabe} onChange={(e) => handleChange(index, "aufgabe", e.target.value)} className="w-full p-1" />
                  </td>
                  <td className="border px-2 py-1">
                    <input type="text" placeholder="Rolle" value={row.rolle} onChange={(e) => handleChange(index, "rolle", e.target.value)} className="w-full p-1" />
                  </td>
                  <td className="border px-2 py-1">
                    <input type="text" placeholder="Kategorie" value={row.kategorie} onChange={(e) => handleChange(index, "kategorie", e.target.value)} className="w-full p-1" />
                  </td>
                  <td className="border px-2 py-1">
                    <input type="text" placeholder="Skill" value={row.skill} onChange={(e) => handleChange(index, "skill", e.target.value)} className="w-full p-1" />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <input type="number" min={1} max={4} value={row.soll} onChange={(e) => handleChange(index, "soll", e.target.value)} className="w-16 text-center" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-lg font-semibold pt-6">Team-Profile & Skill-Levels</h2>
      <div className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Skill</th>
              <th className="border px-2 py-1">Soll</th>
              <th className="border px-2 py-1">Lücke</th>
              <th className="border px-2 py-1">Defizit</th>
              {teamMembers.map(name => (
                <th key={name} className="border px-2 py-1">{name}</th>
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
