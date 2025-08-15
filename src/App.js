import "./App.css";
import React, { useState, useEffect } from "react";
import "./App.css";
import { Button, Stack, TextField } from "@mui/material";
const PLACE_RADIUS = 30;
// // Votre réseau de Petri préconfiguré
// const INITIAL_PETRI_NET = {
//   places: [
//     { id: "P0", label: "Entrée électeur", x: 100, y: 150, tokens: 1 },
//     { id: "P1", label: "En vérification", x: 250, y: 150, tokens: 0 },
//     { id: "P2", label: "Autorisé à voter", x: 400, y: 100, tokens: 0 },
//     { id: "P3", label: "Refusé / Sortie", x: 400, y: 200, tokens: 0 },
//     { id: "P4", label: "A pris le bulletin", x: 550, y: 150, tokens: 0 },
//     { id: "P5", label: "A voté", x: 700, y: 150, tokens: 0 },
//     { id: "P6", label: "A signé / Sortie", x: 850, y: 150, tokens: 0 },
//   ],
//   transitions: [
//     {
//       id: "T1",
//       label: "Vérifier droit de vote",
//       x: 175,
//       y: 150,
//       from: "P0",
//       to: "P1",
//     },
//     { id: "T2a", label: "Refusé", x: 325, y: 200, from: "P1", to: "P3" },
//     { id: "T2b", label: "Autorisé", x: 325, y: 100, from: "P1", to: "P2" },
//     {
//       id: "T3",
//       label: "Prendre bulletin",
//       x: 475,
//       y: 150,
//       from: "P2",
//       to: "P4",
//     },
//     { id: "T4", label: "Voter", x: 625, y: 150, from: "P4", to: "P5" },
//     {
//       id: "T5",
//       label: "Signer et sortir",
//       x: 775,
//       y: 150,
//       from: "P5",
//       to: "P6",
//     },
//   ],
//   arcs: [
//     { from: "P0", to: "T1" },
//     { from: "T1", to: "P1" },
//     { from: "P1", to: "T2a" },
//     { from: "P1", to: "T2b" },
//     { from: "T2a", to: "P3" },
//     { from: "T2b", to: "P2" },
//     { from: "P2", to: "T3" },
//     { from: "T3", to: "P4" },
//     { from: "P4", to: "T4" },
//     { from: "T4", to: "P5" },
//     { from: "P5", to: "T5" },
//     { from: "T5", to: "P6" },
//   ],
// };
function App() {
  const [places, setPlaces] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [arcs, setArcs] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [tokenId, setTokenId] = useState(0);

  const [formTransition, setFormTransition] = useState({
    id: "",
    from: "",
    to: "",
  });

  // Obtenir les coordonnées d'un élément
  const getCoordinates = (id) => {
    const place = places.find((p) => p.id === id);
    if (place) return { x: place.x, y: place.y };
    const transition = transitions.find((t) => t.id === id);
    if (transition) return { x: transition.x, y: transition.y };
    return { x: 0, y: 0 };
  };

  // Calculer ligne avec décalage pour que flèche touche le bord
  const getLineCoords = (fromId, toId) => {
    const start = getCoordinates(fromId);
    const end = getCoordinates(toId);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    const offset = PLACE_RADIUS;
    const newStart = {
      x: start.x + Math.cos(angle) * offset,
      y: start.y + Math.sin(angle) * offset,
    };
    const newEnd = {
      x: end.x - Math.cos(angle) * offset,
      y: end.y - Math.sin(angle) * offset,
    };
    return { start: newStart, end: newEnd };
  };

  // Drag & Drop
  const handleMouseDown = (id, type) => (e) => {
    setDragItem({ id, type });
  };

  const handleMouseMove = (e) => {
    if (!dragItem) return;
    const { id, type } = dragItem;
    const newX = e.nativeEvent.offsetX;
    const newY = e.nativeEvent.offsetY;

    if (type === "place") {
      setPlaces((prev) =>
        prev.map((p) => (p.id === id ? { ...p, x: newX, y: newY } : p))
      );
    } else if (type === "transition") {
      setTransitions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, x: newX, y: newY } : t))
      );
    }
  };

  const handleMouseUp = () => setDragItem(null);

  // Ajouter une place
  const addPlace = () => {
    const id = `P${places.length + 1}`;
    setPlaces([
      ...places,
      { id, x: 100 + places.length * 50, y: 150, tokens: 0 },
    ]);
  };

  // Ajouter un jeton
  const addToken = (placeId) => {
    const place = places.find((p) => p.id === placeId);
    if (place) {
      place.tokens += 1;
      setTokens([
        ...tokens,
        {
          id: tokenId,
          x: place.x,
          y: place.y,
          targetX: place.x,
          targetY: place.y,
        },
      ]);
      setTokenId(tokenId + 1);
    }
  };

  // Ajouter une transition
  const addTransition = (e) => {
    e.preventDefault();
    if (!formTransition.id || !formTransition.from || !formTransition.to)
      return;
    const newTrans = {
      id: formTransition.id,
      from: formTransition.from.includes(",")
        ? formTransition.from.split(",")
        : formTransition.from,
      to: formTransition.to.includes(",")
        ? formTransition.to.split(",")
        : formTransition.to,
      x: 200 + transitions.length * 50,
      y: 150,
    };
    setTransitions([...transitions, newTrans]);

    // Ajouter arcs
    const newArcs = [
      ...arcs,
      ...(Array.isArray(newTrans.from)
        ? newTrans.from.map((fid) => ({ from: fid, to: newTrans.id }))
        : [{ from: newTrans.from, to: newTrans.id }]),
      ...(Array.isArray(newTrans.to)
        ? newTrans.to.map((tid) => ({ from: newTrans.id, to: tid }))
        : [{ from: newTrans.id, to: newTrans.to }]),
    ];
    setArcs(newArcs);

    setFormTransition({ id: "", from: "", to: "" });
  };

  // Déclencher une transition (vérification stricte)
  const fireTransition = (t) => {
    const fromIds = Array.isArray(t.from) ? t.from : [t.from];

    // Vérifier que toutes les places entrantes ont au moins 1 jeton
    const canFire = fromIds.every((fid) => {
      const p = places.find((pl) => pl.id === fid);
      return p && p.tokens > 0;
    });
    if (!canFire) return alert(`La transition ${t.id} n'est pas franchissable`);

    setPlaces((prevPlaces) => {
      const newPlaces = prevPlaces.map((p) => ({ ...p }));

      // Retirer 1 jeton de chaque place entrante
      fromIds.forEach((fid) => {
        const fromPlace = newPlaces.find((p) => p.id === fid);
        fromPlace.tokens -= 1;
      });

      // Ajouter 1 jeton à une place sortante (ou plusieurs)
      const toIds = Array.isArray(t.to) ? t.to : [t.to];
      toIds.forEach((toId) => {
        const toPlace = newPlaces.find((p) => p.id === toId);
        if (toPlace) toPlace.tokens += 1;

        // Ajouter animation du jeton
        const start = getCoordinates(fromIds[0]); // origine d’un jeton
        const end = getCoordinates(toId);
        setTokens((prev) => [
          ...prev,
          {
            id: tokenId,
            x: start.x,
            y: start.y,
            targetX: end.x,
            targetY: end.y,
          },
        ]);
        setTokenId((id) => id + 1);
      });

      return newPlaces;
    });
  };

  // Animation des jetons
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prevTokens) =>
        prevTokens
          .map((token) => {
            const dx = (token.targetX - token.x) * 0.1;
            const dy = (token.targetY - token.y) * 0.1;
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return null;
            return { ...token, x: token.x + dx, y: token.y + dy };
          })
          .filter(Boolean)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="App"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h1>Réseau de Petri Personnalisable</h1>
      <Stack direction={"column"} gap={1}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1}
          display={"flex"}
          alignItems="center"
          paddingLeft={{ xs: 0, sm: 20 }}
          paddingRight={{ xs: 0, sm: 20 }}
        >
          <div className="controls">
            <button onClick={addPlace}>AJOUTER PLACE</button>
          </div>
          <form onSubmit={addTransition}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={2}
              alignItems="center"
              justifyContent="center"
            >
              <TextField
                label="ID transition"
                type="text"
                placeholder="ID transition (ex: T1)"
                value={formTransition.id}
                onChange={(e) =>
                  setFormTransition({ ...formTransition, id: e.target.value })
                }
                required
                size="small"
              />
              <TextField
                label="Place source"
                type="text"
                placeholder="Place source (ex: P1 ou P1,P2)"
                value={formTransition.from}
                onChange={(e) =>
                  setFormTransition({
                    ...formTransition,
                    from: e.target.value,
                  })
                }
                required
                size="small"
              />
              <TextField
                label="Place puits"
                value={formTransition.to}
                type="text"
                placeholder="Place puits (ex: P3 ou P3,P4)"
                size="small"
                onChange={(e) =>
                  setFormTransition({ ...formTransition, to: e.target.value })
                }
                required
              />
              <Button type="submit" variant="contained" size="small">
                Ajouter Transition
              </Button>
            </Stack>
          </form>
        </Stack>
        <Stack direction={"row"} gap={1} width={"100%"}>
          <div className="place-buttons">
            {places.map((p) => (
              <div key={p.id} style={{ margin: "5px" }}>
                <span>
                  {p.id} (Jetons: {p.tokens})
                </span>
                <button onClick={() => addToken(p.id)}>Ajouter Jeton</button>
              </div>
            ))}
          </div>
          <svg
            width="100%"
            height="360"
            style={{
              border: "1px solid #ccc",
              margin: "20px",
              float: "right",
            }}
            overflow={"auto"}
          >
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto"
              >
                <path d="M0,0 L0,10 L10,5 Z" fill="#000" />
              </marker>
            </defs>

            {arcs.map((arc, index) => {
              const { start, end } = getLineCoords(arc.from, arc.to);
              return (
                <line
                  key={index}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#000"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              );
            })}

            {transitions.map((t) => (
              <g key={t.id}>
                <rect
                  x={t.x - 10}
                  y={t.y - 20}
                  width="20"
                  height="40"
                  fill="#34495e"
                  onMouseDown={handleMouseDown(t.id, "transition")}
                />
                {transitions.map((t) => (
                  <g key={t.id}>
                    <rect
                      x={t.x - 10}
                      y={t.y - 20}
                      width="20"
                      height="40"
                      fill="#34495e"
                      onMouseDown={handleMouseDown(t.id, "transition")}
                    />
                    {/* ID de la transition au-dessus */}
                    <text
                      x={t.x}
                      y={t.y - 25} // Position au-dessus du rectangle
                      textAnchor="middle"
                      fontSize="12"
                      fill="#000"
                      fontWeight="bold"
                    >
                      {t.id}
                    </text>
                    {/* Label descriptif en dessous */}
                    <text
                      x={t.x}
                      y={t.y + 45} // Position sous le rectangle
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333"
                    >
                      {t.label}
                    </text>
                  </g>
                ))}
              </g>
            ))}
            {places.map((p) => (
              <g key={p.id} onMouseDown={handleMouseDown(p.id, "place")}>
                <circle cx={p.x} cy={p.y} r={PLACE_RADIUS} fill="#f39c12" />
                <text
                  x={p.x}
                  y={p.y + 5}
                  textAnchor="middle"
                  fontSize="20"
                  fill="#fff"
                >
                  {p.tokens}
                </text>
                <text
                  x={p.x}
                  y={p.y - 40}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#000"
                >
                  {p.id}
                </text>
              </g>
            ))}

            {tokens.map((t) => (
              <circle key={t.id} cx={t.x} cy={t.y} r="8" fill="red" />
            ))}
          </svg>
        </Stack>
      </Stack>

      <div className="buttons">
        {transitions.map((t) => (
          <button key={t.id} onClick={() => fireTransition(t)}>
            Déclencher {t.id}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
