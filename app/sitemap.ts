import type { MetadataRoute } from 'next';
import admin from 'firebase-admin';

const SITE_URL = 'https://xn--geplanogesto-dcb.com.br';

let db: admin.firestore.Firestore | null = null;
if (
	process.env.FIREBASE_SERVICE_ACCOUNT ||
	process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
) {
	try {
		const raw = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
			? Buffer.from(
					process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
					'base64'
			  ).toString('utf8')
			: process.env.FIREBASE_SERVICE_ACCOUNT || '{}';
		const credentials = JSON.parse(raw) as admin.ServiceAccount;
		if (!admin.apps.length) {
			admin.initializeApp({
				credential: admin.credential.cert(credentials),
			});
		}
		db = admin.firestore();
	} catch (e) {
		console.error('firebase-admin init error', e);
		db = null;
	}
}

async function fetchProjectsFromAdmin() {
	try {
		if (!db) return [];
		const snap = await db
			.collection('projects')
			.where('published', '==', true)
			.get();
		return snap.docs.map((d: admin.firestore.QueryDocumentSnapshot) => {
			const updated = d.get('updatedAt') || d.get('createdAt');
			let updatedIso: string | undefined;
			if (updated) {
				const maybeObj: unknown = updated;
				const hasToDate =
					typeof maybeObj === 'object' &&
					maybeObj !== null &&
					'toDate' in (maybeObj as object) &&
					typeof (maybeObj as { toDate?: unknown }).toDate ===
						'function';
				if (hasToDate) {
					updatedIso = (maybeObj as { toDate: () => Date })
						.toDate()
						.toISOString();
				} else {
					updatedIso = new Date(String(updated)).toISOString();
				}
			}
			return { slug: d.id, updatedAt: updatedIso };
		});
	} catch (e) {
		console.error('sitemap fetchProjects error', e);
		return [];
	}
}

async function fetchProjectsFromApi() {
	try {
		const base = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;
		const res = await fetch(`${base}/api/projects`, { cache: 'no-store' });
		if (!res.ok) return [];
		const json = await res.json();
		if (!Array.isArray(json)) return [];
		return json.map((p: { slug: string; updatedAt?: string | Date }) => ({
			slug: p.slug,
			updatedAt:
				typeof p.updatedAt === 'string'
					? p.updatedAt
					: p.updatedAt?.toString(),
		}));
	} catch (e) {
		console.error('sitemap fetch API error', e);
		return [];
	}
}

async function fetchProjects() {
	if (db) return fetchProjectsFromAdmin();
	return fetchProjectsFromApi();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticPages: MetadataRoute.Sitemap = [
		{ url: `${SITE_URL}/` },
		{ url: `${SITE_URL}/sobre` },
		{ url: `${SITE_URL}/projetos` },
		{ url: `${SITE_URL}/contato` },
	];

	const projects = await fetchProjects();

	const projectUrls = projects.map(
		(p: { slug: string; updatedAt?: string }) => {
			const lastModified = p.updatedAt
				? new Date(p.updatedAt).toISOString()
				: undefined;
			return lastModified
				? { url: `${SITE_URL}/projetos/${p.slug}`, lastModified }
				: { url: `${SITE_URL}/projetos/${p.slug}` };
		}
	);

	return [...staticPages, ...projectUrls];
}
