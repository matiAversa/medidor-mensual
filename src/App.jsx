import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "medidor-mensual-data";

const CATEGORIES = [
  {
    name: "Mal",
    color: "#ef1c2b",
  },
  {
    name: "Flojo",
    color: "#ff8126",
  },
  {
    name: "Bien",
    color: "#fff000",
  },
  {
    name: "Muy bien",
    color: "#20b64a",
  },
  {
    name: "Excelente",
    color: "#08752b",
  },
];

const INITIAL_POINTS = 8;
const MIN_POINTS = 0;
const MAX_POINTS = 19;

function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");

  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getCategoryIndex(points) {
  return Math.min(Math.floor(points / 4), CATEGORIES.length - 1);
}

function createInitialData() {
  return {
    monthKey: getCurrentMonthKey(),
    points: INITIAL_POINTS,
    history: [],
  };
}

function loadInitialData() {
  const currentMonth = getCurrentMonthKey();
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    const initialData = createInitialData();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));

    return {
      data: initialData,
      monthChanged: false,
    };
  }

  try {
    const parsedData = JSON.parse(savedData);

    const history = Array.isArray(parsedData.history)
        ? parsedData.history
        : [];

    if (parsedData.monthKey !== currentMonth) {
      const previousMonthAlreadySaved = history.some(
          (item) => item.monthKey === parsedData.monthKey
      );

      const updatedHistory = previousMonthAlreadySaved
          ? history
          : [
            ...history,
            {
              monthKey: parsedData.monthKey,
              category:
                  CATEGORIES[getCategoryIndex(parsedData.points)]?.name ||
                  "Bien",
            },
          ];

      const resetData = {
        monthKey: currentMonth,
        points: INITIAL_POINTS,
        history: updatedHistory,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));

      return {
        data: resetData,
        monthChanged: true,
      };
    }

    const validPoints =
        typeof parsedData.points === "number"
            ? Math.max(
                MIN_POINTS,
                Math.min(MAX_POINTS, parsedData.points)
            )
            : INITIAL_POINTS;

    const validData = {
      monthKey: currentMonth,
      points: validPoints,
      history,
    };

    return {
      data: validData,
      monthChanged: false,
    };
  } catch {
    const initialData = createInitialData();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));

    return {
      data: initialData,
      monthChanged: false,
    };
  }
}

function polarToCartesian(
    centerX,
    centerY,
    radius,
    angleInDegrees
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY - radius * Math.sin(angleInRadians),
  };
}

function describeArcSegment(
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle
) {
  const start = polarToCartesian(
      centerX,
      centerY,
      radius,
      startAngle
  );

  const end = polarToCartesian(
      centerX,
      centerY,
      radius,
      endAngle
  );

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}
function MovementDecorations({ movement }) {
  if (!movement) {
    return null;
  }

  const isMovingUp = movement === "up";

  const greenPaths = [
    "M 58 300 C 42 245, 48 180, 82 112",
    "M 135 345 C 112 285, 125 225, 154 158",
    "M 235 285 C 220 230, 238 175, 265 116",
    "M 765 285 C 785 225, 770 170, 738 112",
    "M 865 345 C 890 280, 878 220, 846 154",
    "M 942 300 C 960 240, 950 175, 920 105",
    "M 185 790 C 204 735, 202 680, 180 625",
    "M 810 790 C 790 735, 794 680, 820 625",
  ];

  const redPaths = [
    "M 64 105 C 44 165, 52 225, 82 288",
    "M 145 145 C 126 205, 134 255, 158 310",
    "M 255 118 C 238 168, 245 220, 267 270",
    "M 745 118 C 762 168, 755 220, 733 270",
    "M 855 145 C 875 205, 866 255, 842 310",
    "M 936 105 C 956 165, 948 225, 918 288",
    "M 185 620 C 165 680, 170 735, 195 790",
    "M 815 620 C 835 680, 830 735, 805 790",
  ];

  const paths = isMovingUp ? greenPaths : redPaths;
  const color = isMovingUp ? "#20b64a" : "#ef1c2b";
  const markerId = isMovingUp
      ? "arrowhead-up"
      : "arrowhead-down";

  return (
      <svg
          key={movement}
          className={`movement-decorations ${
              isMovingUp
                  ? "movement-decorations-up"
                  : "movement-decorations-down"
          }`}
          viewBox="0 0 1000 900"
          preserveAspectRatio="none"
          aria-hidden="true"
      >
        <defs>
          <marker
              id="arrowhead-up"
              markerWidth="18"
              markerHeight="18"
              refX="9"
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
          >
            <path
                d="M 1 11 L 9 1 L 17 11"
                fill="none"
                stroke="#20b64a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
          </marker>

          <marker
              id="arrowhead-down"
              markerWidth="18"
              markerHeight="18"
              refX="9"
              refY="12"
              orient="auto"
              markerUnits="userSpaceOnUse"
          >
            <path
                d="M 1 7 L 9 17 L 17 7"
                fill="none"
                stroke="#ef1c2b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
          </marker>
        </defs>

        {paths.map((path, index) => (
            <path
                key={`${movement}-${index}`}
                className="movement-path"
                d={path}
                pathLength="1"
                stroke={color}
                markerEnd={`url(#${markerId})`}
            />
        ))}
      </svg>
  );
}

function Meter({ points }) {
  const categoryIndex = getCategoryIndex(points);
  const category = CATEGORIES[categoryIndex];

  const centerX = 250;
  const centerY = 225;
  const radius = 190;

  const sectors = CATEGORIES.map((item, index) => {
    const startAngle = 180 - index * 36;
    const endAngle = startAngle - 36;
    const middleAngle = (startAngle + endAngle) / 2;

    const labelPosition = polarToCartesian(
        centerX,
        centerY,
        132,
        middleAngle
    );

    return {
      ...item,
      path: describeArcSegment(
          centerX,
          centerY,
          radius,
          startAngle,
          endAngle
      ),
      labelPosition,
    };
  });

  const needleProgress = points / MAX_POINTS;
  const needleAngle = Math.PI - needleProgress * Math.PI;
  const needleLength = 158;

  const needleX =
      centerX + Math.cos(needleAngle) * needleLength;

  const needleY =
      centerY - Math.sin(needleAngle) * needleLength;

  /*
   * Calculamos la dirección de la aguja desde el centro
   * hasta la punta.
   */
  const directionX = needleX - centerX;
  const directionY = needleY - centerY;

  const directionLength = Math.sqrt(
      directionX ** 2 + directionY ** 2
  );

  const unitX = directionX / directionLength;
  const unitY = directionY / directionLength;

  /*
   * La punta de la flecha queda en el extremo de la aguja.
   */
  const arrowTipX = needleX;
  const arrowTipY = needleY;

  /*
   * La base se calcula hacia atrás, siguiendo la dirección
   * contraria a la aguja.
   */
  const arrowLength = 24;
  const arrowWidth = 13;

  const arrowBaseCenterX =
      arrowTipX - unitX * arrowLength;

  const arrowBaseCenterY =
      arrowTipY - unitY * arrowLength;

  /*
   * Vector perpendicular para formar los dos extremos
   * de la base triangular.
   */
  const perpendicularX = -unitY;
  const perpendicularY = unitX;

  const arrowBaseLeftX =
      arrowBaseCenterX + perpendicularX * arrowWidth;

  const arrowBaseLeftY =
      arrowBaseCenterY + perpendicularY * arrowWidth;

  const arrowBaseRightX =
      arrowBaseCenterX - perpendicularX * arrowWidth;

  const arrowBaseRightY =
      arrowBaseCenterY - perpendicularY * arrowWidth;

  const arrowPoints = [
    `${arrowTipX},${arrowTipY}`,
    `${arrowBaseLeftX},${arrowBaseLeftY}`,
    `${arrowBaseRightX},${arrowBaseRightY}`,
  ].join(" ");

  return (
      <div className="meter-wrapper">
        <svg
            className="meter"
            viewBox="0 0 500 255"
            role="img"
            aria-label={`Categoría actual: ${category.name}`}
        >
          {sectors.map((sector) => (
              <path
                  key={sector.name}
                  d={sector.path}
                  fill={sector.color}
                  stroke="#171717"
                  strokeWidth="3"
              />
          ))}

          {sectors.map((sector) => (
              <text
                  key={`${sector.name}-label`}
                  x={sector.labelPosition.x}
                  y={sector.labelPosition.y}
                  className={`meter-label ${
                      sector.name === category.name
                          ? "meter-label-active"
                          : ""
                  }`}
              >
                {sector.name}
              </text>
          ))}

          <line
              className="needle"
              x1={centerX}
              y1={centerY}
              x2={needleX}
              y2={needleY}
          />

          <polygon
              className="needle-arrow"
              points={arrowPoints}
          />

          <circle
              cx={centerX}
              cy={centerY}
              r="28"
              className="meter-center"
          />

          <circle
              cx={centerX}
              cy={centerY}
              r="9"
              className="meter-center-dot"
          />
        </svg>
      </div>
  );
}

function App() {
  const initialState = useMemo(() => loadInitialData(), []);

  const [points, setPoints] = useState(initialState.data.points);
  const [monthKey, setMonthKey] = useState(
      initialState.data.monthKey
  );
  const [history, setHistory] = useState(
      initialState.data.history
  );
  const [monthChanged, setMonthChanged] = useState(
      initialState.monthChanged
  );
  const [showHistory, setShowHistory] = useState(false);
  const [movement, setMovement] = useState(null);
  const [movementId, setMovementId] = useState(0);

  const categoryIndex = getCategoryIndex(points);
  const category = CATEGORIES[categoryIndex];

  useEffect(() => {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          monthKey,
          points,
          history,
        })
    );
  }, [monthKey, points, history]);

  useEffect(() => {
    if (!monthChanged) {
      return;
    }

    const timeout = setTimeout(() => {
      setMonthChanged(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [monthChanged]);

  useEffect(() => {
    if (!movement) {
      return;
    }

    const timeout = setTimeout(() => {
      setMovement(null);
    }, 900);

    return () => clearTimeout(timeout);
  }, [movement]);

  function changePoints(amount) {
    const nextPoints = Math.max(
        MIN_POINTS,
        Math.min(MAX_POINTS, points + amount)
    );

    if (nextPoints === points) {
      return;
    }

    const previousCategoryIndex = getCategoryIndex(points);
    const nextCategoryIndex = getCategoryIndex(nextPoints);

    setPoints(nextPoints);

    if (nextCategoryIndex > previousCategoryIndex) {
      setMovement("up");
      setMovementId((previousId) => previousId + 1);
    }

    if (nextCategoryIndex < previousCategoryIndex) {
      setMovement("down");
      setMovementId((previousId) => previousId + 1);
    }
  }

  return (
      <main
          className={`app ${
              movement === "up"
                  ? "app-moving-up"
                  : movement === "down"
                      ? "app-moving-down"
                      : ""
          }`}
      >
        <MovementDecorations
            key={movementId}
            movement={movement}
        />

        <section className="app-card">
          <header className="app-header">
            <p className="app-kicker">Seguimiento del mes</p>

            <h1>Medidor Mensual</h1>

            <p className="current-month">
              {getMonthLabel(monthKey)}
            </p>
          </header>

          {monthChanged && (
              <div className="month-notice" role="status">
                <strong>¡Comenzó un nuevo mes!</strong>
                <span>La cuenta fue reiniciada en “Bien”.</span>
              </div>
          )}

          <section className="meter-section">
            <Meter points={points} />

            <div className="category-result">
            <span className="category-caption">
              Resultado actual
            </span>

              <strong>{category.name}</strong>
            </div>
          </section>

          <section
              className="controls"
              aria-label="Controles del medidor"
          >
            <button
                className="control-button control-button-down"
                onClick={() => changePoints(-1)}
                disabled={points === MIN_POINTS}
                aria-label="Bajar una posición"
            >
              −
            </button>

            <button
                className="control-button control-button-up"
                onClick={() => changePoints(1)}
                disabled={points === MAX_POINTS}
                aria-label="Subir una posición"
            >
              +
            </button>
          </section>

          <button
              className="history-button"
              onClick={() => setShowHistory(true)}
          >
            Registro de meses
          </button>
        </section>

        {showHistory && (
            <div
                className="modal-overlay"
                onClick={() => setShowHistory(false)}
                role="presentation"
            >
              <section
                  className="history-modal"
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="history-title"
              >
                <div className="modal-header">
                  <h2 id="history-title">Registro de meses</h2>

                  <button
                      className="modal-close"
                      onClick={() => setShowHistory(false)}
                      aria-label="Cerrar registro"
                  >
                    ×
                  </button>
                </div>

                {history.length === 0 ? (
                    <p className="empty-history">
                      Todavía no hay meses anteriores registrados.
                    </p>
                ) : (
                    <ul className="history-list">
                      {[...history].reverse().map((item) => (
                          <li
                              key={item.monthKey}
                              className="history-item"
                          >
                            <span>{getMonthLabel(item.monthKey)}</span>
                            <strong>{item.category}</strong>
                          </li>
                      ))}
                    </ul>
                )}
              </section>
            </div>
        )}
      </main>
  );
}

export default App;