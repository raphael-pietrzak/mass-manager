type FormatterFunction = (value: any, row?: any) => string

type FormatterConfig = {
	type: "boolean" | "enum" | "date" | "string"
	options?: { label: string; value: any }[]
	display?: FormatterFunction
}

type TabColumn = {
	key: string
	label: string
	endpoint: string
	columns?: Array<{ key: string; label: string }>
	formatters?: Record<string, FormatterFunction | FormatterConfig>
}

export const tabs: TabColumn[] = [
	{
		key: "donors",
		label: "Donateurs",
		endpoint: "http://localhost:3001/api/data/donors",
		columns: [
			{ key: "lastname", label: "Nom" },
			{ key: "firstname", label: "Prénom" },
			{ key: "address", label: "Adresse" },
			{ key: "city", label: "Ville" },
			{ key: "zip_code", label: "Code postal" },
			{ key: "phone", label: "Téléphone" },
			{ key: "email", label: "Email" },
		],
	},
	{
		key: "celebrants",
		label: "Prêtres",
		endpoint: "http://localhost:3001/api/data/celebrants",
		columns: [
			{ key: "title", label: "Titre" },
			{ key: "religious_name", label: "Nom religieux" },
			{ key: "civil_firstname", label: "Prénom civil" },
			{ key: "civil_lastname", label: "Nom civil" },
			{ key: "role", label: "Rôle" },
		],
	},
	{
		key: "masses",
		label: "Messes",
		endpoint: "http://localhost:3001/api/data/masses",
		columns: [
			{ key: "date", label: "Date" },
			{ key: "celebrant", label: "Célébrant" },
			{ key: "intention", label: "Intention" },
			{ key: "deceased", label: "Pour un défunt" },
			{ key: "status", label: "Statut" },
		],
		formatters: {
			date: {
				type: "date",
				display: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
			},
			status: {
				type: "enum",
				options: [
					{ label: "Planifiée", value: "planned" },
					{ label: "Confirmée", value: "confirmed" },
					{ label: "Célébrée", value: "celebrated" },
					{ label: "Annulée", value: "cancelled" },
				],
			},
			deceased: {
				type: "boolean",
				options: [
					{ label: "Oui", value: 1 },
					{ label: "Non", value: 0 },
				],
			},
	  celebrant: {
				type: "string",
				display: (_value: any, row: any) => {
					return `${row.celebrant_title} ${row.celebrant_religious_name}`.trim()
				},
			},
		},
	},
	{
		key: "special-days",
		label: "Jours spéciaux",
		endpoint: "http://localhost:3001/api/data/special-days",
		columns: [
			{ key: "date", label: "Date" },
			{ key: "description", label: "description" },
			{ key: "number_of_masses", label: "Nombre de messes" },
			{ key: "is_recurrent", label: "Récurrent" },
		],
		formatters: {
			date: {
				type: "date",
				display: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
			},
			is_recurrent: {
				type: "boolean",
				options: [
					{ label: "Oui", value: 1 },
					{ label: "Non", value: 0 },
				],
			},
		},
	},
	{
		key: "intention",
		label: "Intentions",
		endpoint: "http://localhost:3001/api/data/intentions",
		columns: [
			{ key: "donor", label: "Donateur" },
			{ key: "intention_text", label: "Intention" },
			{ key: "amount", label: "Montant" },
			{ key: "deceased", label: "Pour un défunt" },
			{ key: "payment_method", label: "Méthode de paiement" },
		],
		formatters: {
			donor: {
				type: "string",
				display: (_value: any, row: any) => {
					const firstname = row.donor_firstname || ""
					const lastname = row.donor_lastname || ""
					return `${firstname} ${lastname}`.trim() || "Donateur inconnu"
				},
			},
			deceased: {
				type: "boolean",
				options: [
					{ label: "Oui", value: 1 },
					{ label: "Non", value: 0 },
				],
				display: (value: number) => (value ? "Oui" : "Non"),
			},
			payment_method: {
				type: "enum",
				options: [
					{ label: "Espèces", value: "cash" },
					{ label: "Chèque", value: "cheque" },
					{ label: "Virement", value: "transfer" },
				],
			},
		},
	},
	{
		key: "recurrences",
		label: "Récurrences",
		endpoint: "http://localhost:3001/api/data/recurrences",
		columns: [
			{ key: "type", label: "Type" },
			{ key: "start_date", label: "Date de début" },
			{ key: "end_type", label: "Type de fin" },
			{ key: "occurrences", label: "Occurrences" },
			{ key: "end_date", label: "Date de fin" },
			{ key: "position", label: "Position" },
			{ key: "weekday", label: "Jour de la semaine" },
		],
		formatters: {
			type: {
				type: "enum",
				options: [
					{ label: "Quotidien", value: "daily" },
					{ label: "Hebdomadaire", value: "weekly" },
					{ label: "Mensuel", value: "monthly" },
					{ label: "Position relative", value: "relative_position" },
					{ label: "Annuel", value: "yearly" },
				],
			},
			start_date: {
				type: "date",
				display: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
			},
			end_date: {
				type: "date",
				display: (value: string) => value ? new Date(value).toLocaleDateString("fr-FR") : "",
			},
			end_type: {
				type: "enum",
				options: [
					{ label: "Nombre d'occurrences", value: "occurrences" },
					{ label: "Date de fin", value: "date" },
				],
			},
			position: {
				type: "enum",
				options: [
					{ label: "Premier", value: "first" },
					{ label: "Deuxième", value: "second" },
					{ label: "Troisième", value: "third" },
					{ label: "Quatrième", value: "fourth" },
					{ label: "Dernier", value: "last" },
				],
			},
			weekday: {
				type: "enum",
				options: [
					{ label: "Lundi", value: "monday" },
					{ label: "Mardi", value: "tuesday" },
					{ label: "Mercredi", value: "wednesday" },
					{ label: "Jeudi", value: "thursday" },
					{ label: "Vendredi", value: "friday" },
					{ label: "Samedi", value: "saturday" },
					{ label: "Dimanche", value: "sunday" },
				],
			},
		},
	},
]
