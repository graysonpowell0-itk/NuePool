import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChemicalReading, PoolConfig, InventoryItem, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const adjustmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    chemicalName: { type: Type.STRING, description: "Name of the chemical to add (e.g., Muriatic Acid, Calcium Hypochlorite)." },
    amount: { type: Type.NUMBER, description: "Numeric amount to add." },
    unit: { type: Type.STRING, description: "Unit of measurement (e.g., oz, lbs, cups, gallons)." },
    reason: { type: Type.STRING, description: "Short explanation for why this is needed." },
  },
  required: ["chemicalName", "amount", "unit", "reason"],
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: { type: Type.STRING, description: "A brief summary of the water balance status." },
    adjustments: {
      type: Type.ARRAY,
      items: adjustmentSchema,
      description: "List of recommended chemical adjustments.",
    },
  },
  required: ["analysis", "adjustments"],
};

export const calculatePoolAdjustments = async (
  pool: PoolConfig,
  readings: ChemicalReading,
  inventory: InventoryItem[],
  waterEvents: { added: boolean; drained: boolean; drainedHalf: boolean }
): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const inventoryList = inventory.map(i => `${i.name} (${i.quantity} ${i.unit} available)`).join(", ");
  
  const waterContext = [
    waterEvents.added ? "Fresh water was added." : "",
    waterEvents.drained ? "Water was drained." : "",
    waterEvents.drainedHalf ? "More than 50% of the water was drained and refilled." : ""
  ].filter(Boolean).join(" ");

  const prompt = `
    Act as a professional pool technician.
    Pool Configuration:
    - Name: ${pool.name}
    - Volume: ${pool.volume} gallons
    - Category: ${pool.category.toUpperCase()} (Important: adjust targets accordingly for Pool vs Spa)
    - Type: ${pool.type}
    - Surface: ${pool.surface}

    Water Adjustments Today:
    ${waterContext || "None"}

    Current Readings:
    - pH: ${readings.ph}
    - Free Chlorine: ${readings.freeChlorine} ppm
    - Total Alkalinity: ${readings.totalAlkalinity} ppm
    - Cyanuric Acid: ${readings.cyanuricAcid} ppm
    ${readings.calciumHardness ? `- Calcium Hardness: ${readings.calciumHardness} ppm` : '- Calcium Hardness: Not Measured'}
    ${readings.saltLevel ? `- Salt Level: ${readings.saltLevel} ppm` : ''}
    ${readings.temperature ? `- Temperature: ${readings.temperature} F` : '- Temperature: Not Measured'}

    Available Inventory: ${inventoryList}

    Task:
    Calculate the exact chemical adjustments needed to balance this ${pool.category} to ideal levels.
    Targets for ${pool.category}:
    - pH: ${pool.category === 'spa' ? '7.2-7.8' : '7.4-7.6'}
    - FC: ${pool.category === 'spa' ? '3-5ppm (or higher if heavy use)' : '3-5ppm'}
    - TA: 80-120ppm
    
    Prioritize using chemicals from the Available Inventory if possible.
    If a chemical is needed but not in inventory, recommend a generic standard pool chemical.
    If water was drained significantly, account for the loss of stabilizer (CYA) and Salt.
    
    Return the result as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temp for precise math
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to calculate adjustments. Please try again.");
  }
};
