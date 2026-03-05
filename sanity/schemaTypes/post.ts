import { defineField, defineType } from "sanity";

export const postType = defineType({
	name: "post",
	title: "Post",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),

		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: "title",
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),

		defineField({
			name: "publishedAt",
			title: "Published At",
			type: "datetime",
			initialValue: () => new Date().toISOString(),
		}),

		defineField({
			name: "coverImage",
			title: "Cover Image",
			type: "image",
			options: {
				hotspot: true,
			},
			fields: [
				{
					name: "alt",
					title: "Alt text",
					type: "string",
				},
			],
		}),

		defineField({
			name: "tags",
			title: "Tags",
			type: "array",
			of: [{ type: "string" }],
		}),

		defineField({
			name: "markdownBody",
			title: "Body (Markdown)",
			type: "markdown",
			description: "Use this OR the Portable Text body below, not both.",
		}),

		defineField({
			name: "body",
			title: "Body (Portable Text)",
			type: "array",
			of: [
				{ type: "block" },
				{
					type: "object",
					name: "mermaidBlock",
					title: "Mermaid Diagram",
					fields: [
						defineField({
							name: "code",
							title: "Mermaid Code",
							type: "text",
						}),
					],
					preview: {
						select: { code: "code" },
						prepare({ code }: { code?: string }) {
							return {
								title: "Mermaid Diagram",
								subtitle: code?.split("\n")[0] ?? "",
							};
						},
					},
				},
			],
		}),
	],
});
