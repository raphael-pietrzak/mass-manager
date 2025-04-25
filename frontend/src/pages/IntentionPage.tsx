import { useState } from "react";
import { IntentionList } from "../features/intentions/views/IntentionList";
import { IntentionModal } from "../features/calendar/IntentionModal";
import { IntentionSubmission, intentionService } from "../api/intentionService";

const IntentionPage: React.FC = () => {
    const [isIntentionModalOpen, setIsIntentionModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setIsIntentionModalOpen(false);
            // Vous pourriez ajouter ici une fonction pour rafraîchir la liste des intentions
        } catch (err) {
            setError('Erreur lors de la sauvegarde de l\'intention');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <IntentionList />

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

                {error && (
                    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
                        {error}
                    </div>
                )}
            </main>
        </div>
    );
}

export default IntentionPage;
