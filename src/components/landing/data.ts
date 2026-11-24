// Non-text landing data. All copy lives in messages/{id,en}.json.

export const stageVisuals = [
  { status: "free", shape: "sphere" },
  { status: "paid", shape: "ring" },
  { status: "paid", shape: "blocks" },
  { status: "soon", shape: "pyramid" },
] as const;

export type StageStatus = (typeof stageVisuals)[number]["status"];
export type StageShape = (typeof stageVisuals)[number]["shape"];

// shortcut: price mirrors ACCESS_PASS_PRICE_IDR in the API's .env.example; read it from the API once #10 lands.
export const passPrice = 49000;
