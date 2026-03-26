import { create } from 'zustand';
import { TrendsViewModel } from './TrendsPresenter';

interface TrendsState extends TrendsViewModel {
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setViewModel: (viewModel: TrendsViewModel) => void;
}

export const useTrendsPresenter = create<TrendsState>((set) => ({
  trends: [],
  isLoading: false,
  error: null,
  
  setViewModel: (viewModel) => set({ ...viewModel }),
}));
