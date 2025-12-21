'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SiteData } from '../lib/types';
import { Section } from './Section';
import { Reveal } from './Reveal';

interface ProjectsProps {
	data: SiteData['projects'];
}

export const Projects: React.FC<ProjectsProps> = ({ data }) => {
	const [filter, setFilter] = useState('Todos');

	const filteredItems =
		filter === 'Todos'
			? data.items
			: data.items.filter((item) => {
					const normalizedFilter = filter
						.toLowerCase()
						.replace(/\s+/g, '-');
					return item.category.includes(normalizedFilter);
			  });

	return (
		<Section id="projetos" className="bg-gray-50">
			<Reveal className="text-center mb-12">
				<h2 className="text-3xl md:text-4xl font-display font-black text-gray-900 uppercase mb-4 tracking-tight">
					{data.title}
				</h2>
				<p className="max-w-3xl mx-auto text-lg text-gray-600">
					{data.subtitle}
				</p>

				{/* Filter Buttons */}
				<div className="flex flex-wrap justify-center gap-3 mt-10">
					{data.filters.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold uppercase transition-all duration-300 ${
								filter === f
									? 'bg-geplano-green text-white shadow-lg transform scale-105 ring-2 ring-offset-2 ring-geplano-green'
									: 'bg-white text-geplano-green border border-geplano-green hover:bg-geplano-green hover:text-white'
							}`}
						>
							{f}
						</button>
					))}
				</div>
			</Reveal>

			{/* Grid */}
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{filteredItems.map((project) => (
					<Reveal key={project.id} className="h-full">
						<div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col group border border-gray-100 hover:border-geplano-gold/20 hover:-translate-y-2">
							<div className="relative overflow-hidden h-64">
								{/* Use next/image for external/HTTP images to enable optimization.
									Fallback to <img> for data URLs (base64) to avoid issues with the optimizer. */}
								{project.image &&
								project.image.startsWith('data:') ? (
									<img
										src={project.image}
										alt={project.title}
										className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
									/>
								) : (
									<Image
										src={project.image || ''}
										alt={project.title}
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										className="object-cover transition-transform duration-700 group-hover:scale-110"
									/>
								)}
								<div className="absolute inset-0 bg-geplano-green/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
									<span className="text-white font-bold uppercase tracking-widest border-2 border-white px-6 py-2 hover:bg-white hover:text-geplano-green transition-colors">
										Ver Detalhes
									</span>
								</div>
							</div>
							<div className="p-8 grow flex flex-col">
								<h3 className="text-xl font-bold text-gray-900 group-hover:text-geplano-green transition-colors mb-2 uppercase">
									{project.title}
								</h3>
								<p className="text-xs font-bold text-geplano-gold uppercase tracking-wider mb-4 border-b border-gray-100 pb-4">
									{project.location}
								</p>
								<p className="text-gray-600 text-sm leading-relaxed">
									{project.description}
								</p>
							</div>
						</div>
					</Reveal>
				))}
			</div>
		</Section>
	);
};
