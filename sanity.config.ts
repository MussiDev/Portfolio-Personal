import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemaTypes";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

export default defineConfig({
	name: "portfolio",
	title: "Portfolio Blog",
	projectId: "3rq1799s",
	dataset: "production",
	plugins: [structureTool(), visionTool()],
	schema: { types: schemaTypes },
	basePath: "/studio",
});
