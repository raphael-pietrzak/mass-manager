import { useEffect, useState } from "react";
import { IntentionList } from "../features/intentions/views/IntentionList";
import { IntentionModal } from "../features/intentions/IntentionModal";
import { Intention, IntentionSubmission, intentionService } from "../api/intentionService";
import { useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { exportService } from "../api/exportService";

const IntentionPage: React.FC = () => {
	const [isIntentionModalOpen, setIsIntentionModalOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [intentions, setIntentions] = useState<Intention[]>([]);
	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				setError(null);
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [error]);
	const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
	const exportMenuRef = useRef<HTMLDivElement>(null);
	const [selectedIntentionIds, setSelectedIntentionIds] = useState<string[]>([]);
	const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
	const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'word' | null>(null);

	const fetchIntentions = async () => {
		try {
			setLoading(true);
			const data = await intentionService.getPonctualIntentions();
			setIntentions(data);
		} catch (error) {
			console.error('Erreur lors de la récupération des intentions:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchIntentions();
	}, []);

	const handleAddIntention = () => {
		setIsIntentionModalOpen(true);
	};

	const handleSaveIntention = async (newIntention: IntentionSubmission) => {
		try {
			if (newIntention.id) {
				await intentionService.updateMass(newIntention.id, newIntention);
			} else {
				await intentionService.createMass(newIntention);
			}
			await fetchIntentions();
			setIsIntentionModalOpen(false);
		} catch (err) {
			setError('Erreur lors de la sauvegarde de l\'intention');
		}
	};

	const onExport = (format: 'excel' | 'pdf' | 'word') => {
		if (selectedIntentionIds.length === 0) {
			setError('Veuillez sélectionner au moins une intention à exporter.');
			return;
		}
		setExportFormat(format);
		setShowDeleteConfirmDialog(true);
	};

	const handleConfirmExport = async (format: 'excel' | 'pdf' | 'word') => {
		try {
			switch (format) {
				case 'excel':
					await exportService.exportIntentionToExcel(selectedIntentionIds);
					break;
				case 'pdf':
					//await exportService.generateIntentionsPdf(selectedIntentionIds);
					break;
				case 'word':
					//await exportService.generateIntentionWord(selectedIntentionIds);
					break;
				default:
					throw new Error('Format inconnu');
			}
			for (const id of selectedIntentionIds) {
				await intentionService.deleteMass(id);
			}
			await fetchIntentions();
			setSelectedIntentionIds([]);
			setShowDeleteConfirmDialog(false);
		} catch (error) {
			setError('Erreur lors de l’exportation.');
		}
	}

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
				setIsExportMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [exportMenuRef]);

	return (
		<div className="min-h-screen bg-gray-100">
			<main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold mb-6">Liste des intentions de messe ponctuelles</h1>
					<div>
						{onExport && (
							<div className="relative" ref={exportMenuRef}>
								<button
									onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
									className="transition-colors duration-200 px-3 py-2 text-sm font-medium bg-card border border-border 
                           rounded-md shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30 
                           flex items-center gap-2"
								>
									<ExportIcon className="h-4 w-4" />
									<span>Exporter pour redonner</span>
									<ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 
                                           ${isExportMenuOpen ? 'rotate-180' : ''}`} />
								</button>

								{isExportMenuOpen && (
									<div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
										<div className="py-1.5">
											<button
												className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
												onClick={() => { onExport('excel'); setIsExportMenuOpen(false); }}
											>
												<span className="w-3 h-3 bg-green-600 rounded-sm mr-3"></span>
												<span className="font-medium">Format Excel</span>
											</button>
											<button
												className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
												onClick={() => { onExport('pdf'); setIsExportMenuOpen(false); }}
											>
												<span className="w-3 h-3 bg-red-600 rounded-sm mr-3"></span>
												<span className="font-medium">Format PDF</span>
											</button>
											<button
												className="w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors duration-150 flex items-center"
												onClick={() => { onExport('word'); setIsExportMenuOpen(false); }}
											>
												<span className="w-3 h-3 bg-blue-600 rounded-sm mr-3"></span>
												<span className="font-medium">Format Word</span>
											</button>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="mb-8">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
							{error}
						</div>
					)}
				</div>

				{/* Confirmation de suppression */}
				<AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
							<AlertDialogDescription>
								<span className="text-gray-800 text-lg">
									Êtes-vous sûr de vouloir exporter toutes les intentions sélectionnées,
									cette action supprimera définitivement ces intentions et les messes associées ?
								</span>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setShowDeleteConfirmDialog(false)}>Annuler</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									if (exportFormat) {
										handleConfirmExport(exportFormat);
										setShowDeleteConfirmDialog(false);
										setExportFormat(null); // reset le format après usage
									}
								}}
							>
								Confirmer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<IntentionList
					intentions={intentions}
					onSelectionChange={setSelectedIntentionIds}
					onRefresh={fetchIntentions}
					loading={loading}
				/>
				<IntentionModal
					intention={null}
					isOpen={isIntentionModalOpen}
					onClose={() => setIsIntentionModalOpen(false)}
					onSave={handleSaveIntention}
				/>

				{!isIntentionModalOpen && (
					<button
						onClick={handleAddIntention}
						className="fixed bottom-6 right-6 p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 z-50"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
					</button>
				)}
			</main>
		</div>
	);

}

const ExportIcon = ({ className }: { className?: string }) => (
	<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none"
		stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
		<polyline points="7 10 12 15 17 10"></polyline>
		<line x1="12" y1="15" x2="12" y2="3"></line>
	</svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
	<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none"
		stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<polyline points="6 9 12 15 18 9"></polyline>
	</svg>
);

export default IntentionPage;
