import { ModelCost } from '@type/chat';
import { loadModels } from '@utils/modelReader';

let modelOptions: string[] = [];
let modelMaxToken: { [key: string]: number } = {};
let modelCost: ModelCost = {};
let modelTypes: { [key: string]: string } = {};
let modelStreamSupport: { [key: string]: boolean } = {};
let modelDisplayNames: { [key: string]: string } = {};

// Initialize with default value, will be updated when called with correct value
export const initializeModels = async (autoFetchModels = false) => {
  const models = await loadModels(autoFetchModels);
  modelOptions = models.modelOptions;
  modelMaxToken = models.modelMaxToken;
  modelCost = models.modelCost;
  modelTypes = models.modelTypes;
  modelStreamSupport = models.modelStreamSupport;
  modelDisplayNames = models.modelDisplayNames;
};

// Initial load with default (false) to ensure models are available
initializeModels();

export { modelOptions, modelMaxToken, modelCost, modelTypes, modelStreamSupport, modelDisplayNames };