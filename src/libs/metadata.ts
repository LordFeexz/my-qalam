export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
	url: string;
	lastModified?: Date | string;
	changeFrequency?: ChangeFreq;
	priority?: number;
	images?: string[];
	alternates?: { lang: string; url: string }[];
}

export interface SitemapIndexEntry {
	url: string;
	lastModified?: Date | string;
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
	const rows = entries.map((entry) => {
		const lastMod = entry.lastModified
			? new Date(entry.lastModified).toISOString()
			: new Date().toISOString();

		const imageTags =
			entry.images && entry.images.length > 0
				? entry.images
						.map(
							(img) =>
								`\n    <image:image>\n      <image:loc>${escapeXml(img)}</image:loc>\n    </image:image>`
						)
						.join('')
				: '';

		const alternateTags =
            entry.alternates && entry.alternates.length > 0
                ? entry.alternates
                        .map(
                            (alt) =>
                                `\n    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.lang)}" href="${escapeXml(alt.url)}" />`
                        )
                        .join('')
                : '';

		const changeFreqTag = entry.changeFrequency
			? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
			: '';

		const priorityTag =
			entry.priority !== undefined
				? `\n    <priority>${entry.priority}</priority>`
				: '';

		return (
			`  <url>\n` +
			`    <loc>${escapeXml(entry.url)}</loc>\n` +
			`    <lastmod>${lastMod}</lastmod>` +
			changeFreqTag +
			priorityTag +
			imageTags +
			alternateTags +
			`\n  </url>`
		);
	});

	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
		`        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n` +
		`        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
		rows.join('\n') +
		`\n</urlset>`
	);
}

export function generateSitemapIndexXml(entries: SitemapIndexEntry[]): string {
	return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
	.map(
		(entry) => `  <sitemap>\n    <loc>${escapeXml(entry.url)}</loc>\n    ${entry.lastModified ? `<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>` : ''}\n  </sitemap>`
	)
	.join('\n')}\n</sitemapindex>`;
}

export function generateRobotsTxt(
	rules: {
		userAgent: string | string[];
		allow?: string | string[];
		disallow?: string | string[];
		crawlDelay?: number;
	}[],
	sitemaps: string[],
	host: string
): string {
	let content = '';

	rules.forEach((rule) => {
		const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
		agents.forEach((agent) => {
			content += `User-agent: ${agent}\n`;
		});

		if (rule.allow) {
			const allows = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
			allows.forEach((path) => {
				content += `Allow: ${path}\n`;
			});
		}

		if (rule.disallow) {
			const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
			disallows.forEach((path) => {
				content += `Disallow: ${path}\n`;
			});
		}

		if (rule.crawlDelay) {
			content += `Crawl-delay: ${rule.crawlDelay}\n`;
		}

		content += '\n';
	});

	sitemaps.forEach((sitemap) => {
		content += `Sitemap: ${sitemap}\n`;
	});

	content += `Host: ${host}`;

	return content;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
