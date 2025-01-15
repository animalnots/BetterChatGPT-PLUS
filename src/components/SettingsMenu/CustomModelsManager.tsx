import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';

import PopupModal from '@components/PopupModal';

const CustomModelsManager = () => {
  const { t } = useTranslation('model');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelModality, setNewModelModality] = useState<'text->text' | 'text+image->text' | 'text->image' | 'text+image->image'>('text->text');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contextLength, setContextLength] = useState(128000);
  const [maxCompletionTokens, setMaxCompletionTokens] = useState(16384);
  const [isStreamSupported, setIsStreamSupported] = useState(true);
  const [pricing, setPricing] = useState({
    completion: '0.00001',
    image: '0.003613',
    prompt: '0.0000025',
    request: '0'
  });

  const customModels = useStore((state) => state.customModels);
  const addCustomModel = useStore((state) => state.addCustomModel);
  const removeCustomModel = useStore((state) => state.removeCustomModel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newModelId && newModelName) {
      addCustomModel({
        id: newModelId,
        name: newModelName,
        architecture: {
          modality: newModelModality,
          tokenizer: "cl100k_base",
          instruct_type: null
        },
        context_length: contextLength,
        pricing: pricing,
        is_stream_supported: isStreamSupported
      });
      setNewModelId('');
      setNewModelName('');
      setNewModelModality('text->text');
      setShowAdvanced(false);
      setContextLength(128000);
      setMaxCompletionTokens(16384);
      setIsStreamSupported(true);
      setPricing({
        completion: '0.00001',
        image: '0.003613',
        prompt: '0.0000025',
        request: '0'
      });
    }
  };

  return (
    <div>
      <button
        className='btn btn-neutral'
        onClick={() => setIsModalOpen(true)}
      >
        {t('customModels.title') || ''}
      </button>

      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title={t('customModels.title') || ''}
          cancelButton={true}
        >
          <div className='p-6 space-y-4'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
                  {t('customModels.modelId') || ''}
                </label>
                <input
                  type='text'
                  placeholder={t('customModels.modelId') || ''}
                  value={newModelId}
                  onChange={(e) => setNewModelId(e.target.value)}
                  className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
                  {t('customModels.modelName') || ''}
                </label>
                <input
                  type='text'
                  placeholder={t('customModels.modelName') || ''}
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
                  {t('customModels.modality') || ''}
                </label>
                <select
                  value={newModelModality}
                  onChange={(e) => setNewModelModality(e.target.value as 'text->text' | 'text+image->text' | 'text->image' | 'text+image->image')}
                  className='w-full rounded bg-transparent text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='text->text'>{t('customModels.textToText') || ''}</option>
                  <option value='text+image->text'>{t('customModels.textAndImageToText') || ''}</option>
                  <option value='text->image'>{t('customModels.textToImage') || ''}</option>
                  <option value='text+image->image'>{t('customModels.textAndImageToImage') || ''}</option>
                </select>
              </div>

              <div className='space-y-1'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
                  {t('customModels.streamSupported') || ''}
                </label>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='streamSupported'
                    checked={isStreamSupported}
                    onChange={(e) => setIsStreamSupported(e.target.checked)}
                    className='rounded'
                  />
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    {t('customModels.streamSupportedDescription') || ''}
                  </div>
                </div>
              </div>

              <button
                type='button'
                onClick={() => setShowAdvanced(!showAdvanced)}
                className='text-left px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none transition-colors'
              >
                {showAdvanced 
                  ? (t('customModels.hideAdvanced') || '')
                  : (t('customModels.showAdvanced') || '')
                }
              </button>

              {showAdvanced && (
                <div className='space-y-6 border-t border-gray-200 dark:border-gray-700 pt-4'>
                  <h4 className='text-left font-medium text-gray-900 dark:text-gray-100'>
                    {t('customModels.advancedSettings') || ''}
                  </h4>

                  <div className='space-y-4'>
                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
                        {t('customModels.contextLength') || ''}
                      </label>
                      <input
                        type='number'
                        value={contextLength}
                        onChange={(e) => setContextLength(Number(e.target.value))}
                        className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
                        {t('customModels.maxCompletionTokens') || ''}
                      </label>
                      <input
                        type='number'
                        value={maxCompletionTokens}
                        onChange={(e) => setMaxCompletionTokens(Number(e.target.value))}
                        className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                    </div>

                    <div className='space-y-4'>
                      <h4 className='text-left font-medium text-gray-700 dark:text-gray-200'>
                        {t('customModels.pricing') || ''}
                      </h4>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-1'>
                          <label className='block text-sm text-gray-700 dark:text-gray-200'>
                            {t('customModels.promptPrice') || ''}
                          </label>
                          <input
                            type='number'
                            step='0.000001'
                            value={pricing.prompt}
                            onChange={(e) => setPricing({ ...pricing, prompt: e.target.value })}
                            className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <div className='space-y-1'>
                          <label className='block text-sm text-gray-700 dark:text-gray-200'>
                            {t('customModels.completionPrice') || ''}
                          </label>
                          <input
                            type='number'
                            step='0.000001'
                            value={pricing.completion}
                            onChange={(e) => setPricing({ ...pricing, completion: e.target.value })}
                            className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <div className='space-y-1'>
                          <label className='block text-sm text-gray-700 dark:text-gray-200'>
                            {t('customModels.imagePrice') || ''}
                          </label>
                          <input
                            type='number'
                            step='0.000001'
                            value={pricing.image}
                            onChange={(e) => setPricing({ ...pricing, image: e.target.value })}
                            className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <div className='space-y-1'>
                          <label className='block text-sm text-gray-700 dark:text-gray-200'>
                            {t('customModels.requestPrice') || ''}
                          </label>
                          <input
                            type='number'
                            step='0.000001'
                            value={pricing.request}
                            onChange={(e) => setPricing({ ...pricing, request: e.target.value })}
                            className='w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type='submit'
                className='w-full btn btn-neutral py-3 font-medium'
              >
                {t('customModels.addModel') || ''}
              </button>
            </form>

            <div className='mt-8'>
              <h3 className='text-left text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
                {t('customModels.yourCustomModels') || ''}
              </h3>
              {customModels.length === 0 ? (
                <p className='text-left text-gray-500 dark:text-gray-400 py-4'>
                  {t('customModels.noModels') || ''}
                </p>
              ) : (
                <ul className='space-y-3'>
                  {customModels.map((model) => (
                    <li key={model.id} className='flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg'>
                      <span className='text-black dark:text-white'>{model.name}</span>
                      <button
                        onClick={() => removeCustomModel(model.id)}
                        className='px-3 py-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors'
                      >
                        {t('customModels.remove') || ''}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </PopupModal>
      )}
    </div>
  );
};

export default CustomModelsManager;
