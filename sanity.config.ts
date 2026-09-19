import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemaTypes";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { markdownSchema } from "sanity-plugin-markdown";
import { SANITY_DATASET, SANITY_PROJECT_ID } from "./sanity/env";

export default defineConfig({
	name: "portfolio",
	title: "Portfolio Blog",
	projectId: SANITY_PROJECT_ID,
	dataset: SANITY_DATASET,
	plugins: [structureTool(), visionTool(), markdownSchema()],
	schema: { types: schemaTypes },
	basePath: "/studio",
});
