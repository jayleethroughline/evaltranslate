import { Dataset } from '@/types';
import { storageManager } from '@/lib/storage/LocalStorageManager';

export class DatasetService {
  async uploadDataset(file: File): Promise<Dataset> {
    const text = await file.text();
    const rows = this.parseCSV(text);

    if (rows.length === 0) {
      throw new Error('CSV file is empty');
    }

    const columns = this.detectColumns(rows);
    const id = `dataset-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const dataset: Dataset = {
      id,
      name: file.name.replace('.csv', ''),
      columns,
      data: rows,
      metadata: {
        rowCount: rows.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceType: 'upload'
      }
    };

    storageManager.saveDataset(dataset);
    return dataset;
  }

  getDataset(id: string): Dataset | null {
    return storageManager.getDataset(id);
  }

  getAllDatasets(): Dataset[] {
    return storageManager.getAllDatasets();
  }

  deleteDataset(id: string): void {
    storageManager.deleteDataset(id);
  }

  exportToCSV(dataset: Dataset): Blob {
    if (dataset.data.length === 0) {
      throw new Error('Dataset is empty');
    }

    // Get all column names
    const columnNames = dataset.columns.map(col => col.name);

    // Create CSV header
    const header = columnNames.map(name => this.escapeCSVValue(name)).join(',');

    // Create CSV rows
    const rows = dataset.data.map(row => {
      return columnNames.map(colName => {
        const value = row[colName];
        return this.escapeCSVValue(value != null ? String(value) : '');
      }).join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private parseCSV(text: string): any[] {
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return [];
    }

    const headers = this.parseCSVLine(lines[0]);
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};

      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }

      rows.push(row);
    }

    return rows;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());

    return result;
  }

  private detectColumns(data: any[]): Dataset['columns'] {
    if (data.length === 0) {
      return [];
    }

    const firstRow = data[0];
    const columnNames = Object.keys(firstRow);

    return columnNames.map(name => {
      const lowerName = name.toLowerCase();

      // Auto-detect column type
      if (lowerName === 'prompt' || lowerName.includes('prompt')) {
        return { name, type: 'prompt' as const };
      } else if (lowerName === 'context' || lowerName.includes('context')) {
        return { name, type: 'context' as const };
      } else if (lowerName === 'completion' || lowerName.includes('completion')) {
        return { name, type: 'completion' as const };
      } else {
        return { name, type: 'text' as const };
      }
    });
  }

  private escapeCSVValue(value: string): string {
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

export const datasetService = new DatasetService();
