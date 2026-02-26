import {
  ConverterCategory,
  ConverterInput,
  ConverterResult,
  ConverterUnit,
  LengthUnit,
  TemperatureUnit,
  WeightUnit,
} from "./types";

const lengthFactors: Record<LengthUnit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
};

const weightFactors: Record<WeightUnit, number> = {
  g: 0.001,
  kg: 1,
  lb: 0.45359237,
};

function isLengthUnit(unit: ConverterUnit): unit is LengthUnit {
  return unit === "mm" || unit === "cm" || unit === "m" || unit === "km";
}

function isWeightUnit(unit: ConverterUnit): unit is WeightUnit {
  return unit === "g" || unit === "kg" || unit === "lb";
}

function isTemperatureUnit(unit: ConverterUnit): unit is TemperatureUnit {
  return unit === "c" || unit === "f" || unit === "k";
}

function normalizeOutput(value: number): number {
  return Number(value.toFixed(6));
}

function convertLength(value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number {
  const inMeters = value * lengthFactors[fromUnit];
  return inMeters / lengthFactors[toUnit];
}

function convertWeight(value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  const inKg = value * weightFactors[fromUnit];
  return inKg / weightFactors[toUnit];
}

function toCelsius(value: number, unit: TemperatureUnit): number {
  if (unit === "c") {
    return value;
  }
  if (unit === "f") {
    return (value - 32) * (5 / 9);
  }
  return value - 273.15;
}

function fromCelsius(value: number, unit: TemperatureUnit): number {
  if (unit === "c") {
    return value;
  }
  if (unit === "f") {
    return value * (9 / 5) + 32;
  }
  return value + 273.15;
}

function convertTemperature(
  value: number,
  fromUnit: TemperatureUnit,
  toUnit: TemperatureUnit,
): number {
  const celsius = toCelsius(value, fromUnit);
  return fromCelsius(celsius, toUnit);
}

function formulaHint(category: ConverterCategory): string {
  if (category === "length") {
    return "Conversion via mètre (unité pivot).";
  }
  if (category === "weight") {
    return "Conversion via kilogramme (unité pivot).";
  }
  return "Conversion via Celsius (unité pivot).";
}

export function convertUnit(input: ConverterInput): ConverterResult {
  if (!Number.isFinite(input.value)) {
    throw new Error("INVALID_VALUE");
  }

  let outputValue: number;

  if (input.category === "length") {
    if (!isLengthUnit(input.fromUnit) || !isLengthUnit(input.toUnit)) {
      throw new Error("INVALID_UNIT_FOR_CATEGORY");
    }
    outputValue = convertLength(input.value, input.fromUnit, input.toUnit);
  } else if (input.category === "weight") {
    if (!isWeightUnit(input.fromUnit) || !isWeightUnit(input.toUnit)) {
      throw new Error("INVALID_UNIT_FOR_CATEGORY");
    }
    outputValue = convertWeight(input.value, input.fromUnit, input.toUnit);
  } else {
    if (!isTemperatureUnit(input.fromUnit) || !isTemperatureUnit(input.toUnit)) {
      throw new Error("INVALID_UNIT_FOR_CATEGORY");
    }
    outputValue = convertTemperature(input.value, input.fromUnit, input.toUnit);
  }

  return {
    category: input.category,
    inputValue: input.value,
    fromUnit: input.fromUnit,
    toUnit: input.toUnit,
    outputValue: normalizeOutput(outputValue),
    formulaHint: formulaHint(input.category),
  };
}