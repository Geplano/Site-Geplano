import { MetadataRoute } from 'next';

const SITE_URL = 'https://xn--geplanogesto-dcb.com.br';

export default function sitemap(): MetadataRoute.Sitemap {
	const staticPages: MetadataRoute.Sitemap = [
		{ url: `${SITE_URL}/`, lastModified: new Date().toISOString() },
		{ url: `${SITE_URL}/sobre`, lastModified: new Date().toISOString() },
		{ url: `${SITE_URL}/projetos`, lastModified: new Date().toISOString() },
		{ url: `${SITE_URL}/contato`, lastModified: new Date().toISOString() },
		{ url: `${SITE_URL}/admin`, lastModified: new Date().toISOString() },
	];

	// If you have dynamic routes (projects, posts), fetch them here and push to the array.
	// Example (pseudo):
	// const projects = await getProjects();
	// projects.forEach(p => staticPages.push({ url: `${SITE_URL}/projetos/${p.slug}`, lastModified: p.updatedAt }));

	return staticPages;
}
