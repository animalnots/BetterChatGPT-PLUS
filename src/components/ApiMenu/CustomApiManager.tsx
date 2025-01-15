import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import PopupModal from '@components/PopupModal';
import { ModelApiConfig } from '@store/model-api-slice';

interface Props {
  parentModalOpen?: boolean;
}

const CustomApiManager = ({ parentModalOpen }: Props) => {
  const { t } = useTranslation('api');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModelId, setNewModelId] = useState('');
  const [newApiEndpoint, setNewApiEndpoint] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newApiVersion, setNewApiVersion] = useState('');

  const modelApiConfigs = useStore((state) => state.modelApiConfigs) || [];
  const addModelApiConfig = useStore((state) => state.addModelApiConfig);
  const removeModelApiConfig = useStore((state) => state.removeModelApiConfig);

  const handleSubmit = () => {
    if (newModelId && newApiEndpoint && newApiKey) {
      addModelApiConfig({
        modelId: newModelId,
        apiEndpoint: newApiEndpoint,
        apiKey: newApiKey,
        apiVersion: newApiVersion || undefined,
      });
      setNewModelId('');
      setNewApiEndpoint('');
      setNewApiKey('');
      setNewApiVersion('');
      setIsModalOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <span className="text-gray-700 dark:text-gray-300">Looking for custom API for specific models? Try</span>
        <button
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
        >
          Add custom APIs
        </button>
      </div>

      {(!parentModalOpen || (parentModalOpen && isModalOpen)) && (
        <PopupModal
          title={t('Custom API Configuration') as string}
          setIsModalOpen={setIsModalOpen}
          handleConfirm={handleSubmit}
        >
          <div className="p-6 space-y-6">
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Model ID
                </label>
                <input
                  type="text"
                  className="w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newModelId}
                  onChange={(e) => setNewModelId(e.target.value)}
                  placeholder="gpt-4-turbo"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  API Endpoint
                </label>
                <input
                  type="text"
                  className="w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newApiEndpoint}
                  onChange={(e) => setNewApiEndpoint(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  API Key
                </label>
                <input
                  type="password"
                  className="w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="sk-..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  API Version (Optional)
                </label>
                <input
                  type="text"
                  className="w-full text-black dark:text-white px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newApiVersion}
                  onChange={(e) => setNewApiVersion(e.target.value)}
                  placeholder="2023-05-15"
                />
              </div>

              <button type="submit" className="btn btn-neutral mt-2">
                Add Configuration
              </button>
            </form>

            {modelApiConfigs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300 mb-4">
                  Existing Configurations
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Model ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          API Endpoint
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          API Version
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {modelApiConfigs.map((config) => (
                        <tr key={config.modelId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {config.modelId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {config.apiEndpoint}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {config.apiVersion || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeModelApiConfig(config.modelId);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </PopupModal>
      )}
    </>
  );
};

export default CustomApiManager;
