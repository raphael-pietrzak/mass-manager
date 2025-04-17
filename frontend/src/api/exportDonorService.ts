import axios from 'axios';
import { API_BASE_URL } from '.';

const EXPORT_URL = `${API_BASE_URL}/api/export/donors`;

const downloadFile = async (format: 'excel' | 'pdf') => {
  const response = await axios.get(`${EXPORT_URL}/${format}`, { responseType: 'blob' });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename = `Liste des donateurs.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportDonorService = {
  exportToExcel: () => downloadFile('excel'),
  exportToPdf: () => downloadFile('pdf'),
};