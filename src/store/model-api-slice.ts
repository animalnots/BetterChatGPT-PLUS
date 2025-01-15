import { StoreSlice } from './store';

export interface ModelApiConfig {
  modelId: string;
  apiEndpoint: string;
  apiKey: string;
  apiVersion?: string;
}

export interface ModelApiSlice {
  modelApiConfigs: ModelApiConfig[];
  addModelApiConfig: (config: ModelApiConfig) => void;
  removeModelApiConfig: (modelId: string) => void;
  getModelApiConfig: (modelId: string) => ModelApiConfig | undefined;
}

export const createModelApiSlice: StoreSlice<ModelApiSlice> = (set, get) => ({
  modelApiConfigs: [],
  addModelApiConfig: (config) =>
    set((state) => ({
      modelApiConfigs: [
        ...state.modelApiConfigs.filter((c) => c.modelId !== config.modelId),
        config,
      ],
    })),
  removeModelApiConfig: (modelId) =>
    set((state) => ({
      modelApiConfigs: state.modelApiConfigs.filter((c) => c.modelId !== modelId),
    })),
  getModelApiConfig: (modelId) => {
    const state = get();
    return state.modelApiConfigs.find((c) => c.modelId === modelId);
  },
});
