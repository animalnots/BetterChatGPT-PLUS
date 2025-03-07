import { ModelCost } from '@type/chat';
import useStore from '@store/store';
import i18next from 'i18next';

interface ModelData {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
  per_request_limits: any;
  // TODO: Remove workaround once openrouter supports it;
  is_stream_supported: boolean; // custom field until better workaround or openrouter proper support
}

interface ModelsJson {
  data: ModelData[];
}

const modelsJsonUrl = 'models.json';

export const loadModels = async (): Promise<{
  modelOptions: string[];
  modelMaxToken: { [key: string]: number };
  modelCost: ModelCost;
  modelTypes: { [key: string]: string };
  modelStreamSupport: { [key: string]: boolean };
  modelDisplayNames: { [key: string]: string };
}> => {
  const response = await fetch(modelsJsonUrl);
  const modelsJson: ModelsJson = await response.json();

  const modelOptions: string[] = [];
  const modelMaxToken: { [key: string]: number } = {};
  const modelCost: ModelCost = {};
  const modelTypes: { [key: string]: string } = {};
  const modelStreamSupport: { [key: string]: boolean } = {};
  const modelDisplayNames: { [key: string]: string } = {};

  // Add custom models first
  const customModels = useStore.getState().customModels;
  customModels.forEach((model) => {
    const modelId = model.id;
    modelOptions.push(modelId);
    modelMaxToken[modelId] = model.context_length;
    modelCost[modelId] = {
      prompt: { price: parseFloat(model.pricing.prompt), unit: 1 },
      completion: { price: parseFloat(model.pricing.completion), unit: 1 },
      image: { price: parseFloat(model.pricing.image), unit: 1 },
    };
    
    modelTypes[modelId] = model.architecture.modality.includes('image') ? 'image' : 'text';
    modelStreamSupport[modelId] = model.is_stream_supported;
    console.log("init model:", model.name);
    console.log("init model with stream support:", model.is_stream_supported);
    modelDisplayNames[modelId] = `${model.name} ${i18next.t('customModels.customLabel', { ns: 'model' })}`;
  });

  // Prepend specific models
  const specificModels = [
    {
      id: 'gpt-4-0125-preview',
      context_length: 128000,
      pricing: {
        prompt: '0.00001',
        completion: '0.00003',
        image: '0.01445',
        request: '0',
      },
      type: 'text',
      is_stream_supported: true,
    },
    {
      id: 'gpt-4-turbo-2024-04-09',
      context_length: 128000,
      pricing: {
        prompt: '0.00001',
        completion: '0.00003',
        image: '0.01445',
        request: '0',
      },
      type: 'text',
      is_stream_supported: false,
    },
  ];

  specificModels.forEach((model) => {
    modelOptions.push(model.id);
    modelMaxToken[model.id] = model.context_length;
    modelCost[model.id] = {
      prompt: { price: parseFloat(model.pricing.prompt), unit: 1 },
      completion: { price: parseFloat(model.pricing.completion), unit: 1 },
      image: { price: parseFloat(model.pricing.image), unit: 1 },
    };
    modelTypes[model.id] = model.type;
    modelStreamSupport[model.id] = model.is_stream_supported;
    modelDisplayNames[model.id] = model.id;
  });

  modelsJson.data.forEach((model) => {
    const modelId = model.id.split('/').pop() as string;
    modelOptions.push(modelId);
    modelMaxToken[modelId] = model.context_length;
    modelCost[modelId] = {
      prompt: { price: parseFloat(model.pricing.prompt), unit: 1 },
      completion: { price: parseFloat(model.pricing.completion), unit: 1 },
      image: { price: 0, unit: 1 }, // default for no image models
    };

    // TODO: Remove workaround once openrouter supports it
    if (modelId.includes('o1-')) {
      model.is_stream_supported = false;
    } else {
      model.is_stream_supported = true;
    }

    // Detect image capabilities
    if (parseFloat(model.pricing.image) > 0) {
      modelTypes[modelId] = 'image';
      modelCost[modelId].image = {
        price: parseFloat(model.pricing.image),
        unit: 1,
      };
    } else {
      modelTypes[modelId] = 'text';
    }
    modelStreamSupport[modelId] = model.is_stream_supported;
    modelDisplayNames[modelId] = modelId;
  });

  // Sort modelOptions to prioritize gpt-4.5 models at the top, followed by custom models, gpt-4o models, o1 models, and then other OpenAI models
  modelOptions.sort((a, b) => {
    const isCustomA = customModels.some(m => m.id === a);
    const isCustomB = customModels.some(m => m.id === b);
    const isGpt45A = a.includes('gpt-4.5');
    const isGpt45B = b.includes('gpt-4.5');
    const isGpt4oA = a.startsWith('gpt-4o');
    const isGpt4oB = b.startsWith('gpt-4o');
    const isO1A = a.startsWith('o1-');
    const isO1B = b.startsWith('o1-');
    const isOpenAIA = a.startsWith('gpt-');
    const isOpenAIB = b.startsWith('gpt-');

    // Prioritize gpt-4.5 models
    if (isGpt45A && !isGpt45B) return -1;
    if (!isGpt45A && isGpt45B) return 1;

    // Then prioritize custom models
    if (isCustomA && !isCustomB) return -1;
    if (!isCustomA && isCustomB) return 1;

    // If both are custom or neither, prioritize gpt-4o models
    if (isGpt4oA && !isGpt4oB) return -1;
    if (!isGpt4oA && isGpt4oB) return 1;

    // If both are gpt-4o or neither, prioritize o1 models
    if (isO1A && !isO1B) return -1;
    if (!isO1A && isO1B) return 1;

    // If both are gpt-4o or o1 or neither, prioritize other OpenAI models
    if (isOpenAIA && !isOpenAIB) return -1;
    if (!isOpenAIA && isOpenAIB) return 1;

    // If both are the same type or neither, maintain original order
    return 0;
  });

  return {
    modelOptions,
    modelMaxToken,
    modelCost,
    modelTypes,
    modelStreamSupport,
    modelDisplayNames,
  };
};

export type ModelOptions = string;
