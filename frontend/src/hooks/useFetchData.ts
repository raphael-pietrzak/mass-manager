import { useState, useEffect } from "react"
import axios from "axios"
import { tabs } from "../features/database/tabs"

export const useFetchData = (activeTab: string) => {
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			setError(null)
			try {
				const selectedTab = tabs.find((tab) => tab.key === activeTab)
				if (selectedTab) {
					const response = await axios.get(selectedTab.endpoint)
					if (!Array.isArray(response.data)) {
						setData(response.data.data)
					} else {
						setData(response.data)
					}
				}
			} catch (err) {
				setError("Failed to fetch data")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [activeTab])

	return { data, loading, error, setData }
}

export default useFetchData
