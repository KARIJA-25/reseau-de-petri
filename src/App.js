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
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Car,
//   Radio,
//   BarChart3,
//   PlayCircle,
//   PauseCircle,
//   RotateCcw,
// } from "lucide-react";
// import { Button, Stack } from "@mui/material";

// const SmartParkingPetri = () => {
//   const [places, setPlaces] = useState({
//     placesLibres: 5,
//     voituresAttente: 0,
//     voituresParking: 0,
//     barriereOuverte: 0,
//   });

//   const [isRunning, setIsRunning] = useState(false);
//   const [animatingTokens, setAnimatingTokens] = useState([]);
//   const [isAnimating, setIsAnimating] = useState(false);

//   // compteur d'animations actives (pour gérer animations imbriquées)
//   const animCountRef = useRef(0);

//   const positions = {
//     places: {
//       placesLibres: { x: 150, y: 100 },
//       voituresAttente: { x: 350, y: 200 },
//       voituresParking: { x: 550, y: 100 },
//       barriereOuverte: { x: 350, y: 350 },
//     },
//     transitions: {
//       arriveeVoiture: { x: 250, y: 150 },
//       ouvertureBarriere: { x: 350, y: 275 },
//       entreeParking: { x: 450, y: 150 },
//       sortieParking: { x: 450, y: 250 },
//     },
//   };

//   // animation token avec compteur d'animations
//   const animateToken = (from, to, onComplete) => {
//     const tokenId = Date.now() + Math.random();
//     const startTime = Date.now();
//     const duration = 900; // ms

//     // incrémenter compteur d'animations
//     animCountRef.current += 1;
//     setIsAnimating(true);

//     const animate = () => {
//       const elapsed = Date.now() - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const x = from.x + (to.x - from.x) * progress;
//       const y = from.y + (to.y - from.y) * progress;

//       setAnimatingTokens((prev) => {
//         const updated = prev.filter((t) => t.id !== tokenId);
//         if (progress < 1) {
//           updated.push({ id: tokenId, x, y });
//         }
//         return updated;
//       });

//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         // terminer ce token
//         setAnimatingTokens((prev) => prev.filter((t) => t.id !== tokenId));
//         try {
//           onComplete && onComplete();
//         } finally {
//           // décrémenter compteur et mettre isAnimating à false si zero
//           animCountRef.current = Math.max(0, animCountRef.current - 1);
//           if (animCountRef.current === 0) {
//             setIsAnimating(false);
//           }
//         }
//       }
//     };

//     animate();
//   };

//   // Transitions : chaque setPlaces utilise la forme fonctionnelle
//   // et vérifie l'état interne pour éviter valeurs négatives
//   const transitions = {
//     arriveeVoiture: () => {
//       // Vérification préliminaire rapide (UI) + la vérif définitive sera faite dans setPlaces
//       if (isAnimating) return;
//       animateToken(
//         positions.places.placesLibres,
//         positions.transitions.arriveeVoiture,
//         () => {
//           animateToken(
//             positions.transitions.arriveeVoiture,
//             positions.places.voituresAttente,
//             () => {
//               setPlaces((prev) => {
//                 if (prev.placesLibres <= 0) return prev; // sécurité
//                 return {
//                   ...prev,
//                   placesLibres: Math.max(0, prev.placesLibres - 1),
//                   voituresAttente: prev.voituresAttente + 1,
//                 };
//               });
//             }
//           );
//         }
//       );
//     },

//     ouvertureBarriere: () => {
//       if (isAnimating) return;
//       animateToken(
//         positions.places.voituresAttente,
//         positions.transitions.ouvertureBarriere,
//         () => {
//           animateToken(
//             positions.transitions.ouvertureBarriere,
//             positions.places.barriereOuverte,
//             () => {
//               setPlaces((prev) => {
//                 if (prev.voituresAttente <= 0) return prev;
//                 return {
//                   ...prev,
//                   voituresAttente: Math.max(0, prev.voituresAttente - 1),
//                   barriereOuverte: prev.barriereOuverte + 1,
//                 };
//               });
//             }
//           );
//         }
//       );
//     },

//     entreeParking: () => {
//       if (isAnimating) return;
//       animateToken(
//         positions.places.barriereOuverte,
//         positions.transitions.entreeParking,
//         () => {
//           animateToken(
//             positions.transitions.entreeParking,
//             positions.places.voituresParking,
//             () => {
//               setPlaces((prev) => {
//                 if (prev.barriereOuverte <= 0) return prev;
//                 return {
//                   ...prev,
//                   barriereOuverte: Math.max(0, prev.barriereOuverte - 1),
//                   voituresParking: prev.voituresParking + 1,
//                 };
//               });
//             }
//           );
//         }
//       );
//     },

//     sortieParking: () => {
//       if (isAnimating) return;
//       animateToken(
//         positions.places.voituresParking,
//         positions.transitions.sortieParking,
//         () => {
//           animateToken(
//             positions.transitions.sortieParking,
//             positions.places.placesLibres,
//             () => {
//               setPlaces((prev) => {
//                 if (prev.voituresParking <= 0) return prev;
//                 return {
//                   ...prev,
//                   voituresParking: Math.max(0, prev.voituresParking - 1),
//                   placesLibres: prev.placesLibres + 1,
//                 };
//               });
//             }
//           );
//         }
//       );
//     },
//   };

//   // récupère les transitions disponibles (pour auto-simulation)
//   const getAvailableTransitions = () => {
//     const available = [];
//     if (places.placesLibres > 0) available.push(transitions.arriveeVoiture);
//     if (places.voituresAttente > 0)
//       available.push(transitions.ouvertureBarriere);
//     if (places.barriereOuverte > 0) available.push(transitions.entreeParking);
//     if (places.voituresParking > 0) available.push(transitions.sortieParking);
//     return available;
//   };

//   // simulation automatique : ne lance que des transitions disponibles et si non-animating
//   useEffect(() => {
//     if (!isRunning) return;
//     const interval = setInterval(() => {
//       if (isAnimating) return;
//       const available = getAvailableTransitions();
//       if (available.length === 0) return;
//       const action = available[Math.floor(Math.random() * available.length)];
//       action();
//     }, 1700);
//     return () => clearInterval(interval);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isRunning, places, isAnimating]);

//   const reset = () => {
//     // arrêter et réinitialiser
//     setIsRunning(false);
//     // vider compteur d'animations si par hasard > 0
//     animCountRef.current = 0;
//     setIsAnimating(false);
//     setPlaces({
//       placesLibres: 5,
//       voituresAttente: 0,
//       voituresParking: 0,
//       barriereOuverte: 0,
//     });
//     setAnimatingTokens([]);
//   };

//   // Composants SVG réutilisables
//   const Place = ({ name, count, position, color }) => (
//     <g>
//       <circle
//         cx={position.x}
//         cy={position.y}
//         r="30"
//         fill={color}
//         stroke="#333"
//         strokeWidth="2"
//       />
//       <text
//         x={position.x}
//         y={position.y - 45}
//         textAnchor="middle"
//         style={{ fontSize: 12, fontWeight: 600, fill: "#374151" }}
//       >
//         {name}
//       </text>
//       <text
//         x={position.x}
//         y={position.y + 5}
//         textAnchor="middle"
//         style={{ fontSize: 18, fontWeight: 700, fill: "#fff" }}
//       >
//         {count}
//       </text>
//       {Array.from({ length: Math.min(Math.max(0, count), 4) }, (_, i) => (
//         <circle
//           key={i}
//           cx={position.x - 10 + (i % 2) * 20}
//           cy={position.y - 10 + Math.floor(i / 2) * 20}
//           r="3"
//           fill="#FFD700"
//         />
//       ))}
//     </g>
//   );

//   const Transition = ({ name, position, onClick, enabled }) => (
//     <g>
//       <rect
//         x={position.x - 30}
//         y={position.y - 18}
//         width="60"
//         height="36"
//         rx="6"
//         fill={enabled ? "#10B981" : "#9CA3AF"}
//         stroke="#333"
//         strokeWidth="1.5"
//         style={{
//           cursor: enabled && !isAnimating ? "pointer" : "not-allowed",
//           opacity: enabled ? 1 : 0.85,
//         }}
//         onClick={enabled && !isAnimating ? onClick : undefined}
//       />
//       <text
//         x={position.x}
//         y={position.y - 26}
//         textAnchor="middle"
//         style={{ fontSize: 12, fontWeight: 600, fill: "#374151" }}
//       >
//         {name}
//       </text>
//       <text
//         x={position.x}
//         y={position.y + 6}
//         textAnchor="middle"
//         style={{ fontSize: 12, fill: "#fff" }}
//       >
//         {enabled ? "✓" : "✗"}
//       </text>
//     </g>
//   );

//   const Arc = ({ from, to }) => (
//     <line
//       x1={from.x}
//       y1={from.y}
//       x2={to.x}
//       y2={to.y}
//       stroke="#4B5563"
//       strokeWidth="2"
//       markerEnd="url(#arrowhead)"
//     />
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-6xl mx-auto">
//         <Stack
//           direction={{ xs: "column", sm: "column", md: "row" }}
//           gap={2}
//           display={"flex"}
//           justifyContent={"space-around"}
//           alignItems={{ xs: "center", sm: "flex-start" }}
//         >
//           <Stack direction="column" gap={2} padding={5}>
//             <div className="text-center mb-6">
//               <div className="flex items-center justify-center gap-3 mb-2">
//                 <Car className="h-8 w-8 text-blue-600" />
//                 <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>
//                   Système de Parking Intelligent
//                 </h1>
//                 <Radio className="h-8 w-8 text-green-600" />
//               </div>
//               <p style={{ color: "#6B7280" }}>
//                 Réseau de Petri animé — simulation et contrôles manuels
//               </p>
//             </div>

//             {/* Panneau de contrôle : simulation + boutons manuels + états */}
//             <Stack direction={"column"} gap={4}>
//               <Stack direction={"column"} gap={2}>
//                 <div className="flex items-center justify-between mb-4">
//                   <Stack direction="row" gap={2}>
//                     <Button
//                       onClick={() => setIsRunning((r) => !r)}
//                       className={`px-4 py-2 rounded-lg text-white font-medium ${
//                         isRunning ? "bg-red-500" : "bg-green-600"
//                       }`}
//                       variant="contained"
//                       size="small"
//                     >
//                       {isRunning ? (
//                         <>
//                           <PauseCircle className="inline-block" /> Pause
//                         </>
//                       ) : (
//                         <>
//                           <PlayCircle className="inline-block" /> Démarrer
//                         </>
//                       )}
//                     </Button>
//                     <Button
//                       onClick={reset}
//                       variant="contained"
//                       size="small"
//                       sx={{
//                         backgroundColor: "#92400E",
//                         "&:hover": {
//                           backgroundColor: "#6e300b", // un peu plus sombre pour l'effet hover
//                         },
//                       }}
//                     >
//                       <RotateCcw className="inline-block" /> Reset
//                     </Button>
//                   </Stack>
//                 </div>

//                 {/* Boutons manuels */}
//                 <Stack direction="row" gap={2}>
//                   <Button
//                     onClick={transitions.arriveeVoiture}
//                     disabled={places.placesLibres === 0 || isAnimating}
//                     variant="contained"
//                     size="small"
//                     sx={{
//                       backgroundColor:
//                         places.placesLibres === 0 || isAnimating
//                           ? "#d1d5db"
//                           : "#3b82f6",
//                       color:
//                         places.placesLibres === 0 || isAnimating
//                           ? "#4b5563"
//                           : "#fff",
//                       "&:hover": {
//                         backgroundColor:
//                           places.placesLibres === 0 || isAnimating
//                             ? "#d1d5db"
//                             : "#2563eb",
//                       },
//                     }}
//                   >
//                     Arrivée voiture
//                   </Button>

//                   <Button
//                     onClick={transitions.ouvertureBarriere}
//                     disabled={places.voituresAttente === 0 || isAnimating}
//                     variant="contained"
//                     size="small"
//                     sx={{
//                       backgroundColor:
//                         places.voituresAttente === 0 || isAnimating
//                           ? "#d1d5db"
//                           : "#f59e0b",
//                       color:
//                         places.voituresAttente === 0 || isAnimating
//                           ? "#4b5563"
//                           : "#fff",
//                       "&:hover": {
//                         backgroundColor:
//                           places.voituresAttente === 0 || isAnimating
//                             ? "#d1d5db"
//                             : "#d97706",
//                       },
//                     }}
//                   >
//                     Ouvrir barrière
//                   </Button>

//                   <Button
//                     onClick={transitions.entreeParking}
//                     disabled={places.barriereOuverte === 0 || isAnimating}
//                     variant="contained"
//                     size="small"
//                     sx={{
//                       backgroundColor:
//                         places.barriereOuverte === 0 || isAnimating
//                           ? "#d1d5db"
//                           : "#16a34a",
//                       color:
//                         places.barriereOuverte === 0 || isAnimating
//                           ? "#4b5563"
//                           : "#fff",
//                       "&:hover": {
//                         backgroundColor:
//                           places.barriereOuverte === 0 || isAnimating
//                             ? "#d1d5db"
//                             : "#15803d",
//                       },
//                     }}
//                   >
//                     Entrer parking
//                   </Button>

//                   <Button
//                     onClick={transitions.sortieParking}
//                     disabled={places.voituresParking === 0 || isAnimating}
//                     variant="contained"
//                     size="small"
//                     sx={{
//                       backgroundColor:
//                         places.voituresParking === 0 || isAnimating
//                           ? "#d1d5db"
//                           : "#ef4444",
//                       color:
//                         places.voituresParking === 0 || isAnimating
//                           ? "#4b5563"
//                           : "#fff",
//                       "&:hover": {
//                         backgroundColor:
//                           places.voituresParking === 0 || isAnimating
//                             ? "#d1d5db"
//                             : "#dc2626",
//                       },
//                     }}
//                   >
//                     Sortir parking
//                   </Button>
//                 </Stack>
//               </Stack>
//               {/* États */}
//               <Stack direction={"row"} gap={2}>
//                 <Stack
//                   direction={"column"}
//                   gap={2}
//                   display={"flex"}
//                   alignItems="center"
//                 >
//                   <div style={{ color: "#065F46" }}>Places libres</div>
//                   <div
//                     style={{ fontSize: 20, fontWeight: 800, color: "#065F46" }}
//                   >
//                     {places.placesLibres}
//                   </div>
//                 </Stack>
//                 <Stack
//                   direction={"column"}
//                   gap={2}
//                   display={"flex"}
//                   alignItems="center"
//                 >
//                   <div style={{ color: "#92400E" }}>Voitures attentes</div>
//                   <div
//                     style={{ fontSize: 20, fontWeight: 800, color: "#92400E" }}
//                   >
//                     {places.voituresAttente}
//                   </div>
//                 </Stack>
//                 <Stack
//                   direction={"column"}
//                   gap={2}
//                   display={"flex"}
//                   alignItems="center"
//                 >
//                   <div style={{ color: "#1D4ED8" }}>Voitures garées</div>
//                   <div
//                     style={{ fontSize: 20, fontWeight: 800, color: "#1D4ED8" }}
//                   >
//                     {places.voituresParking}
//                   </div>
//                 </Stack>
//                 <Stack
//                   direction={"column"}
//                   gap={2}
//                   display={"flex"}
//                   alignItems="center"
//                 >
//                   <div style={{ color: "#6D28D9" }}>Barrière ouverte</div>
//                   <div
//                     style={{ fontSize: 20, fontWeight: 800, color: "#6D28D9" }}
//                   >
//                     {places.barriereOuverte}
//                   </div>
//                 </Stack>
//               </Stack>
//             </Stack>
//           </Stack>

//           {/* Visualisation SVG */}
//           <Stack alignItems={{ xs: "center", sm: "flex-start" }}>
//             <div className="bg-white rounded-xl shadow p-4">
//               <h2
//                 style={{
//                   fontSize: 18,
//                   fontWeight: 700,
//                   marginBottom: 8,
//                   textAlign: "center",
//                 }}
//               >
//                 Réseau de Petri - Visualisation
//               </h2>
//               <div style={{ display: "flex", justifyContent: "center" }}>
//                 <svg width="760" height="460" className="border rounded-lg">
//                   <defs>
//                     <marker
//                       id="arrowhead"
//                       markerWidth="10"
//                       markerHeight="7"
//                       refX="9"
//                       refY="3.5"
//                       orient="auto"
//                     >
//                       <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
//                     </marker>
//                   </defs>

//                   {/* Arcs */}
//                   <Arc
//                     from={positions.places.placesLibres}
//                     to={positions.transitions.arriveeVoiture}
//                   />
//                   <Arc
//                     from={positions.transitions.arriveeVoiture}
//                     to={positions.places.voituresAttente}
//                   />
//                   <Arc
//                     from={positions.places.voituresAttente}
//                     to={positions.transitions.ouvertureBarriere}
//                   />
//                   <Arc
//                     from={positions.transitions.ouvertureBarriere}
//                     to={positions.places.barriereOuverte}
//                   />
//                   <Arc
//                     from={positions.places.barriereOuverte}
//                     to={positions.transitions.entreeParking}
//                   />
//                   <Arc
//                     from={positions.transitions.entreeParking}
//                     to={positions.places.voituresParking}
//                   />
//                   <Arc
//                     from={positions.places.voituresParking}
//                     to={positions.transitions.sortieParking}
//                   />
//                   <Arc
//                     from={positions.transitions.sortieParking}
//                     to={positions.places.placesLibres}
//                   />

//                   {/* Places */}
//                   <Place
//                     name="Places Libres"
//                     count={places.placesLibres}
//                     position={positions.places.placesLibres}
//                     color="#10B981"
//                   />
//                   <Place
//                     name="Voitures Attente"
//                     count={places.voituresAttente}
//                     position={positions.places.voituresAttente}
//                     color="#F59E0B"
//                   />
//                   <Place
//                     name="Voitures Parking"
//                     count={places.voituresParking}
//                     position={positions.places.voituresParking}
//                     color="#3B82F6"
//                   />
//                   <Place
//                     name="Barrière Ouverte"
//                     count={places.barriereOuverte}
//                     position={positions.places.barriereOuverte}
//                     color="#8B5CF6"
//                   />

//                   {/* Transitions */}
//                   <Transition
//                     name="Arrivée"
//                     position={positions.transitions.arriveeVoiture}
//                     onClick={transitions.arriveeVoiture}
//                     enabled={places.placesLibres > 0 && !isAnimating}
//                   />
//                   <Transition
//                     name="Ouverture"
//                     position={positions.transitions.ouvertureBarriere}
//                     onClick={transitions.ouvertureBarriere}
//                     enabled={places.voituresAttente > 0 && !isAnimating}
//                   />
//                   <Transition
//                     name="Entrée"
//                     position={positions.transitions.entreeParking}
//                     onClick={transitions.entreeParking}
//                     enabled={places.barriereOuverte > 0 && !isAnimating}
//                   />
//                   <Transition
//                     name="Sortie"
//                     position={positions.transitions.sortieParking}
//                     onClick={transitions.sortieParking}
//                     enabled={places.voituresParking > 0 && !isAnimating}
//                   />

//                   {/* Jetons animés */}
//                   {animatingTokens.map((token) => (
//                     <circle
//                       key={token.id}
//                       cx={token.x}
//                       cy={token.y}
//                       r="8"
//                       fill="#FFD700"
//                       stroke="#FFA500"
//                       strokeWidth="2"
//                     />
//                   ))}
//                 </svg>
//               </div>
//             </div>
//           </Stack>
//         </Stack>
//       </div>
//     </div>
//   );
// };

// export default SmartParkingPetri;
