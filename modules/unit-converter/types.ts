export type ConverterCategory = "length" | "weight" | "temperature";

export type LengthUnit = "m" | "km" | "cm" | "mm";
export type WeightUnit = "kg" | "g" | "lb";
export type TemperatureUnit = "c" | "f" | "k";

export type ConverterUnit = LengthUnit | WeightUnit | TemperatureUnit;

export interface ConverterInput {
  category: ConverterCategory;
  value: number;
  fromUnit: ConverterUnit;
  toUnit: ConverterUnit;
}

export interface ConverterResult {
  category: ConverterCategory;
  inputValue: number;
  fromUnit: ConverterUnit;
  toUnit: ConverterUnit;
  outputValue: number;
  formulaHint: string;
}