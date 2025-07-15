import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Intention } from '../../../api/intentionService';
import { Donor, donorsService } from '../../../api/donorService';
import { DropdownSearch } from '../../../components/DropdownSearch';
import { AlertTriangle } from 'lucide-react';
import { AlertDescription } from '../../../components/ui/alert';

interface DonorFormProps {
  formData: Partial<Intention>;
  updateFormData: (data: Partial<Intention>) => void;
  prevStep: () => void;
  onValidate: () => void;
}

const DonorForm: React.FC<DonorFormProps> = ({
  formData,
  updateFormData,
  prevStep,
  onValidate
}) => {

  const [donors, setDonors] = useState<Donor[]>([]);
  const donorOptions = donors.filter((donor) => donor.email).map((donor) => ({
    value: donor.id.toString(),
    label: `${donor.email}`
  }));
  const UNASSIGNED_VALUE = "unassigned";
  const [selectedDonor, setSelectedDonor] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<{ firstname?: string; lastname?: string }>({});

  const handleSelectDonor = (value: string) => {
    setSelectedDonor(value);
    const existingDonor = donors.find((donor) => donor.id.toString() === value);
    if (value === UNASSIGNED_VALUE || value === '') {
      updateFormData({
        donor_firstname: '',
        donor_lastname: '',
        donor_email: '',
        donor_phone: '',
        donor_address: '',
        donor_city: '',
        donor_postal_code: ''
      });
      return;
    }
    if (existingDonor) {
      updateFormData({
        donor_firstname: existingDonor.firstname,
        donor_lastname: existingDonor.lastname,
        donor_email: existingDonor.email,
        donor_phone: existingDonor.phone,
        donor_address: existingDonor.address,
        donor_city: existingDonor.city,
        donor_postal_code: existingDonor.zip_code
      });
    } else {
      // Saisie libre : on garde l'email et on vide le reste
      updateFormData({
        donor_firstname: '',
        donor_lastname: '',
        donor_email: value,
        donor_phone: '',
        donor_address: '',
        donor_city: '',
        donor_postal_code: ''
      });
    }
  };


  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const data = await donorsService.getDonors();
        setDonors(data); // Mettre à jour l'état avec les données récupérées
      } catch (error) {
        console.error("Erreur lors du chargement des donateurs:", error);
      }
    };

    fetchDonors(); // Appel de la fonction pour récupérer les données
  }, []);

  const handleValidate = () => {
    const newErrors: { firstname?: string; lastname?: string } = {};
    if (!formData.donor_firstname || formData.donor_firstname.trim() === "") {
      newErrors.firstname = "Le prénom est requis";
    }
    if (!formData.donor_lastname || formData.donor_lastname.trim() === "") {
      newErrors.lastname = "Le nom est requis";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onValidate();
  };

  return (
    <div className="flex flex-col flex-1 h-[550px]">
      <div className="flex-grow space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <DropdownSearch
            options={donorOptions}
            value={selectedDonor}
            onChange={handleSelectDonor}
            placeholder="Sélectionner un donateur ou ajouter un nouveau"
            inlineSearch={true}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">Prénom</Label>
            <Input
              id="firstname"
              placeholder="Prénom"
              value={formData.donor_firstname || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ donor_firstname: e.target.value })}
            />
            {errors.firstname && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.firstname}</AlertDescription>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Nom</Label>
            <Input
              id="last_name"
              placeholder="Nom"
              value={formData.donor_lastname || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ donor_lastname: e.target.value })}
            />
            {errors.lastname && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.lastname}</AlertDescription>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Numéro de téléphone"
            value={formData.donor_phone || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ donor_phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            placeholder="Adresse"
            value={formData.donor_address || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ donor_address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postal_code">Code postal</Label>
            <Input
              id="postal_code"
              placeholder="Code postal"
              value={formData.donor_postal_code || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ donor_postal_code: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              placeholder="Ville"
              value={formData.donor_city || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ donor_city: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="wants_celebration_date"
            checked={formData.wants_celebration_date}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              updateFormData({ wants_celebration_date: checked as boolean })
            }
          />
          <Label htmlFor="wants_celebration_date">
            Souhaite recevoir la date de célébration
          </Label>
        </div>
      </div>

      <div className="pt-6 flex justify-between space-x-4">
        <Button variant="outline" type="button" onClick={prevStep}>
          Précédent
        </Button>
        <Button type="button" onClick={handleValidate}>
          Finaliser
        </Button>
      </div>
    </div>
  );
};

export default DonorForm;