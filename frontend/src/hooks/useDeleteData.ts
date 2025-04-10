
import axios from 'axios';
import { tabs } from '../features/database/tabs';

export const useDeleteData = (activeTab: string, setData: React.Dispatch<React.SetStateAction<any[]>>) => {
  const handleDelete = async (id: number) => {
    const selectedTab = tabs.find(tab => tab.key === activeTab);
    if (!selectedTab) return;

    try {
      await axios.delete(`${selectedTab.endpoint}/${id}`);
      setData(prevData => prevData.filter((item: any) => item.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return { handleDelete };
};