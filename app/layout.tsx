import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
	subsets: ['latin'],
	variable: '--font-montserrat',
	weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
	title: 'Geplano - Gestão e Consultoria de Obras',
	description: 'Gerenciamos obras de alto padrão com excelência construtiva.',
	icons: {
		icon: '/site-icon.png',
		shortcut: '/site-icon.png',
		apple: '/site-icon.png',
	},
	openGraph: {
		title: 'Geplano — Construir nunca foi tão tranquilo',
		description:
			'Gestão de obras de alto padrão com transparência e controle total. São Mateus - ES.',
		url: 'https://xn--geplanogesto-dcb.com.br/',
		siteName: 'Geplano',
		// Use site-icon (existing) for OpenGraph fallback to avoid broken links
		images: [
			{
				url: '/site-icon.png',
				width: 1200,
				height: 630,
				alt: 'Geplano — Gestão de Obras',
			},
		],
		locale: 'pt_BR',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Geplano — Construir nunca foi tão tranquilo',
		description:
			'Gestão de obras de alto padrão com transparência e controle total.',
		images: ['/site-icon.png'],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body className={`${montserrat.variable} antialiased`}>
				{/* JSON-LD Organization / LocalBusiness for SEO */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'HomeAndConstructionBusiness',
							name: 'Geplano Gestão e Consultoria de Obras',
							url: 'https://xn--geplanogesto-dcb.com.br',
							telephone: '+55 27 99724-7384',
							email: 'contato@geplanoengenharia.com.br',
							address: {
								'@type': 'PostalAddress',
								addressLocality: 'São Mateus',
								addressRegion: 'ES',
								addressCountry: 'BR',
							},
							// use an existing public asset
							logo: '/LogoPretaGrande.png',
						}),
					}}
				/>
				{children}
			</body>
		</html>
	);
}
