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
  created: number;
}

interface ModelsJson {
  data: ModelData[];
}

const modelsJsonUrl = 'models.json';

const imageModels: ModelsJson = {
  data: [
    {
      id: "dall-e-2",
      name: "DALL-E 2",
      description: "Create realistic images and art from a description in natural language",
      pricing: {
        prompt: "0",
        completion: "0",
        image: "0.020",
        request: "0"
      },
      context_length: 1000,
      architecture: {
        modality: "text->image",
        tokenizer: "none",
        instruct_type: null
      },
      top_provider: {
        context_length: 1000,
        is_moderated: true,
        max_completion_tokens: null
      },
      per_request_limits: null,
      created: new Date().getTime() / 1000,
      is_stream_supported: false
    }
  ]
};

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

  // Combine regular models with image models
  const allModels = {
    data: [...modelsJson.data, ...imageModels.data]
  };

  const modelOptions: string[] = [];
  const modelMaxToken: { [key: string]: number } = {};
  const modelCost: ModelCost = {};
  const modelTypes: { [key: string]: string } = {};
  const modelStreamSupport: { [key: string]: boolean } = {};
  const modelDisplayNames: { [key: string]: string } = {};

  allModels.data.forEach((model) => {
    const modelId = model.id.split('/').pop() as string;
    modelOptions.push(modelId);
    modelMaxToken[modelId] = model.context_length;
    modelCost[modelId] = {
      prompt: { price: parseFloat(model.pricing.prompt), unit: 1 },
      completion: { price: parseFloat(model.pricing.completion), unit: 1 },
      image: { price: 0, unit: 1 }, // default for no image models
    };
    modelTypes[modelId] = model.architecture.modality;

    // Detect image capabilities
    if (parseFloat(model.pricing.image) > 0) {
      modelCost[modelId].image = {
        price: parseFloat(model.pricing.image ?? 0),
        unit: 1,
      };
    }

    // TODO: Remove workaround once openrouter supports it
    if (modelId.includes('o1-') || model.architecture.modality.endsWith('->image')) {
      model.is_stream_supported = false;
    } else {
      model.is_stream_supported = true;
    }

    modelStreamSupport[modelId] = model.is_stream_supported;
    modelDisplayNames[modelId] = modelId;
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
      type: 'text->text',
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
      type: 'text->text',
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

  // Add custom models last
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
    
    modelTypes[modelId] = model.architecture.modality;
    modelStreamSupport[modelId] = model.is_stream_supported;
    console.log("init model:", model.name);
    console.log("init model with stream support:", model.is_stream_supported);
    modelDisplayNames[modelId] = `${model.name} ${i18next.t('customModels.customLabel', { ns: 'model' })}`;
  });

  // Sort modelOptions to prioritize custom models at the top, followed by gpt-4o models, then o1 models, and then other OpenAI models
  modelOptions.sort((a, b) => {
    const isCustomA = customModels.some(m => m.id === a);
    const isCustomB = customModels.some(m => m.id === b);
    const isGpt4oA = a.startsWith('gpt-4o');
    const isGpt4oB = b.startsWith('gpt-4o');
    const isO1A = a.startsWith('o1-');
    const isO1B = b.startsWith('o1-');
    const isOpenAIA = a.startsWith('gpt-');
    const isOpenAIB = b.startsWith('gpt-');

    // Prioritize custom models
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
