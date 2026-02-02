import { Dataset, TranslationJob } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

export class LocalStorageManager {
  // Dataset operations
  saveDataset(dataset: Dataset): void {
    const datasets = this.getAllDatasets();
    const existingIndex = datasets.findIndex(d => d.id === dataset.id);

    if (existingIndex >= 0) {
      datasets[existingIndex] = dataset;
    } else {
      datasets.push(dataset);
    }

    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
  }

  getDataset(id: string): Dataset | null {
    const datasets = this.getAllDatasets();
    return datasets.find(d => d.id === id) || null;
  }

  getAllDatasets(): Dataset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DATASETS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading datasets:', error);
      return [];
    }
  }

  deleteDataset(id: string): void {
    const datasets = this.getAllDatasets();
    const filtered = datasets.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(filtered));
  }

  // Job operations
  saveJob(job: TranslationJob): void {
    const jobs = this.getAllJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);

    if (existingIndex >= 0) {
      jobs[existingIndex] = job;
    } else {
      jobs.push(job);
    }

    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }

  getJob(id: string): TranslationJob | null {
    const jobs = this.getAllJobs();
    return jobs.find(j => j.id === id) || null;
  }

  getAllJobs(): TranslationJob[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOBS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading jobs:', error);
      return [];
    }
  }

  updateJob(id: string, updates: Partial<TranslationJob>): void {
    const job = this.getJob(id);
    if (job) {
      const updatedJob = { ...job, ...updates, updatedAt: new Date().toISOString() };
      this.saveJob(updatedJob);
    }
  }

  deleteJob(id: string): void {
    const jobs = this.getAllJobs();
    const filtered = jobs.filter(j => j.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
  }

  // API Key operations
  saveApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  }

  getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  }
}

export const storageManager = new LocalStorageManager();
