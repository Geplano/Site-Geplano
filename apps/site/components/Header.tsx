import React, {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
} from 'react';
import { Menu, X, Lock } from 'lucide-react';
import { SiteData } from '../../../types';

const PORTAL_URL =
	'https://www.obraprimaweb.com.br/portalcliente/geplanoengenharia';

// Em Vite, arquivos em /public são servidos na raiz
const WHITE_LOGO_SRC = '/logo1.png';
const BLACK_LOGO_SRC = '/logo2.png';

interface HeaderProps {
	data: SiteData['header'];
}

export const Header: React.FC<HeaderProps> = ({ data }) => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navLinks = useMemo(
		() => [
			{ label: data.nav_about, href: '#sobre' },
			{ label: data.nav_team, href: '#equipe' },
			{ label: data.nav_solution, href: '#solucao' },
			{ label: data.nav_features, href: '#diferenciais' },
			{ label: data.nav_projects, href: '#projetos' },
			{ label: data.nav_other_solutions, href: '#outras-solucoes' },
			{ label: data.nav_contact, href: '#contato' },
		],
		[data]
	);
	const [activeSection, setActiveSection] = useState<string>(
		navLinks[0]?.href ?? ''
	);
	const manualScrollRef = useRef(false);
	const manualScrollTimeout = useRef<number | null>(null);

	const updateActiveSection = useCallback(
		(options?: { force?: boolean }) => {
			if (typeof window === 'undefined') return;
			if (!options?.force && manualScrollRef.current) return;
			const scrollPosition = window.scrollY + window.innerHeight * 0.25;
			let current = navLinks[0]?.href ?? '';

			for (const link of navLinks) {
				const sectionId = link.href.slice(1);
				const element = document.getElementById(sectionId);
				if (!element) continue;
				const elementTop = element.offsetTop;
				if (scrollPosition >= elementTop) {
					current = link.href;
				}
			}

			setActiveSection((prev) => (prev !== current ? current : prev));
		},
		[navLinks]
	);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
			updateActiveSection();
		};
		const handleResize = () => updateActiveSection();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize);
		updateActiveSection({ force: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	}, [updateActiveSection]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const currentHash = window.location.hash;
		if (navLinks.some((link) => link.href === currentHash)) {
			setActiveSection(currentHash);
		} else if (!currentHash && navLinks[0]) {
			setActiveSection(navLinks[0].href);
		}
	}, [navLinks]);

	const scrollToSection = useCallback((hash: string) => {
		if (typeof window === 'undefined') return;
		const sectionId = hash.replace('#', '');
		const target = document.getElementById(sectionId);
		if (target) {
			const headerOffset = window.innerWidth < 1024 ? 80 : 96;
			const elementPosition =
				target.getBoundingClientRect().top + window.scrollY;
			const offsetPosition = elementPosition - headerOffset;
			window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
			if (window.history && window.history.replaceState) {
				window.history.replaceState(null, '', hash);
			}
		}
	}, []);

	const handleNavClick = useCallback(
		(event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
			event.preventDefault();
			manualScrollRef.current = true;
			if (manualScrollTimeout.current !== null) {
				window.clearTimeout(manualScrollTimeout.current);
			}
			manualScrollTimeout.current = window.setTimeout(() => {
				manualScrollRef.current = false;
				updateActiveSection({ force: true });
			}, 900);

			scrollToSection(hash);
			setActiveSection(hash);
			setIsMenuOpen(false);
		},
		[scrollToSection, updateActiveSection]
	);

	useEffect(() => {
		return () => {
			if (manualScrollTimeout.current !== null) {
				window.clearTimeout(manualScrollTimeout.current);
			}
		};
	}, []);

	const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
		isScrolled || isMenuOpen
			? 'bg-white/95 backdrop-blur-md shadow-lg py-2 md:py-3 lg:py-4'
			: 'bg-transparent py-4 md:py-6 lg:py-8'
	}`;

	const SCROLLED_TEXT_CLASS = 'text-gray-800';
	const TRANSPARENT_TEXT_CLASS = 'text-white shadow-black/20 text-shadow-sm'; // Added text-shadow for better readability on images

	const textClass = isScrolled || isMenuOpen ? SCROLLED_TEXT_CLASS : TRANSPARENT_TEXT_CLASS;

	// Logic to show black logo: if scrolled OR menu is open
	const showBlackLogo = isScrolled || isMenuOpen;

	const desktopLinkClass = (href: string) => {
		const isActive = activeSection === href;
		const colorClass = isActive ? 'text-geplano-gold' : textClass;
		
		// RESPONSIVE FONT SIZE:
		// text-[11px] on large tablets/small laptops (lg)
		// text-xs (12px) on desktops (xl)
		// text-sm (14px) on large screens (2xl - 1920px)
		const fontSizeClass = 'text-[10px] lg:text-[11px] xl:text-xs 2xl:text-sm';
		
		const underlineClass = isActive
			? 'after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-geplano-gold hover:text-geplano-gold'
			: 'hover:text-geplano-gold';
			
		return `${fontSizeClass} font-bold uppercase tracking-wide transition-colors relative pb-1 whitespace-nowrap ${colorClass} ${underlineClass}`;
	};

	return (
		<header className={headerClass}>
			{/* Changed container to fluid width with max constraint for 1920px screens */}
			<div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 flex justify-between items-center">
				
				{/* LOGO AREA */}
				<a
					href="#home"
					className="relative h-10 md:h-12 lg:h-14 xl:h-16 w-32 md:w-40 lg:w-48 xl:w-56 flex-shrink-0 transition-all duration-300"
				>
					{/* Branca (White) */}
					<img
						src={WHITE_LOGO_SRC}
						alt="Geplano"
						className={`absolute left-0 top-0 h-full w-auto object-contain transition-opacity duration-300 ${
							showBlackLogo
								? 'opacity-0 pointer-events-none'
								: 'opacity-100'
						}`}
					/>

					{/* Preta (Black) */}
					<img
						src={BLACK_LOGO_SRC}
						alt="Geplano"
						className={`absolute left-0 top-0 h-full w-auto object-contain transition-opacity duration-300 ${
							showBlackLogo
								? 'opacity-100'
								: 'opacity-0 pointer-events-none'
						}`}
					/>
				</a>

				{/* Desktop Nav */}
				{/* RESPONSIVE GAP: gap-4 (tight) -> gap-6 (normal) -> gap-8 (wide) */}
				<nav className="hidden lg:flex items-center gap-x-3 xl:gap-x-5 2xl:gap-x-8">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className={desktopLinkClass(link.href)}
							onClick={(event) =>
								handleNavClick(event, link.href)
							}
							aria-current={
								activeSection === link.href ? 'page' : undefined
							}
						>
							{link.label}
						</a>
					))}

					{/* Temporary Admin Link */}
					<a
						href="#/admin"
						className={`text-[10px] lg:text-[11px] xl:text-xs 2xl:text-sm font-bold uppercase tracking-wide text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 whitespace-nowrap`}
					>
						<Lock className="w-3 h-3" /> Admin
					</a>

					<a
						href={PORTAL_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="bg-geplano-gold hover:bg-geplano-goldHover text-white px-3 lg:px-5 xl:px-6 py-2 rounded-md text-[10px] lg:text-xs xl:text-sm font-bold uppercase transition-all transform hover:-translate-y-0.5 shadow-sm whitespace-nowrap ml-2"
					>
						{data.nav_portal}
					</a>
				</nav>

				{/* Mobile Toggle */}
				<button
					className={`lg:hidden p-2 rounded-md focus:outline-none transition-colors ${
						isMenuOpen ? 'bg-gray-100' : ''
					}`}
					onClick={() => setIsMenuOpen(!isMenuOpen)}
				>
					{isMenuOpen ? (
						<X className="w-8 h-8 text-gray-800" />
					) : (
						<Menu className={`w-8 h-8 ${textClass}`} />
					)}
				</button>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 animate-fade-in-up">
					<div className="flex flex-col px-6 py-8 space-y-4 h-[calc(100vh-80px)] overflow-y-auto">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={(event) =>
									handleNavClick(event, link.href)
								}
								className={`text-gray-800 font-bold uppercase text-base border-b border-gray-50 pb-2 ${
									activeSection === link.href
										? 'text-geplano-gold'
										: 'hover:text-geplano-gold'
								}`}
								aria-current={
									activeSection === link.href
										? 'page'
										: undefined
								}
							>
								{link.label}
							</a>
						))}

						<a
							href="#/admin"
							onClick={() => setIsMenuOpen(false)}
							className="text-red-500 font-bold uppercase text-base hover:text-red-700 flex items-center gap-2 pt-2"
						>
							<Lock className="w-4 h-4" /> Admin (Temp)
						</a>

						<a
							href={PORTAL_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-geplano-gold hover:bg-geplano-goldHover text-white text-center py-4 rounded-lg font-bold uppercase mt-4 shadow-md"
						>
							{data.nav_portal}
						</a>
					</div>
				</div>
			)}
		</header>
	);
};