module.exports = {
    clearMocks: true,
    maxWorkers: 1,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        '**/src/newSrc/test/**/*.[jt]s?(x)',
        '!**/src/newSrc/test/utils/**',
    ],
    setupFilesAfterEnv: [
        "jest-extended"
    ]
};