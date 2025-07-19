import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      customViteReactPlugin: true,
      tsr: {
        quoteStyle: "double",
        semicolons: true,
        customScaffolding: {
          routeTemplate: [
            "%%tsrImports%%\n\n",

            "const RouteComponent = () => {\n",
            // eslint-disable-next-line quotes
            '  return "Hello %%tsrPath%%!";\n',
            "};\n\n",

            // eslint-disable-next-line quotes
            'export const Route = createFileRoute("%%tsrPath%%")({\n',
            "  component: RouteComponent,\n",
            "});\n",
          ].join(""),
        },
      },
    }),
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              target: "19",
            },
          ],
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("node_modules/.pnpm/")) {
              const match = id.match(
                /\.pnpm\/([^@]+)(@[^/]+)?\/node_modules\/([^/]+)/
              );
              return match ? match[3] : undefined;
            } else {
              const chunk = id
                .toString()
                .split("node_modules/")[1]
                ?.split("/")[0];
              return chunk ?? undefined;
            }
          }
        },
      },
    },
  },
});
