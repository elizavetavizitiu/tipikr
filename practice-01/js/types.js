"use strict";

const concatenation = "8" + 2;
const subtraction = "8" - 2;
const numericSum = Number("8") + 2;
const stringComparison = "12" > "3";
const strictEquality = 12 === "12";
const emptyNumber = Number("");
const invalidNumber = Number("text");
const booleanValue = Boolean("false");
const nullType = typeof null;
const nanType = typeof NaN;

console.log('"8" + 2', concatenation, typeof concatenation);
console.log('"8" - 2', subtraction, typeof subtraction);
console.log('Number("8") + 2', numericSum, typeof numericSum);
console.log('"12" > "3"', stringComparison, typeof stringComparison);
console.log('12 === "12"', strictEquality, typeof strictEquality);
console.log('Number("")', emptyNumber, typeof emptyNumber);
console.log('Number("text")', invalidNumber, typeof invalidNumber);
console.log('Boolean("false")', booleanValue, typeof booleanValue);
console.log('typeof null', nullType, typeof nullType);
console.log('typeof NaN', nanType, typeof nanType);
