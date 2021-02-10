import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  external: ["aframe", "three"],
  plugins: [
    typescript({
      include: ["src/**/*.ts"],
      exclude: [
        "*.d.ts",
        "**/*.d.ts",
        "**/*.test.ts",
        "src/setupTests.ts",
        "examples",
        "src/setupTests.ts",
      ],
      useTsconfigDeclarationDir: false,
      clean: true,
    }),
  ],
};
