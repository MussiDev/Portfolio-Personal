import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import {
	PortableText,
	type PortableTextComponents,
	type PortableTextMarkComponentProps,
	type PortableTextTypeComponentProps,
} from "@portabletext/react";

import { prose } from "./prose";
import type { PortableTextBlock } from "./excerpt";

/**
 * A post's body, however it comes.
 *
 * Sanity stores content in two formats depending on how the post was
 * written (`body` in Portable Text, `markdownBody` in Markdown), so two
 * renderers are needed. What gets unified here is everything else: the
 * styles come from `prose`, the Mermaid block resolves the same way on
 * both paths, and the decision of which to use lives in one single place
 * instead of being inline in the middle of the page.
 *
 * This does NOT resolve the underlying debt — having two content models
 * in parallel — but it bounds it: now it's an `if` in one file, not two
 * copied component trees that have to be kept in sync by hand.
 */

const MermaidDiagram = dynamic(() => import("./MermaidDiagram"), { ssr: true });

interface MermaidBlockValue {
	_type: "mermaidBlock";
	_key: string;
	code: string;
}

const portableTextComponents: PortableTextComponents = {
	types: {
		mermaidBlock: ({
			value,
		}: PortableTextTypeComponentProps<MermaidBlockValue>) => (
			<MermaidDiagram code={value.code} />
		),
	},
	block: {
		normal: ({ children }) => <p className={prose.p}>{children}</p>,
		h1: ({ children }) => <h1 className={prose.h1}>{children}</h1>,
		h2: ({ children }) => <h2 className={prose.h2}>{children}</h2>,
		h3: ({ children }) => <h3 className={prose.h3}>{children}</h3>,
		blockquote: ({ children }) => (
			<blockquote className={prose.blockquote}>{children}</blockquote>
		),
	},
	list: {
		bullet: ({ children }) => <ul className={prose.ul}>{children}</ul>,
		number: ({ children }) => <ol className={prose.ol}>{children}</ol>,
	},
	listItem: {
		bullet: ({ children }) => <li className={prose.li}>{children}</li>,
		number: ({ children }) => <li className={prose.li}>{children}</li>,
	},
	marks: {
		strong: ({ children }) => (
			<strong className={prose.strong}>{children}</strong>
		),
		em: ({ children }) => <em className='italic'>{children}</em>,
		code: ({ children }) => <code className={prose.code}>{children}</code>,
		link: ({
			children,
			value,
		}: PortableTextMarkComponentProps<{ _type: "link"; href?: string }>) => (
			<a
				href={value?.href}
				target='_blank'
				rel='noopener noreferrer'
				className={prose.link}
			>
				{children}
			</a>
		),
	},
};

const markdownComponents = {
	p: ({ children }: { children?: React.ReactNode }) => (
		<p className={prose.p}>{children}</p>
	),
	h1: ({ children }: { children?: React.ReactNode }) => (
		<h1 className={prose.h1}>{children}</h1>
	),
	h2: ({ children }: { children?: React.ReactNode }) => (
		<h2 className={prose.h2}>{children}</h2>
	),
	h3: ({ children }: { children?: React.ReactNode }) => (
		<h3 className={prose.h3}>{children}</h3>
	),
	blockquote: ({ children }: { children?: React.ReactNode }) => (
		<blockquote className={prose.blockquote}>{children}</blockquote>
	),
	ul: ({ children }: { children?: React.ReactNode }) => (
		<ul className={prose.ul}>{children}</ul>
	),
	ol: ({ children }: { children?: React.ReactNode }) => (
		<ol className={prose.ol}>{children}</ol>
	),
	li: ({ children }: { children?: React.ReactNode }) => (
		<li className={prose.li}>{children}</li>
	),
	strong: ({ children }: { children?: React.ReactNode }) => (
		<strong className={prose.strong}>{children}</strong>
	),
	em: ({ children }: { children?: React.ReactNode }) => (
		<em className='italic'>{children}</em>
	),
	code: ({
		className,
		children,
	}: {
		className?: string;
		children?: React.ReactNode;
	}) => {
		// ```mermaid in Markdown is the same diagram as Portable Text's
		// `mermaidBlock` block: one single component for both.
		const language = /language-(\w+)/.exec(className ?? "")?.[1];
		if (language === "mermaid") {
			return <MermaidDiagram code={String(children).trim()} />;
		}
		return <code className={prose.code}>{children}</code>;
	},
	a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
		<a href={href} target='_blank' rel='noopener noreferrer' className={prose.link}>
			{children}
		</a>
	),
};

const PostBody = ({
	body,
	markdownBody,
}: {
	body?: PortableTextBlock[];
	markdownBody?: string;
}) => (
	<div className='break-words'>
		{markdownBody ? (
			<ReactMarkdown components={markdownComponents}>
				{markdownBody}
			</ReactMarkdown>
		) : (
			<PortableText value={body ?? []} components={portableTextComponents} />
		)}
	</div>
);

export default PostBody;
