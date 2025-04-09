import axios from 'axios';
import { API_BASE_URL } from '.';

const EXPORT_URL = `${API_BASE_URL}/api/export/masses`;

export const exportService = {
  exportToWord: async () => {
    const response = await axios.get(`${EXPORT_URL}/word`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'masses.docx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  exportToExcel: async () => {
    const response = await axios.get(`${EXPORT_URL}/excel`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'masses.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  exportToPdf: async () => {
    const response = await axios.get(`${EXPORT_URL}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'masses.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
