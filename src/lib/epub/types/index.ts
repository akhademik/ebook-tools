// src/lib/epub/types/index.ts
import type JSZip from 'jszip';
import type { EpubMetadata } from '$lib/types';

export interface EpubContainer {
	rootfileFullPath: string;
	version?: string;
}

export interface EpubManifestItem {
	id: string;
	href: string;
	mediaType: string;
	resolvedPath: string;
	properties?: string;
	fallback?: string;
	mediaOverlay?: string;
}

export interface EpubManifest {
	items: Map<string, EpubManifestItem>; // key: id
	byPath: Map<string, EpubManifestItem>; // key: resolvedPath
}

export interface EpubSpineItem {
	idref: string;
	resolvedPath: string;
	linear?: boolean;
	properties?: string;
}

export interface EpubSpine {
	toc?: string;
	pageProgressionDirection?: 'ltr' | 'rtl' | 'default';
	items: EpubSpineItem[];
}

export interface EpubNavPoint {
	id: string;
	label: string;
	contentSrc: string;
	resolvedPath: string;
	playOrder?: number;
	children: EpubNavPoint[];
}

export interface EpubNavigation {
	tocPath?: string;
	navType: 'nav' | 'ncx' | 'both' | 'none';
	toc: EpubNavPoint[];
}

export type EpubResourceCategory = 'page' | 'style' | 'image' | 'font' | 'other';

export interface EpubResource {
	path: string;
	name: string;
	category: EpubResourceCategory;
	byteSize: number;
	mediaType?: string;
	isDirty?: boolean;
}

export interface EpubResources {
	all: Map<string, EpubResource>;
	pages: string[];
	styles: string[];
	images: string[];
	fonts: string[];
	others: string[];
}

export interface EpubBookMetadata extends EpubMetadata {
	description?: string;
	rights?: string;
	pubDate?: string;
	modified?: string;
	coverImageId?: string;
	coverImagePath?: string;
}

export interface EpubPackage {
	opfPath: string;
	version: '2.0' | '3.0' | string;
	uniqueIdentifierId?: string;
	uniqueIdentifierValue?: string;
}

/**
 * Pure central domain model for an EPUB book.
 */
export interface EpubBook {
	zip: JSZip;
	container: EpubContainer;
	package: EpubPackage;
	metadata: EpubBookMetadata;
	manifest: EpubManifest;
	spine: EpubSpine;
	navigation: EpubNavigation;
	resources: EpubResources;
}
