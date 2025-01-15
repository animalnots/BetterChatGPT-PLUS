import { StoreSlice } from './store';
import { initializeModels } from '@constants/modelLoader';

export interface CustomModel {
  id: string;
  name: string;
  architecture: {
    instruct_type: null;
    modality: 'text->text' | 'text+image->text' | 'text->image' | 'text+image->image';
    tokenizer: string;
  };
  context_length: number;
  per_request_limits: null;
  pricing: {
    completion: string;
    image: string;
    prompt: string;
    request: string;
  };
  top_provider: {
    context_length: number;
    is_moderated: boolean;
    max_completion_tokens: number;
  };
  is_stream_supported: boolean;
}

export interface CustomModelsSlice {
  customModels: CustomModel[];
  addCustomModel: (model: Omit<CustomModel, 'architecture' | 'per_request_limits' | 'top_provider'> & {
    architecture: Pick<CustomModel['architecture'], 'modality' | 'tokenizer' | 'instruct_type'>;
  }) => void;
  removeCustomModel: (modelId: string) => void;
}

const defaultModelValues = {
  architecture: {
    instruct_type: null,
    tokenizer: 'cl100k_base'
  },
  per_request_limits: null,
  top_provider: {
    context_length: 128000,
    max_completion_tokens: 16384,
    is_moderated: true
  },
  is_stream_supported: true
};

export const createCustomModelsSlice: StoreSlice<CustomModelsSlice> = (set) => ({
  customModels: [],
  addCustomModel: (model) => {
    set((state) => ({
      ...state,
      customModels: [
        ...state.customModels,
        {
          ...defaultModelValues,
          ...model,
          architecture: {
            ...defaultModelValues.architecture,
            modality: model.architecture.modality,
            instruct_type: model.architecture.instruct_type,
            tokenizer: model.architecture.tokenizer
          }
        }
      ]
    }));
    // Reload models after adding a new one
    initializeModels();
  },
  removeCustomModel: (modelId) => {
    set((state) => {
      const newState = {
        ...state,
        customModels: state.customModels.filter((m) => m.id !== modelId)
      };
      // Reload models after removing one
      initializeModels();
      return newState;
    });
  }
});
