

import FormWizard  from '../components/forms/formWizard';

export const Intention = () => {
    return (
        <div className="w-full h-full bg-gray-100 py-8">
            <div className="max-w-3xl mx-auto flex flex-col items-center">
                <h1 className="text-3xl font-bold mb-8">Create a new intention</h1>
                <FormWizard />
            </div>
        </div>
    );
};