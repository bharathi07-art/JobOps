module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts", "**/resumeProcessing.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};