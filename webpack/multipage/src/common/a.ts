import _ from "lodash";

export function greet(name: string): string {
  return `Hello, ${name}! Welcome to the multipage application.`;
}

export function sum(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}
export function capitalizeWords(sentence: string): string {
  return _.startCase(_.toLower(sentence));
}

export function findMax(numbers: number[]): number {
  return _.max(numbers) || 0;
}

export function deepClone<T>(obj: T): T {
  return _.cloneDeep(obj);
}
