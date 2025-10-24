import { useEffect, useState } from "react";
import { PonctualIntentionList } from "../features/intentions/ponctual/views/PonctualIntentionList";
import { Intention, IntentionSubmission, intentionService } from "../api/intentionService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { exportService } from "../api/exportService";
import PonctualIntentionFilterBar from "../features/intentions/ponctual/PonctualIntentionFilterBar";
import { PonctualIntentionModal } from "../features/intentions/ponctual/PonctualIntentionModal";

const PonctualIntentionPage: React.FC = () => {
	const [isIntentionModalOpen, setIsIntentionModalOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null)
	const [loading, setLoading] = useState(true);
	const [intentions, setIntentions] = useState<Intention[]>([]);
	const [status, setStatus] = useState<string>("pending");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				setError(null);
			}, 5000);

			return () => clearTimeout(timer);
		}
		if (success) {
			const timer = setTimeout(() => {
				setSuccess(null);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [error, success]);
	const [selectedIntentionIds, setSelectedIntentionIds] = useState<string[]>([]);
	const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

	const fetchIntentions = async () => {
		try {
			setLoading(true);
			const response = await intentionService.getPonctualIntentions(status, page);
			setIntentions(response.data);
			setTotalPages(response.pagination.totalPages);
		} catch (error) {
			console.error("Erreur lors de la récupération des intentions:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchIntentions();
	}, [status, page]);

	const handleAddIntention = () => {
		setIsIntentionModalOpen(true);
	};

	const handleSaveIntention = async (newIntention: IntentionSubmission) => {
		try {
			if (newIntention.id) {
				await intentionService.updateMass(newIntention.id, newIntention);
				setSuccess("Intention mise à jour avec succès.");
			} else {
				await intentionService.createMass(newIntention);
				if (newIntention.date_type === "imperative" || newIntention.date_type === "desired") setSuccess("Intention créée avec succès et messe(s) attribuée(s)");
				else setSuccess("Intention créée avec succès.");
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

	const handleDistributeIntentions = async () => {
		// Répartition des messes pour chaque intention séléectionnée
		try {
			for (const id of selectedIntentionIds) {
				await intentionService.assignIntentions(Number(id));
			}
			await fetchIntentions();
			setSelectedIntentionIds([]);
			setSuccess("Répartition des messes effectuée avec succès");
		} catch (error: any) {
			setError(error.message)
		}
	}

	const handleStatusChange = async (status: string) => {
		setStatus(status);
		try {
			setLoading(true);
			const data = await intentionService.getPonctualIntentions(status, page);
			setIntentions(data.data);
		} catch (error) {
			console.error("Erreur lors du changement de statut :", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100">
			<main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-bold mb-6 flex items-center gap-4">
					<span>Liste des intentions de messe ponctuelles</span>
					<select
						value={status}
						className="px-3 py-2 text-sm font-medium rounded-md shadow-sm bg-card border border-border text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
						onChange={(e) => handleStatusChange(e.target.value)}
					>
						<option value="pending">En attente</option>
						<option value="in_progress">Programmées</option>
					</select>
				</h1>
				{status === "pending" && (
					<PonctualIntentionFilterBar
						onExport={handleExport}
						selectedCount={selectedIntentionIds.length}
						onDistribute={handleDistributeIntentions}
					/>
				)}

				<div className="mt-6 mb-6">
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
							{error}
						</div>
					)}
				</div>
				<div className="mt-6 mb-6">
					{success && (
						<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
							{success}
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
					status={status}
				/>

				{!loading && totalPages > 0 && intentions.length > 0 && (
					<div className="flex justify-center items-center mt-6 gap-4">
						<button
							onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
							disabled={page === 1}
							className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-200"
						>
							← Précédent
						</button>

						<span className="text-sm text-gray-600">
							Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
						</span>

						<button
							onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
							disabled={page === totalPages}
							className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-200"
						>
							Suivant →
						</button>
					</div>
				)}

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

export default PonctualIntentionPage;
