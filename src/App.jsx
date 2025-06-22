import { useState } from "react";

const initialData = [
  {
    aufgabe: "Kommunikationskampagne planen",
    rolle: "Projektleitung",
    skillkategorie: "Kommunikation",
    skill: "Texten",
    soll: 4,
    ist: "",
  },
  {
    aufgabe: "Kommunikationskampagne planen",
    rolle: "Social Media",
    skillkategorie: "Kommunikation",
    skill: "Instagram-Management",
    soll: 3,
    ist: "",
  },
  {
    aufgabe: "Kommunikationskampagne planen",
    rolle: "Pressearbeit",
    skillkategorie: "Kommunikation",
    skill: "Pressekontakt",
    soll: 3,
    ist: "",
  },
];

export default function SkillMatrixApp() {
  const [rows, setRows] = useState(initialData);

  const handleIstChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].ist = value;
    setRows(newRows);
  };

  const getDefizit = (soll, ist) => {
    if (ist === "") return "!!!";
    const istNum = parseInt(ist);
    if (isNaN(istNum)) return "?";
    if (soll - istNum >= 2) return "!";
    return "";
  };

  const getColor = (soll, ist) => {
    const istNum = parseInt(ist);
    if (ist === "") return "white";
    if (isNaN(istNum)) return "#eee";
    if (istNum === soll) return "lightgreen";
    if (istNum === soll - 1) return "yellow";
    if (istNum <= soll - 2) return "salmon";
    return "white";
  };

  return (
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {rows.map((row, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", alignItems: "center", gap: "1rem" }}>
            <div><strong>{row.aufgabe}</strong></div>
            <div>{row.rolle}</div>
            <div>{row.skillkategorie}</div>
            <div>{row.skill}</div>
            <div>Soll: {row.soll}</div>
            <div>
              <label style={{ fontSize: "0.8rem" }}>Ist:</label>
              <input
                type="text"
                value={row.ist}
                onChange={(e) => handleIstChange(index, e.target.value)}
                style={{ backgroundColor: getColor(row.soll, row.ist), padding: "4px", width: "50px" }}
              />
              <div style={{ fontSize: "0.75rem" }}>{getDefizit(row.soll, row.ist)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
