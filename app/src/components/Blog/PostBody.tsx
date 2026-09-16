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
 * El cuerpo de un post, venga como venga.
 *
 * Sanity guarda el contenido en dos formatos según cómo se escribió el post
 * (`body` en Portable Text, `markdownBody` en Markdown), así que hacen falta
 * dos renderers. Lo que se unifica acá es todo lo demás: los estilos salen
 * de `prose`, el bloque de Mermaid se resuelve igual en los dos caminos, y
 * la decisión de cuál usar vive en un solo lugar en vez de estar inline en
 * medio de la página.
 *
 * Esto NO resuelve la deuda de fondo — tener dos modelos de contenido en
 * paralelo — pero la acota: ahora es un `if` en un archivo, no dos árboles
 * de componentes copiados que hay que mantener en sincronía a mano.
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
		// ```mermaid en Markdown es el mismo diagrama que el bloque
		// `mermaidBlock` de Portable Text: un solo componente para los dos.
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
