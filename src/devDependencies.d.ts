
// This file is used to declare modules for packages that don't have TypeScript support
// or when you want to extend existing type definitions.

// Declare the 'canvas' module to prevent "Module not found" errors when using Konva
// on the server-side with Turbopack, where it's aliased to an empty file.
declare module 'canvas';
