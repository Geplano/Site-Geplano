import React, { useEffect, useState } from 'react';
import {
	getContent,
	saveContent,
	resetContent,
} from '../../services/contentService';
import { SiteData } from '../../types';
import { FirebaseSetupGuide } from './components/FirebaseSetupGuide';
import { LoginScreen } from './components/LoginScreen'; // Import Login
import { auth, db } from '../../services/firebase'; // Import Auth
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions for whitelist check
import { ImagePicker } from './components/ImagePicker';
import {
	Save,
	RotateCcw,
	Monitor,
	LayoutDashboard,
	Users,
	Briefcase,
	Phone,
	Layers,
	CheckCircle2,
	Menu,
	Code,
	Eye,
	List,
	X,
	ChevronRight,
	ChevronLeft,
	Plus,
	Trash2,
	Image as ImageIcon,
	MapPin,
	Tag,
	ArrowRight,
	Database,
	LogOut, // New icon
} from 'lucide-react';

// --- Reusable UI Components ---

const Field = ({
	label,
	children,
	description,
}: {
	label: string;
	children: React.ReactNode;
	description?: string;
}) => (
	<div className="mb-6">
		<label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide flex justify-between items-center">
			{label}
		</label>
		{children}
		{description && (
			<p className="text-xs text-gray-400 mt-2">{description}</p>
		)}
	</div>
);

const Input = ({
	value,
	onChange,
	placeholder,
	className = '',
}: {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	className?: string;
}) => (
	<input
		type="text"
		value={value}
		onChange={(e) => onChange(e.target.value)}
		placeholder={placeholder}
		className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-geplano-green/20 focus:border-geplano-green transition-all outline-none placeholder-gray-300 shadow-sm ${className}`}
	/>
);

const TextArea = ({
	value,
	onChange,
	rows = 4,
	placeholder,
	className = '',
}: {
	value: string;
	onChange: (val: string) => void;
	rows?: number;
	placeholder?: string;
	className?: string;
}) => (
	<textarea
		value={value}
		onChange={(e) => onChange(e.target.value)}
		rows={rows}
		placeholder={placeholder}
		className={`w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-geplano-green/20 focus:border-geplano-green transition-all outline-none shadow-sm resize-y min-h-[100px] ${className}`}
	/>
);

const SectionCard = ({
	title,
	children,
	id,
	action,
}: {
	title: string;
	children: React.ReactNode;
	id?: string;
	action?: React.ReactNode;
}) => (
	<div
		id={id}
		className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8 scroll-mt-24"
	>
		<div className="bg-gray-50/50 px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<div className="w-1 h-6 bg-geplano-gold rounded-full"></div>
				<h3 className="text-base md:text-lg font-bold text-gray-800">
					{title}
				</h3>
			</div>
			{action}
		</div>
		<div className="p-4 md:p-6">{children}</div>
	</div>
);

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
	<button
		onClick={onClick}
		className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
		title="Remover item"
	>
		<Trash2 size={18} />
	</button>
);

const AddButton = ({
	onClick,
	label,
}: {
	onClick: () => void;
	label: string;
}) => (
	<button
		onClick={onClick}
		className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-geplano-green hover:text-geplano-green hover:bg-green-50 transition-all flex items-center justify-center gap-2"
	>
		<Plus size={20} /> {label}
	</button>
);

// --- Main App ---

type SectionKey =
	| 'all'
	| 'hero'
	| 'about'
	| 'mission'
	| 'team'
	| 'solution'
	| 'differentiators'
	| 'projects'
	| 'other_solutions'
	| 'contact'
	| 'json'
	| 'firebase_setup';

export const AdminApp: React.FC = () => {
	const [data, setData] = useState<SiteData | null>(null);
	const [activeSection, setActiveSection] = useState<SectionKey>('all');
	const [jsonText, setJsonText] = useState('');
	const [message, setMessage] = useState<{
		text: string;
		type: 'success' | 'error';
	} | null>(null);
	const [user, setUser] = useState<User | null>(null); // Auth State fixed
	const [authChecking, setAuthChecking] = useState(true);
	const [accessError, setAccessError] = useState('');

	// Sidebar state
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		// Auth Listener with Whitelist Check
		if (auth) {
			const unsubscribe = onAuthStateChanged(
				auth,
				async (currentUser) => {
					if (currentUser) {
						// Check Whitelist in Firestore
						try {
							if (db && currentUser.email) {
								const docRef = doc(
									db,
									'geplano_config',
									'settings'
								);
								const docSnap = await getDoc(docRef);

								if (docSnap.exists()) {
									const allowedEmails = docSnap.data()
										.allowed_emails as string[];
									if (
										allowedEmails &&
										allowedEmails.length > 0 &&
										!allowedEmails.includes(
											currentUser.email
										)
									) {
										await signOut(auth);
										setAccessError(
											`Acesso negado para ${currentUser.email}. Contate o administrador.`
										);
										setUser(null);
										setAuthChecking(false);
										return;
									}
								}
							}
						} catch (e) {
							console.error('Erro ao verificar whitelist:', e);
							// Em caso de erro de rede, talvez permitir ou bloquear? Vamos permitir mas logar.
						}

						setAccessError('');
						setUser(currentUser);
					} else {
						setUser(null);
					}
					setAuthChecking(false);
				}
			);
			return () => unsubscribe();
		} else {
			setAuthChecking(false);
		}
	}, []);

	useEffect(() => {
		const handleResize = () => {
			const mobile = window.innerWidth < 1024;
			setIsMobile(mobile);
			if (mobile) setIsSidebarOpen(false); // Default close on mobile
			else setIsSidebarOpen(true); // Default expand on desktop
		};

		// Initial check
		const mobile = window.innerWidth < 1024;
		setIsMobile(mobile);
		if (mobile) setIsSidebarOpen(false);

		window.addEventListener('resize', handleResize);

		// Load content async
		const init = async () => {
			const loaded = await getContent();
			setData(loaded);
			setJsonText(JSON.stringify(loaded, null, 2));
		};
		init();

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleSave = async () => {
		if (activeSection === 'json') {
			try {
				const parsed = JSON.parse(jsonText);
				await saveContent(parsed);
				setData(parsed);
				setMessage({
					text: 'JSON salvo com sucesso!',
					type: 'success',
				});
			} catch (e) {
				setMessage({ text: 'Erro: JSON inválido.', type: 'error' });
				return;
			}
		} else {
			if (data) {
				try {
					await saveContent(data);
					setJsonText(JSON.stringify(data, null, 2)); // Sync JSON
					setMessage({
						text: 'Conteúdo atualizado e publicado!',
						type: 'success',
					});
				} catch (e) {
					setMessage({
						text: 'Erro ao salvar conteúdo.',
						type: 'error',
					});
				}
			}
		}
		setTimeout(() => setMessage(null), 3000);
	};

	const handleReset = async () => {
		if (
			confirm(
				'Tem certeza? Isso irá restaurar o conteúdo original do site e perderá suas alterações.'
			)
		) {
			const initial = await resetContent();
			setData(initial);
			setJsonText(JSON.stringify(initial, null, 2));
			setMessage({
				text: 'Conteúdo restaurado para o padrão.',
				type: 'success',
			});
			setTimeout(() => setMessage(null), 3000);
		}
	};

	const handleLogout = async () => {
		if (auth) {
			await signOut(auth);
		}
	};

	// --- Auth Guards ---
	if (authChecking)
		return (
			<div className="flex h-screen items-center justify-center text-geplano-green font-bold animate-pulse">
				<div className="w-8 h-8 border-4 border-geplano-green border-t-transparent rounded-full animate-spin mr-3"></div>{' '}
				Verificando permissões...
			</div>
		);

	if (!user && auth)
		return (
			<>
				{accessError && (
					<div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 shadow-lg">
						<strong className="font-bold">Erro: </strong>
						<span className="block sm:inline">{accessError}</span>
					</div>
				)}
				<LoginScreen />
			</>
		);

	if (!data)
		return (
			<div className="flex h-screen items-center justify-center text-geplano-green font-bold animate-pulse">
				Carregando painel administrativo...
			</div>
		);

	const menuItems = [
		{ id: 'all', label: 'Ver Tudo', icon: <List size={20} /> },
		{
			id: 'hero',
			label: 'Capa (Hero)',
			icon: <LayoutDashboard size={20} />,
		},
		{ id: 'about', label: 'Sobre Nós', icon: <Briefcase size={20} /> },
		{ id: 'mission', label: 'Essência', icon: <CheckCircle2 size={20} /> },
		{ id: 'team', label: 'Equipe', icon: <Users size={20} /> },
		{ id: 'solution', label: 'Solução', icon: <Layers size={20} /> },
		{
			id: 'differentiators',
			label: 'App / Diferenciais',
			icon: <Code size={20} />,
		},
		{ id: 'projects', label: 'Projetos', icon: <Eye size={20} /> },
		{
			id: 'other_solutions',
			label: 'Outras Soluções',
			icon: <CheckCircle2 size={20} />,
		},
		{ id: 'contact', label: 'Contato', icon: <Phone size={20} /> },
		{ id: 'json', label: 'Editor JSON', icon: <Code size={20} /> },
		{
			id: 'firebase_setup',
			label: 'Banco de Dados',
			icon: <Database size={20} />,
		},
	];

	// --- Render Sections Logic ---

	const renderSectionContent = (key: SectionKey) => {
		if (!data) return null;
		if (key === 'firebase_setup') return <FirebaseSetupGuide />;

		switch (key) {
			case 'hero':
				return (
					<SectionCard title="Capa do Site (Hero)" id="hero">
						<Field label="Título Principal">
							<Input
								value={data.hero.title}
								onChange={(v) =>
									setData({
										...data,
										hero: { ...data.hero, title: v },
									})
								}
							/>
						</Field>
						<Field label="Subtítulo">
							<TextArea
								value={data.hero.subtitle}
								onChange={(v) =>
									setData({
										...data,
										hero: { ...data.hero, subtitle: v },
									})
								}
							/>
						</Field>
						<Field label="Texto do Botão">
							<Input
								value={data.hero.button}
								onChange={(v) =>
									setData({
										...data,
										hero: { ...data.hero, button: v },
									})
								}
							/>
						</Field>

						{/* Hero Images Slider Management */}
						<div className="mt-8 border-t border-gray-100 pt-6">
							<label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
								Imagens de Fundo (Slider)
							</label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{(data.hero.images || []).map((img, idx) => (
									<div
										key={idx}
										className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group"
									>
										<div className="absolute top-2 right-2 z-10">
											<button
												onClick={() => {
													const newImages = [
														...(data.hero.images ||
															[]),
													];
													newImages.splice(idx, 1);
													setData({
														...data,
														hero: {
															...data.hero,
															images: newImages,
														},
													});
												}}
												className="bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50"
												title="Remover Imagem"
											>
												<Trash2 size={16} />
											</button>
										</div>
										<ImagePicker
											currentValue={img}
											onImageSelected={(url) => {
												const newImages = [
													...(data.hero.images || []),
												];
												newImages[idx] = url;
												setData({
													...data,
													hero: {
														...data.hero,
														images: newImages,
													},
												});
											}}
										/>
										<div className="text-xs text-center text-gray-400 mt-2 font-mono">
											Slide {idx + 1}
										</div>
									</div>
								))}
								<button
									onClick={() => {
										const newImages = [
											...(data.hero.images || []),
											'https://picsum.photos/1920/1080',
										];
										setData({
											...data,
											hero: {
												...data.hero,
												images: newImages,
											},
										});
									}}
									className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-geplano-green hover:text-geplano-green hover:bg-green-50 transition-all min-h-[200px]"
								>
									<Plus size={32} />
									<span className="font-bold mt-2">
										Adicionar Slide
									</span>
								</button>
							</div>
						</div>
					</SectionCard>
				);

			case 'about':
				return (
					<SectionCard title="Sobre a Geplano" id="about">
						<Field label="Título da Seção">
							<Input
								value={data.about.title}
								onChange={(v) =>
									setData({
										...data,
										about: { ...data.about, title: v },
									})
								}
							/>
						</Field>
						<Field label="Parágrafo Introdutório">
							<TextArea
								rows={6}
								value={data.about.p1}
								onChange={(v) =>
									setData({
										...data,
										about: { ...data.about, p1: v },
									})
								}
							/>
						</Field>
						<Field label="Parágrafo Secundário">
							<TextArea
								rows={6}
								value={data.about.p2}
								onChange={(v) =>
									setData({
										...data,
										about: { ...data.about, p2: v },
									})
								}
							/>
						</Field>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{data.about.stats.map((stat, idx) => (
								<div
									key={idx}
									className="bg-gray-50 p-4 rounded-lg border border-gray-200"
								>
									<label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
										Estatística {idx + 1}
									</label>
									<Input
										className="mb-2"
										placeholder="Valor"
										value={stat.value}
										onChange={(v) => {
											const newStats = [
												...data.about.stats,
											];
											newStats[idx].value = v;
											setData({
												...data,
												about: {
													...data.about,
													stats: newStats,
												},
											});
										}}
									/>
									<Input
										placeholder="Rótulo"
										value={stat.label}
										onChange={(v) => {
											const newStats = [
												...data.about.stats,
											];
											newStats[idx].label = v;
											setData({
												...data,
												about: {
													...data.about,
													stats: newStats,
												},
											});
										}}
									/>
								</div>
							))}
						</div>
					</SectionCard>
				);

			case 'mission':
				return (
					<div id="mission">
						<SectionCard title="Missão, Visão e Propósito">
							<Field label="Título da Seção">
								<Input
									value={data.mission_vision_values.title}
									onChange={(v) =>
										setData({
											...data,
											mission_vision_values: {
												...data.mission_vision_values,
												title: v,
											},
										})
									}
								/>
							</Field>
							<div className="grid md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Input
										className="font-bold"
										value={
											data.mission_vision_values
												.mission_title
										}
										onChange={(v) =>
											setData({
												...data,
												mission_vision_values: {
													...data.mission_vision_values,
													mission_title: v,
												},
											})
										}
									/>
									<TextArea
										rows={8}
										value={
											data.mission_vision_values
												.mission_text
										}
										onChange={(v) =>
											setData({
												...data,
												mission_vision_values: {
													...data.mission_vision_values,
													mission_text: v,
												},
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Input
										className="font-bold"
										value={
											data.mission_vision_values
												.vision_title
										}
										onChange={(v) =>
											setData({
												...data,
												mission_vision_values: {
													...data.mission_vision_values,
													vision_title: v,
												},
											})
										}
									/>
									<TextArea
										rows={8}
										value={
											data.mission_vision_values
												.vision_text
										}
										onChange={(v) =>
											setData({
												...data,
												mission_vision_values: {
													...data.mission_vision_values,
													vision_text: v,
												},
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Input
										className="font-bold"
										value={
											data.mission_vision_values
												.purpose_title
										}
										onChange={(v) =>
											setData({
												...data,
												mission_vision_values: {
													...data.mission_vision_values,
													purpose_title: v,
												},
											})
										}
									/>
									<TextArea
										rows={8}
										value={
											data.mission_vision_values
												.purpose_text
										}
										onChange={(v) =>
											setData({
												...data,
												mission_vision_values: {
													...data.mission_vision_values,
													purpose_text: v,
												},
											})
										}
									/>
								</div>
							</div>
						</SectionCard>
						<SectionCard title="Valores da Empresa">
							<Field label="Título dos Valores">
								<Input
									value={
										data.mission_vision_values.values_title
									}
									onChange={(v) =>
										setData({
											...data,
											mission_vision_values: {
												...data.mission_vision_values,
												values_title: v,
											},
										})
									}
								/>
							</Field>
							<div className="space-y-4">
								{data.mission_vision_values.values_list.map(
									(val, idx) => (
										<div
											key={idx}
											className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg"
										>
											<div className="flex-grow space-y-2">
												<Input
													placeholder="Valor (Ex: Ética)"
													value={val.title}
													onChange={(v) => {
														const newList = [
															...data
																.mission_vision_values
																.values_list,
														];
														newList[idx].title = v;
														setData({
															...data,
															mission_vision_values:
																{
																	...data.mission_vision_values,
																	values_list:
																		newList,
																},
														});
													}}
												/>
												<TextArea
													rows={2}
													placeholder="Descrição"
													value={val.text}
													onChange={(v) => {
														const newList = [
															...data
																.mission_vision_values
																.values_list,
														];
														newList[idx].text = v;
														setData({
															...data,
															mission_vision_values:
																{
																	...data.mission_vision_values,
																	values_list:
																		newList,
																},
														});
													}}
												/>
											</div>
											<DeleteButton
												onClick={() => {
													const newList =
														data.mission_vision_values.values_list.filter(
															(_, i) => i !== idx
														);
													setData({
														...data,
														mission_vision_values: {
															...data.mission_vision_values,
															values_list:
																newList,
														},
													});
												}}
											/>
										</div>
									)
								)}
								<AddButton
									label="Adicionar Valor"
									onClick={() => {
										const newList = [
											...data.mission_vision_values
												.values_list,
											{
												title: 'Novo Valor',
												text: 'Descrição do valor.',
											},
										];
										setData({
											...data,
											mission_vision_values: {
												...data.mission_vision_values,
												values_list: newList,
											},
										});
									}}
								/>
							</div>
						</SectionCard>
					</div>
				);

			case 'team':
				return (
					<SectionCard title="Equipe / Sócios" id="team">
						<Field label="Título da Seção">
							<Input
								value={data.team.title}
								onChange={(v) =>
									setData({
										...data,
										team: { ...data.team, title: v },
									})
								}
							/>
						</Field>
						<div className="space-y-6">
							{data.team.members.map((member, idx) => (
								<div
									key={idx}
									className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100 items-start"
								>
									{/* Increased width from w-32 to w-56 for better Image Picker layout */}
									<div className="w-full md:w-56 flex-shrink-0">
										<ImagePicker
											label="Foto do Sócio"
											currentValue={member.image}
											onImageSelected={(url) => {
												const newMembers = [
													...data.team.members,
												];
												newMembers[idx].image = url;
												setData({
													...data,
													team: {
														...data.team,
														members: newMembers,
													},
												});
											}}
										/>
									</div>
									<div className="flex-grow w-full space-y-3">
										<Input
											placeholder="Nome"
											className="font-bold bg-white text-gray-900"
											value={member.name}
											onChange={(v) => {
												const newMembers = [
													...data.team.members,
												];
												newMembers[idx].name = v;
												setData({
													...data,
													team: {
														...data.team,
														members: newMembers,
													},
												});
											}}
										/>
										<Input
											placeholder="Cargo"
											className="text-geplano-gold bg-white"
											value={member.role}
											onChange={(v) => {
												const newMembers = [
													...data.team.members,
												];
												newMembers[idx].role = v;
												setData({
													...data,
													team: {
														...data.team,
														members: newMembers,
													},
												});
											}}
										/>
										<TextArea
											placeholder="Descrição"
											rows={4}
											className="bg-white text-gray-900"
											value={member.description}
											onChange={(v) => {
												const newMembers = [
													...data.team.members,
												];
												newMembers[idx].description = v;
												setData({
													...data,
													team: {
														...data.team,
														members: newMembers,
													},
												});
											}}
										/>
									</div>
									<DeleteButton
										onClick={() => {
											const newMembers =
												data.team.members.filter(
													(_, i) => i !== idx
												);
											setData({
												...data,
												team: {
													...data.team,
													members: newMembers,
												},
											});
										}}
									/>
								</div>
							))}
							<AddButton
								label="Adicionar Membro"
								onClick={() => {
									const newMembers = [
										...data.team.members,
										{
											name: 'Novo Membro',
											role: 'Cargo',
											description: 'Descrição...',
											image: 'https://picsum.photos/200',
										},
									];
									setData({
										...data,
										team: {
											...data.team,
											members: newMembers,
										},
									});
								}}
							/>
						</div>
					</SectionCard>
				);

			case 'solution':
				return (
					<div id="solution">
						<SectionCard title="Solução - Cabeçalho">
							<Field label="Título">
								<Input
									value={data.solution.title}
									onChange={(v) =>
										setData({
											...data,
											solution: {
												...data.solution,
												title: v,
											},
										})
									}
								/>
							</Field>
							<Field label="Subtítulo">
								<TextArea
									value={data.solution.subtitle}
									onChange={(v) =>
										setData({
											...data,
											solution: {
												...data.solution,
												subtitle: v,
											},
										})
									}
								/>
							</Field>
						</SectionCard>

						<SectionCard title="Solução - Pilares (Tab 1)">
							{data.solution.content.pillars.map((item, idx) => (
								<div
									key={idx}
									className="mb-4 pb-4 border-b border-gray-100 last:border-0"
								>
									<Input
										className="mb-2 font-bold text-geplano-green"
										value={item.title}
										onChange={(v) => {
											const newPillars = [
												...data.solution.content
													.pillars,
											];
											newPillars[idx].title = v;
											setData({
												...data,
												solution: {
													...data.solution,
													content: {
														...data.solution
															.content,
														pillars: newPillars,
													},
												},
											});
										}}
									/>
									<TextArea
										rows={2}
										value={item.text}
										onChange={(v) => {
											const newPillars = [
												...data.solution.content
													.pillars,
											];
											newPillars[idx].text = v;
											setData({
												...data,
												solution: {
													...data.solution,
													content: {
														...data.solution
															.content,
														pillars: newPillars,
													},
												},
											});
										}}
									/>
								</div>
							))}
						</SectionCard>

						<SectionCard title="Solução - Vantagens (Tab 2)">
							{data.solution.content.advantages.map(
								(item, idx) => (
									<div
										key={idx}
										className="mb-4 pb-4 border-b border-gray-100 last:border-0"
									>
										<div className="flex justify-between items-center mb-2">
											<Input
												className="font-bold text-geplano-gold flex-grow mr-2"
												value={item.title}
												onChange={(v) => {
													const newAdv = [
														...data.solution.content
															.advantages,
													];
													newAdv[idx].title = v;
													setData({
														...data,
														solution: {
															...data.solution,
															content: {
																...data.solution
																	.content,
																advantages:
																	newAdv,
															},
														},
													});
												}}
											/>
											<DeleteButton
												onClick={() => {
													const newAdv =
														data.solution.content.advantages.filter(
															(_, i) => i !== idx
														);
													setData({
														...data,
														solution: {
															...data.solution,
															content: {
																...data.solution
																	.content,
																advantages:
																	newAdv,
															},
														},
													});
												}}
											/>
										</div>
										<TextArea
											rows={2}
											value={item.text}
											onChange={(v) => {
												const newAdv = [
													...data.solution.content
														.advantages,
												];
												newAdv[idx].text = v;
												setData({
													...data,
													solution: {
														...data.solution,
														content: {
															...data.solution
																.content,
															advantages: newAdv,
														},
													},
												});
											}}
										/>
									</div>
								)
							)}
							<AddButton
								label="Adicionar Vantagem"
								onClick={() => {
									const newAdv = [
										...data.solution.content.advantages,
										{
											title: 'Nova Vantagem',
											text: 'Descrição',
										},
									];
									setData({
										...data,
										solution: {
											...data.solution,
											content: {
												...data.solution.content,
												advantages: newAdv,
											},
										},
									});
								}}
							/>
						</SectionCard>

						<SectionCard title="Solução - Entrega (Tab 3)">
							<Field label="Título">
								<Input
									value={data.solution.content.delivery.title}
									onChange={(v) =>
										setData({
											...data,
											solution: {
												...data.solution,
												content: {
													...data.solution.content,
													delivery: {
														...data.solution.content
															.delivery,
														title: v,
													},
												},
											},
										})
									}
								/>
							</Field>
							<Field label="Subtítulo">
								<TextArea
									value={
										data.solution.content.delivery.subtitle
									}
									onChange={(v) =>
										setData({
											...data,
											solution: {
												...data.solution,
												content: {
													...data.solution.content,
													delivery: {
														...data.solution.content
															.delivery,
														subtitle: v,
													},
												},
											},
										})
									}
								/>
							</Field>

							<label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
								Passos da Entrega
							</label>
							<div className="space-y-2">
								{data.solution.content.delivery.steps.map(
									(step, idx) => (
										<div key={idx} className="flex gap-2">
											<span className="w-8 h-10 flex items-center justify-center font-bold text-gray-400 bg-gray-100 rounded">
												{idx + 1}
											</span>
											<Input
												value={step}
												onChange={(v) => {
													const newSteps = [
														...data.solution.content
															.delivery.steps,
													];
													newSteps[idx] = v;
													setData({
														...data,
														solution: {
															...data.solution,
															content: {
																...data.solution
																	.content,
																delivery: {
																	...data
																		.solution
																		.content
																		.delivery,
																	steps: newSteps,
																},
															},
														},
													});
												}}
											/>
											<DeleteButton
												onClick={() => {
													const newSteps =
														data.solution.content.delivery.steps.filter(
															(_, i) => i !== idx
														);
													setData({
														...data,
														solution: {
															...data.solution,
															content: {
																...data.solution
																	.content,
																delivery: {
																	...data
																		.solution
																		.content
																		.delivery,
																	steps: newSteps,
																},
															},
														},
													});
												}}
											/>
										</div>
									)
								)}
								<AddButton
									label="Adicionar Passo"
									onClick={() => {
										const newSteps = [
											...data.solution.content.delivery
												.steps,
											'Novo Passo',
										];
										setData({
											...data,
											solution: {
												...data.solution,
												content: {
													...data.solution.content,
													delivery: {
														...data.solution.content
															.delivery,
														steps: newSteps,
													},
												},
											},
										});
									}}
								/>
							</div>
						</SectionCard>
					</div>
				);

			case 'differentiators':
				return (
					<SectionCard
						title="App & Diferenciais"
						id="differentiators"
					>
						<Field label="Título">
							<Input
								value={data.differentiators.title}
								onChange={(v) =>
									setData({
										...data,
										differentiators: {
											...data.differentiators,
											title: v,
										},
									})
								}
							/>
						</Field>
						<Field label="Subtítulo">
							<TextArea
								value={data.differentiators.subtitle}
								onChange={(v) =>
									setData({
										...data,
										differentiators: {
											...data.differentiators,
											subtitle: v,
										},
									})
								}
							/>
						</Field>
						<div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mt-6">
							<h4 className="font-bold text-gray-900 mb-4">
								Seção do App
							</h4>
							<Field label="Título do App">
								<Input
									value={data.differentiators.app_title}
									onChange={(v) =>
										setData({
											...data,
											differentiators: {
												...data.differentiators,
												app_title: v,
											},
										})
									}
								/>
							</Field>
							<Field label="Texto do App">
								<TextArea
									value={data.differentiators.app_text}
									onChange={(v) =>
										setData({
											...data,
											differentiators: {
												...data.differentiators,
												app_text: v,
											},
										})
									}
								/>
							</Field>

							<h5 className="font-bold text-gray-700 mb-2 text-sm uppercase">
								Funcionalidades (Lista)
							</h5>
							<div className="space-y-4">
								{data.differentiators.app_features.map(
									(feat, idx) => (
										<div
											key={idx}
											className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded border border-gray-100 items-start"
										>
											<div className="flex-grow space-y-2 w-full">
												<div className="flex items-center gap-2">
													<CheckCircle2
														size={16}
														className="text-geplano-green"
													/>
													<Input
														value={feat.name}
														onChange={(v) => {
															const newFeats = [
																...data
																	.differentiators
																	.app_features,
															];
															newFeats[idx].name =
																v;
															setData({
																...data,
																differentiators:
																	{
																		...data.differentiators,
																		app_features:
																			newFeats,
																	},
															});
														}}
													/>
												</div>
												<div className="flex items-center gap-2">
													<ImagePicker
														label="Imagem da Tela"
														currentValue={
															feat.image
														}
														onImageSelected={(
															url
														) => {
															const newFeats = [
																...data
																	.differentiators
																	.app_features,
															];
															newFeats[
																idx
															].image = url;
															setData({
																...data,
																differentiators:
																	{
																		...data.differentiators,
																		app_features:
																			newFeats,
																	},
															});
														}}
													/>
												</div>
											</div>
											<DeleteButton
												onClick={() => {
													const newFeats =
														data.differentiators.app_features.filter(
															(_, i) => i !== idx
														);
													setData({
														...data,
														differentiators: {
															...data.differentiators,
															app_features:
																newFeats,
														},
													});
												}}
											/>
										</div>
									)
								)}
								<AddButton
									label="Adicionar Funcionalidade"
									onClick={() => {
										const newFeats = [
											...data.differentiators
												.app_features,
											{
												name: 'Nova Funcionalidade',
												image: 'https://picsum.photos/300/650',
											},
										];
										setData({
											...data,
											differentiators: {
												...data.differentiators,
												app_features: newFeats,
											},
										});
									}}
								/>
							</div>
						</div>
					</SectionCard>
				);

			case 'projects':
				return (
					<SectionCard title="Portfólio de Projetos" id="projects">
						<Field label="Título">
							<Input
								value={data.projects.title}
								onChange={(v) =>
									setData({
										...data,
										projects: {
											...data.projects,
											title: v,
										},
									})
								}
							/>
						</Field>
						<Field label="Subtítulo">
							<TextArea
								value={data.projects.subtitle}
								onChange={(v) =>
									setData({
										...data,
										projects: {
											...data.projects,
											subtitle: v,
										},
									})
								}
							/>
						</Field>

						<div className="mt-8">
							<div className="flex justify-between items-center mb-4">
								<h4 className="font-bold text-lg text-gray-800">
									Lista de Projetos
								</h4>
								<span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
									{data.projects.items.length} projetos
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
								{data.projects.items.map((project, idx) => (
									<div
										key={project.id}
										className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col group relative"
									>
										<div className="absolute top-2 right-2 z-10 bg-white rounded-lg shadow-sm">
											<DeleteButton
												onClick={() => {
													const newItems =
														data.projects.items.filter(
															(_, i) => i !== idx
														);
													setData({
														...data,
														projects: {
															...data.projects,
															items: newItems,
														},
													});
												}}
											/>
										</div>
										{/* Image Display */}
										<div className="h-48 bg-gray-100 relative overflow-hidden">
											<img
												src={project.image}
												className="w-full h-full object-cover"
												alt="Project"
											/>
										</div>

										<div className="p-4 flex-grow space-y-3">
											{/* Image Picker inside body - no longer squeezed in overlay */}
											<div className="mb-4 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300">
												<ImagePicker
													label="Imagem do Projeto"
													currentValue={project.image}
													onImageSelected={(url) => {
														const newItems = [
															...data.projects
																.items,
														];
														newItems[idx].image =
															url;
														setData({
															...data,
															projects: {
																...data.projects,
																items: newItems,
															},
														});
													}}
													compact // Compact mode but inside a proper container
												/>
											</div>

											<div className="flex items-center gap-2">
												<Eye className="text-gray-400 w-4 h-4 shrink-0" />
												<Input
													className="py-1 px-2 text-sm font-bold"
													value={project.title}
													onChange={(v) => {
														const newItems = [
															...data.projects
																.items,
														];
														newItems[idx].title = v;
														setData({
															...data,
															projects: {
																...data.projects,
																items: newItems,
															},
														});
													}}
												/>
											</div>
											<div className="flex items-center gap-2">
												<MapPin className="text-geplano-gold w-4 h-4 shrink-0" />
												<Input
													className="py-1 px-2 text-xs"
													value={project.location}
													onChange={(v) => {
														const newItems = [
															...data.projects
																.items,
														];
														newItems[idx].location =
															v;
														setData({
															...data,
															projects: {
																...data.projects,
																items: newItems,
															},
														});
													}}
												/>
											</div>
											<TextArea
												className="text-xs"
												rows={3}
												value={project.description}
												onChange={(v) => {
													const newItems = [
														...data.projects.items,
													];
													newItems[idx].description =
														v;
													setData({
														...data,
														projects: {
															...data.projects,
															items: newItems,
														},
													});
												}}
											/>
											<div className="flex items-center gap-2 border-t pt-2 border-gray-100">
												<Tag className="text-gray-400 w-3 h-3 shrink-0" />
												<input
													className="w-full text-xs text-gray-500 bg-transparent outline-none"
													placeholder="Categorias (sep. vírgula): industrial, residencial..."
													value={project.category.join(
														', '
													)}
													onChange={(e) => {
														const newItems = [
															...data.projects
																.items,
														];
														newItems[idx].category =
															e.target.value
																.split(',')
																.map((s) =>
																	s.trim()
																);
														setData({
															...data,
															projects: {
																...data.projects,
																items: newItems,
															},
														});
													}}
												/>
											</div>
										</div>
									</div>
								))}

								{/* Add Card */}
								<button
									onClick={() => {
										const newId =
											Math.max(
												...data.projects.items.map(
													(p) => p.id
												),
												0
											) + 1;
										const newItems = [
											...data.projects.items,
											{
												id: newId,
												title: 'Novo Projeto',
												location: 'Localização',
												description:
													'Descrição do projeto...',
												image: 'https://picsum.photos/800/600',
												category: ['residencial'],
											},
										];
										setData({
											...data,
											projects: {
												...data.projects,
												items: newItems,
											},
										});
									}}
									className="min-h-[300px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-geplano-green hover:border-geplano-green hover:bg-green-50 transition-all cursor-pointer group"
								>
									<div className="p-4 rounded-full bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform">
										<Plus size={32} />
									</div>
									<span className="font-bold">
										Adicionar Projeto
									</span>
								</button>
							</div>
						</div>
					</SectionCard>
				);

			case 'other_solutions':
				return (
					<SectionCard
						title="Outras Soluções Geplano"
						id="other_solutions"
					>
						<Field label="Título da Seção">
							<Input
								value={data.other_solutions.title}
								onChange={(v) =>
									setData({
										...data,
										other_solutions: {
											...data.other_solutions,
											title: v,
										},
									})
								}
							/>
						</Field>

						<h4 className="font-bold text-gray-700 mb-4 uppercase text-sm mt-6">
							Lista de Soluções
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{data.other_solutions.items.map((item, idx) => (
								<div
									key={idx}
									className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200 shadow-sm group hover:border-geplano-green transition-colors"
								>
									<div className="w-8 h-8 rounded-full bg-green-50 text-geplano-green flex items-center justify-center shrink-0">
										<ArrowRight size={14} />
									</div>
									<Input
										className="border-0 focus:ring-0 p-0 text-sm font-medium"
										value={item}
										onChange={(v) => {
											const newItems = [
												...data.other_solutions.items,
											];
											newItems[idx] = v;
											setData({
												...data,
												other_solutions: {
													...data.other_solutions,
													items: newItems,
												},
											});
										}}
									/>
									<div className="opacity-0 group-hover:opacity-100 transition-opacity">
										<DeleteButton
											onClick={() => {
												const newItems =
													data.other_solutions.items.filter(
														(_, i) => i !== idx
													);
												setData({
													...data,
													other_solutions: {
														...data.other_solutions,
														items: newItems,
													},
												});
											}}
										/>
									</div>
								</div>
							))}
							<button
								onClick={() => {
									const newItems = [
										...data.other_solutions.items,
										'Nova Solução',
									];
									setData({
										...data,
										other_solutions: {
											...data.other_solutions,
											items: newItems,
										},
									});
								}}
								className="flex items-center justify-center gap-2 p-3 rounded border-2 border-dashed border-gray-300 text-gray-400 font-bold hover:border-geplano-green hover:text-geplano-green hover:bg-green-50 transition-all"
							>
								<Plus size={18} /> Adicionar
							</button>
						</div>
					</SectionCard>
				);

			case 'contact':
				return (
					<SectionCard title="Informações de Contato" id="contact">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Field label="Telefone">
								<Input
									value={data.contact.phone}
									onChange={(v) =>
										setData({
											...data,
											contact: {
												...data.contact,
												phone: v,
											},
										})
									}
								/>
							</Field>
							<Field label="E-mail">
								<Input
									value={data.contact.email}
									onChange={(v) =>
										setData({
											...data,
											contact: {
												...data.contact,
												email: v,
											},
										})
									}
								/>
							</Field>
						</div>
						<Field label="Endereço">
							<Input
								value={data.contact.address}
								onChange={(v) =>
									setData({
										...data,
										contact: {
											...data.contact,
											address: v,
										},
									})
								}
							/>
						</Field>
						<div className="border-t border-gray-100 pt-6 mt-6">
							<h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">
								Formulário de Contato
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Field label="Título do Formulário">
									<Input
										value={data.contact.form_title}
										onChange={(v) =>
											setData({
												...data,
												contact: {
													...data.contact,
													form_title: v,
												},
											})
										}
									/>
								</Field>
								<Field label="Botão de Envio">
									<Input
										value={data.contact.form_button}
										onChange={(v) =>
											setData({
												...data,
												contact: {
													...data.contact,
													form_button: v,
												},
											})
										}
									/>
								</Field>
							</div>
						</div>
					</SectionCard>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden relative">
			{/* Mobile Sidebar Overlay */}
			{isSidebarOpen && isMobile && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
					onClick={() => setIsSidebarOpen(false)}
				></div>
			)}

			{/* Sidebar */}
			<aside
				className={`
            fixed lg:static inset-y-0 left-0 z-50
            bg-white border-r border-gray-200 
            flex flex-col shadow-2xl lg:shadow-none
            transform transition-all duration-300 ease-in-out
            ${
				isMobile
					? isSidebarOpen
						? 'translate-x-0 w-[280px]'
						: '-translate-x-full w-[280px]'
					: isSidebarOpen
					? 'lg:w-[280px]'
					: 'lg:w-20'
			}
        `}
			>
				{/* Sidebar Header */}
				<div
					className={`h-16 flex items-center ${
						!isMobile && !isSidebarOpen
							? 'justify-center px-0'
							: 'justify-between px-6'
					} border-b border-gray-100 bg-geplano-green text-white shrink-0 transition-all duration-300`}
				>
					{/* Logo / Title Logic */}
					{!isMobile && !isSidebarOpen ? (
						<span className="font-display font-black text-xl animate-fade-in-up">
							G
						</span>
					) : (
						<span className="font-display font-black text-lg tracking-widest uppercase whitespace-nowrap overflow-hidden">
							Geplano
							<span className="text-geplano-gold">CMS</span>
						</span>
					)}

					{/* Mobile Close Button */}
					{isMobile && (
						<button
							onClick={() => setIsSidebarOpen(false)}
							className="text-white/80 hover:text-white"
						>
							<X size={24} />
						</button>
					)}
				</div>

				{/* Navigation Items */}
				<nav className="flex-grow p-2 space-y-1 overflow-y-auto overflow-x-hidden">
					{menuItems.map((item) => (
						<button
							key={item.id}
							onClick={() => {
								setActiveSection(item.id as SectionKey);
								if (isMobile) setIsSidebarOpen(false);
							}}
							title={
								!isMobile && !isSidebarOpen ? item.label : ''
							}
							className={`
                        w-full flex items-center transition-all duration-200 group rounded-lg
                        ${
							!isMobile && !isSidebarOpen
								? 'justify-center px-2 py-3'
								: 'justify-start px-4 py-3'
						}
                        ${
							activeSection === item.id
								? 'bg-green-50 text-geplano-green font-bold shadow-sm'
								: 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
						}
                    `}
						>
							<div className="flex items-center gap-3">
								<span
									className={`transition-colors shrink-0 ${
										activeSection === item.id
											? 'text-geplano-gold'
											: 'group-hover:text-geplano-gold'
									}`}
								>
									{item.icon}
								</span>

								{/* Label - Hidden when collapsed on Desktop */}
								<span
									className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
										!isMobile && !isSidebarOpen
											? 'w-0 opacity-0 ml-0 hidden'
											: 'w-auto opacity-100 block'
									}`}
								>
									{item.label}
								</span>
							</div>
						</button>
					))}
				</nav>

				{/* Footer / Toggle Button Area (Desktop Only) */}
				{!isMobile && (
					<div className="p-3 border-t border-gray-100">
						<button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="w-full p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-geplano-green transition-colors flex items-center justify-center"
							title={
								isSidebarOpen
									? 'Recolher Menu'
									: 'Expandir Menu'
							}
						>
							{isSidebarOpen ? (
								<ChevronLeft size={20} />
							) : (
								<ChevronRight size={20} />
							)}
						</button>
					</div>
				)}
			</aside>

			{/* Main Content */}
			<main className="flex-grow flex flex-col h-full overflow-hidden w-full transition-all duration-300">
				{/* Top Header */}
				<header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 md:px-8 shadow-sm z-10 shrink-0">
					<div className="flex items-center gap-4">
						{/* Mobile Toggle Button (Hamburger) */}
						<button
							onClick={() => setIsSidebarOpen(true)}
							className="lg:hidden text-gray-500 hover:text-geplano-green p-2 -ml-2 rounded-lg active:bg-gray-100 transition-colors"
						>
							<Menu size={24} />
						</button>

						<h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">
							{
								menuItems.find((i) => i.id === activeSection)
									?.label
							}
						</h2>
					</div>

					<div className="flex items-center gap-2 md:gap-4">
						{/* User Info / Logout */}
						<div className="hidden md:flex items-center gap-2 mr-2">
							<span className="text-xs text-gray-400 font-mono">
								{user?.email}
							</span>
						</div>

						<a
							href="#/"
							target="_blank"
							className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-geplano-green transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
						>
							<Monitor size={18} /> Ver Site
						</a>

						<button
							onClick={handleLogout}
							className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
							title="Sair do Sistema"
						>
							<LogOut size={20} />
						</button>

						<div className="h-6 w-px bg-gray-200"></div>

						<button
							onClick={handleSave}
							className="flex items-center gap-2 bg-geplano-green hover:bg-geplano-lightGreen text-white px-4 md:px-6 py-2 rounded-lg font-bold uppercase text-xs md:text-sm tracking-wide shadow-md hover:shadow-lg transition-all transform active:scale-95"
						>
							<Save size={18} />
							<span className="hidden md:inline">
								{activeSection === 'json'
									? 'Salvar JSON'
									: 'Salvar'}
							</span>
						</button>
					</div>
				</header>

				{/* Scrollable Form Area */}
				<div className="flex-grow overflow-y-auto p-4 md:p-8 relative bg-gray-100">
					{/* Toast Message */}
					{message && (
						<div
							className={`fixed top-20 right-4 md:right-8 z-50 px-4 md:px-6 py-4 rounded-lg shadow-xl border flex items-center gap-3 animate-fade-in-up max-w-[90%] md:max-w-md ${
								message.type === 'error'
									? 'bg-red-50 border-red-200 text-red-800'
									: 'bg-green-50 border-green-200 text-green-800'
							}`}
						>
							{message.type === 'success' ? (
								<CheckCircle2
									size={20}
									className="text-green-600 shrink-0"
								/>
							) : null}
							<span className="font-bold text-sm md:text-base">
								{message.text}
							</span>
						</div>
					)}

					<div className="max-w-5xl mx-auto pb-20">
						{/* JSON EDITOR MODE */}
						{activeSection === 'json' && (
							<div className="flex flex-col h-full animate-fade-in-up">
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
									<Code
										className="text-blue-600 mt-1 shrink-0"
										size={20}
									/>
									<div>
										<h4 className="font-bold text-blue-900 text-sm">
											Modo Desenvolvedor
										</h4>
										<p className="text-xs text-blue-700 mt-1">
											Edite a estrutura bruta dos dados.
											Tenha cuidado com a sintaxe para não
											quebrar o site.
										</p>
									</div>
								</div>

								<div className="bg-gray-900 rounded-t-xl p-4 flex justify-between items-center">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500"></div>
										<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
										<div className="w-3 h-3 rounded-full bg-green-500"></div>
									</div>
									<span className="text-gray-400 text-xs font-mono">
										data.json
									</span>
								</div>
								<textarea
									className="w-full h-[600px] font-mono text-sm p-4 md:p-6 bg-gray-800 text-green-400 border-none focus:ring-0 outline-none leading-relaxed rounded-b-xl shadow-2xl resize-none"
									value={jsonText}
									onChange={(e) =>
										setJsonText(e.target.value)
									}
									spellCheck={false}
								/>
							</div>
						)}

						{/* VIEW ALL MODE */}
						{activeSection === 'all' && (
							<div className="space-y-6 animate-fade-in-up">
								<div className="mb-6">
									<h3 className="text-2xl font-bold text-gray-800 mb-2">
										Visão Geral
									</h3>
									<p className="text-gray-500">
										Gerencie todo o conteúdo do site em uma
										única tela.
									</p>
								</div>
								{menuItems.map((item) => {
									if (
										item.id === 'all' ||
										item.id === 'json' ||
										item.id === 'firebase_setup'
									)
										return null;
									return (
										<div key={item.id}>
											{renderSectionContent(
												item.id as SectionKey
											)}
										</div>
									);
								})}
							</div>
						)}

						{/* SINGLE SECTION MODE */}
						{activeSection !== 'json' &&
							activeSection !== 'all' && (
								<div className="animate-fade-in-up">
									{renderSectionContent(activeSection)}
								</div>
							)}
					</div>
				</div>
			</main>
		</div>
	);
};