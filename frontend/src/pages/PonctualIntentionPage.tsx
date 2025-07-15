import { useEffect, useState } from "react";
import { PonctualIntentionList } from "../features/intentions/ponctual/views/PonctualIntentionList";
import { Intention, IntentionSubmission, intentionService } from "../api/intentionService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { exportService } from "../api/exportService";
import PonctualIntentionFilterBar from "../features/intentions/ponctual/PonctualIntentionFilterBar";
import { PonctualIntentionModal } from "../features/intentions/ponctual/PonctualIntentionModal";

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
	const [selectedIntentionIds, setSelectedIntentionIds] = useState<string[]>([]);
	const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

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

	const handleExport = async (format: 'excel' | 'pdf' | 'word') => {
		if (selectedIntentionIds.length === 0) {
			setError('Veuillez sélectionner au moins une intention à exporter.');
			return;
		}
		try {
			switch (format) {
				case 'excel':
					await exportService.exportIntentionToExcel(selectedIntentionIds);
					break;
				case 'pdf':
					await exportService.exportIntentionToPdf(selectedIntentionIds);
					break;
				case 'word':
					await exportService.exportIntentionToWord(selectedIntentionIds);
					break;
				default:
					throw new Error('Format inconnu');
			}
			// Export réussi → on ouvre la modale de confirmation pour supprimer
			setShowDeleteConfirmDialog(true);
		} catch (error) {
			console.error("Erreur lors de l'exportation :", error);
			setError("Erreur lors de l'exportation.");
		}
	};


	const handleConfirmExport = async () => {
		try {
			for (const id of selectedIntentionIds) {
				await intentionService.deleteMass(id);
			}
			await fetchIntentions();
			setSelectedIntentionIds([]);
		} catch (error) {
			setError("Erreur lors de la suppression.");
		} finally {
			setShowDeleteConfirmDialog(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100">
			<main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-bold mb-6">Liste des intentions de messe ponctuelles</h1>
				<PonctualIntentionFilterBar 
					onExport={handleExport}
					selectedCount={selectedIntentionIds.length}
					onDistribute={}
				/>
				
				<div className="mt-6 mb-6">
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
									Export Réussi !
									Voulez-vous supprimer les intentions exportées ?
									Cette action les supprimera définitivement de la base.
								</span>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setShowDeleteConfirmDialog(false)}>Annuler</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleConfirmExport}
							>
								Confirmer la suppression
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<PonctualIntentionList
					intentions={intentions}
					onSelectionChange={setSelectedIntentionIds}
					onRefresh={fetchIntentions}
					loading={loading}
				/>
				<PonctualIntentionModal
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

export default IntentionPage;
