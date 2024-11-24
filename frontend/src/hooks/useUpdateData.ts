
import axios from 'axios';
import { tabs } from '../api/tabs';

export const useUpdateData = (activeTab: string, setData: React.Dispatch<React.SetStateAction<any[]>>) => {
  const handleUpdate = async (updatedData: any) => {
    const selectedTab = tabs.find(tab => tab.key === activeTab);
    if (!selectedTab) return;

    try {
      await axios.put(`${selectedTab.endpoint}/${updatedData.id}`, updatedData);
      setData(prevData => prevData.map((item: any) => item.id === updatedData.id ? updatedData : item));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  return { handleUpdate };
};