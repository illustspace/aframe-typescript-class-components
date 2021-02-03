import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

export default {
  input: "src/aframe-typescript-class-components.ts",
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
  plugins: [
    typescript({
      exclude: ["**/*.test.ts", "examples", "src/setupTests.ts"],
      useTsconfigDeclarationDir: false,
      clean: true,
    }),
  ],
};
