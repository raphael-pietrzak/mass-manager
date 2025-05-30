import axios from 'axios';
import { API_BASE_URL } from '.';

const EXPORT_URL = `${API_BASE_URL}/api/export/masses`;

export const exportService = {

  exportToExcel: async (startDate?: Date | null, endDate?: Date | null) => {
    let url = `${EXPORT_URL}/excel`;
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate.toISOString()}`;
      if (startDate && endDate) url += '&';
      if (endDate) url += `endDate=${endDate.toISOString()}`;
    }
    const response = await axios.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', 'Intentions de messes.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  exportToPdf: async (startDate?: Date | null, endDate?: Date | null) => {
    let url = `${EXPORT_URL}/pdf`;
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate.toISOString()}`;
      if (startDate && endDate) url += '&';
      if (endDate) url += `endDate=${endDate.toISOString()}`;
    }
    const response = await axios.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', 'Intentions de messes.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportToWord: async (startDate?: Date | null, endDate?: Date | null) => {
    let url = `${EXPORT_URL}/word`;
    if (startDate || endDate) {
      url += '?';
      if (startDate) url += `startDate=${startDate.toISOString()}`;
      if (startDate && endDate) url += '&';
      if (endDate) url += `endDate=${endDate.toISOString()}`;
    }
    const response = await axios.get(url, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', 'Intentions de messes.docx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
