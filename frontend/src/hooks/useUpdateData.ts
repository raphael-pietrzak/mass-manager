import axios from "axios"
import { tabs } from "../features/database/tabs"

export const useUpdateData = (activeTab: string, setData: React.Dispatch<React.SetStateAction<any[]>>) => {
	const handleUpdate = async (updatedData: any) => {
		const selectedTab = tabs.find((tab) => tab.key === activeTab)
		if (!selectedTab) return
		try {
			// Construction de l'URL PUT
			let putEndpoint = selectedTab.endpoint
			// Cas spécifique : Masses => enlever "/all"
			if (activeTab === "masses" && putEndpoint.endsWith("/all")) {
				putEndpoint = putEndpoint.slice(0, -4) // enlève '/all'
			}
			await axios.put(`${putEndpoint}/${updatedData.id}`, updatedData)
			setData((prevData) => prevData.map((item: any) => (item.id === updatedData.id ? updatedData : item)))
		} catch (err) {
			console.error("Update failed", err)
		}
	}
	return { handleUpdate }
}