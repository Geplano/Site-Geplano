'use client';

import React, { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
	Save,
	LayoutDashboard,
	Briefcase,
	Phone,
	Layers,
	Menu,
	Eye,
	X,
	LogOut,
	Database,
	ShieldAlert,
} from 'lucide-react';
import { getContent, saveContent } from '../../services/contentService';
import { SiteData } from '../../lib/types';
import { auth, db } from '../../lib/firebase';
import { FirebaseSetupGuide } from '../../components/admin/FirebaseSetupGuide';
import { LoginScreen } from '../../components/admin/LoginScreen';
import { HeroSection } from '../../components/admin/sections/HeroSection';
import { AboutSection } from '../../components/admin/sections/AboutSection';
import { MissionSection } from '../../components/admin/sections/MissionSection';
import { SolutionSection } from '../../components/admin/sections/SolutionSection';
import { DifferentiatorsSection } from '../../components/admin/sections/DifferentiatorsSection';
import { ProjectsSection } from '../../components/admin/sections/ProjectsSection';
import { OtherSolutionsSection } from '../../components/admin/sections/OtherSolutionsSection';
import { ContactSection } from '../../components/admin/sections/ContactSection';

export default function AdminPage() {
	const [data, setData] = useState<SiteData | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState('hero');

	const loadContent = async () => {
		const content = await getContent();
		setData(content);
	};

	useEffect(() => {
		if (!auth) {
			console.warn(
				'Firebase auth not initialized; skipping auth listener during build.'
			);
			setLoading(false);
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setUser(currentUser);
			if (currentUser) {
				let authorized = false;

				try {
					const settingsRef = doc(db, 'geplano_config', 'settings');
					const settingsDoc = await getDoc(settingsRef);
					if (
						settingsDoc.exists() &&
						settingsDoc
							.data()
							.allowed_emails?.some(
								(email: string) =>
									email.toLowerCase() ===
									currentUser.email?.toLowerCase()
							)
					) {
						authorized = true;
					}
				} catch (error) {
					console.warn(
						'Legacy whitelist check failed (likely permission denied):',
						error
					);
				}

				if (!authorized) {
					try {
						const userDocRef = doc(
							db,
							'whitelist',
							currentUser.email!
						);
						const userDoc = await getDoc(userDocRef);
						if (userDoc.exists()) {
							authorized = true;
						}
					} catch (error) {
						console.warn(
							'New whitelist check failed (likely permission denied or collection missing):',
							error
						);
					}
				}

				setIsAuthorized(authorized);
				if (!authorized) {
					console.warn('User not in whitelist:', currentUser.email);
				}
			} else {
				setIsAuthorized(false);
			}
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (!isAuthorized) return;
		const fetchContent = async () => {
			await loadContent();
		};
		void fetchContent();
	}, [isAuthorized]);

	const handleSave = async () => {
		if (!data) return;
		setSaving(true);
		await saveContent(data);
		setSaving(false);
	};

	const handleLogout = async () => {
		if (!auth) {
			console.warn('Auth not initialized; cannot sign out.');
			return;
		}
		await signOut(auth);
	};

	const scrollToSection = (id: string) => {
		setActiveSection(id);
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
		setMobileMenuOpen(false);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-geplano-green"></div>
			</div>
		);
	}

	if (!user) {
		return <LoginScreen />;
	}

	if (!isAuthorized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
				<div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<LogOut className="text-red-600" size={32} />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Acesso Não Autorizado
					</h2>
					<p className="text-gray-600 mb-6">
						Seu email ({user.email}) não tem permissão para acessar
						o painel administrativo.
					</p>
					<button
						onClick={handleLogout}
						className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
					>
						Voltar para Login
					</button>
				</div>
			</div>
		);
	}

	if (!data) return null;

	const menuItems = [
		{ id: 'whitelist', label: 'Acesso', icon: ShieldAlert },
		{ id: 'hero', label: 'Início', icon: LayoutDashboard },
		{ id: 'about', label: 'Sobre', icon: Database },
		{ id: 'mission', label: 'Missão', icon: Layers },
		{ id: 'solution', label: 'Solução', icon: Briefcase },
		{ id: 'differentiators', label: 'Diferenciais', icon: Phone },
		{ id: 'projects', label: 'Projetos', icon: LayoutDashboard },
		{ id: 'other-solutions', label: 'Outras Soluções', icon: Layers },
		{ id: 'contact', label: 'Contato', icon: Phone },
	];

	const showSection = (id: string) =>
		activeSection === 'hero' || activeSection === id;

	return (
		<div className="min-h-screen bg-[#F3F4F6] flex font-sans text-gray-900">
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}

			<aside
				className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out flex flex-col ${
					mobileMenuOpen
						? 'translate-x-0'
						: '-translate-x-full lg:translate-x-0'
				}`}
			>
				<div className="p-6 border-b border-gray-100 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-geplano-green rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-geplano-green/20">
							G
						</div>
						<div>
							<h1 className="font-bold text-lg text-gray-900 leading-tight">
								Geplano
							</h1>
							<p className="text-xs text-gray-500 font-medium">
								Admin Panel
							</p>
						</div>
					</div>
					<button
						onClick={() => setMobileMenuOpen(false)}
						className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
					>
						<X size={20} />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
					<div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-2">
						Conteúdo do Site
					</div>
					{menuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => scrollToSection(item.id)}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
								activeSection === item.id
									? 'bg-geplano-green text-white shadow-md shadow-geplano-green/20'
									: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
							}`}
						>
							<item.icon
								size={18}
								className={
									activeSection === item.id
										? 'text-white'
										: 'text-gray-400'
								}
							/>
							{item.label}
						</button>
					))}
				</nav>
			</aside>

			<main className="flex-1 min-w-0 h-screen overflow-y-auto">
				<header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setMobileMenuOpen(true)}
							className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
						>
							<Menu size={24} />
						</button>
						<h2 className="text-xl font-bold text-gray-900">
							Editor de Conteúdo
						</h2>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={handleLogout}
							className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
							title="Sair"
						>
							<LogOut size={18} />
						</button>
						<a
							href="/"
							target="_blank"
							className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
						>
							<Eye size={18} />
							Ver Site
						</a>
						<button
							onClick={handleSave}
							disabled={saving}
							className="flex items-center gap-2 px-6 py-2.5 bg-geplano-green hover:bg-geplano-green/90 text-white rounded-xl font-medium shadow-lg shadow-geplano-green/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
						>
							{saving ? (
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<Save size={18} />
							)}
							{saving ? 'Salvando...' : 'Salvar Alterações'}
						</button>
					</div>
				</header>

				<div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10 pb-20">
					{showSection('whitelist') && (
						<div id="whitelist" className="scroll-mt-24">
							<FirebaseSetupGuide />
						</div>
					)}

					{showSection('hero') && (
						<div id="hero" className="scroll-mt-24">
							<HeroSection data={data} setData={setData} />
						</div>
					)}

					{showSection('about') && (
						<div id="about" className="scroll-mt-24">
							<AboutSection data={data} setData={setData} />
						</div>
					)}

					{showSection('mission') && (
						<div id="mission" className="scroll-mt-24">
							<MissionSection data={data} setData={setData} />
						</div>
					)}

					{showSection('solution') && (
						<div id="solution" className="scroll-mt-24">
							<SolutionSection data={data} setData={setData} />
						</div>
					)}

					{showSection('differentiators') && (
						<div id="differentiators" className="scroll-mt-24">
							<DifferentiatorsSection
								data={data}
								setData={setData}
							/>
						</div>
					)}

					{showSection('projects') && (
						<div id="projects" className="scroll-mt-24">
							<ProjectsSection data={data} setData={setData} />
						</div>
					)}

					{showSection('other-solutions') && (
						<div id="other-solutions" className="scroll-mt-24">
							<OtherSolutionsSection
								data={data}
								setData={setData}
							/>
						</div>
					)}

					{showSection('contact') && (
						<div id="contact" className="scroll-mt-24">
							<ContactSection data={data} setData={setData} />
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
