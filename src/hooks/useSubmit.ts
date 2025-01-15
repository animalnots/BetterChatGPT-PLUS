import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import {
  ChatInterface,
  ConfigInterface,
  MessageInterface,
  TextContentInterface,
  Content,
  ImageContentInterface,
  ImageDetail,
  ContentInterface,
} from '@type/chat';
import {
  getChatCompletion,
  getChatCompletionStream,
  generateImage,
} from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens, updateTotalTokenUsed } from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { officialAPIEndpoint, officialImageAPIEndpoint } from '@constants/auth';
import { modelStreamSupport, modelTypes } from '@constants/modelLoader';
import { CustomModel } from '@store/custom-models-slice';

const useSubmit = () => {
  const { t, i18n } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = useStore((state) => state.apiEndpoint);
  const apiKey = useStore((state) => state.apiKey);
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);
  const chats = useStore((state) => state.chats);

  const generateTitle = async (
    message: MessageInterface[],
    modelConfig: ConfigInterface
  ): Promise<string> => {
    let data;
    try {
      const titleModel = useStore.getState().titleModel ?? modelConfig.model;
      const titleChatConfig = {
        ...modelConfig,
        model: titleModel,
      };

      // Check if there's a custom API config for this model
      const modelApiConfigs = useStore.getState().modelApiConfigs || [];
      const customApi = modelApiConfigs.find(
        (config) => config.modelId === titleModel
      );
      const modality = modelTypes[titleModel];
      const customEndpoint = getCustomApiEndpoint(customApi, modality);

      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }
        // other endpoints
        data = await getChatCompletion(
          customEndpoint || useStore.getState().apiEndpoint,
          message,
          titleChatConfig,
          customApi?.apiKey,
          undefined,
          customApi?.apiVersion || useStore.getState().apiVersion
        );
      } else if (apiKey) {
        // own apikey
        data = await getChatCompletion(
          customEndpoint || useStore.getState().apiEndpoint,
          message,
          titleChatConfig,
          customApi?.apiKey || apiKey,
          undefined,
          customApi?.apiVersion || useStore.getState().apiVersion
        );
      }
    } catch (error: unknown) {
      throw new Error(
        `${t('errors.errorGeneratingTitle')}\n${(error as Error).message}`
      );
    }
    return data.choices[0].message.content;
  };

  const getCustomApiEndpoint = (
    customApi: { apiEndpoint: string; modelId: string } | undefined,
    modality: string
  ): string | undefined => {
    if (!customApi?.apiEndpoint) return undefined;

    let endpoint = customApi.apiEndpoint.trim();
    return endpoint;
  };

  const handleSubmit = async () => {
    const chats = useStore.getState().chats;
    if (generating || !chats) return;

    const config =
      chats[currentChatIndex].config || useStore.getState().defaultChatConfig;

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: '',
        } as TextContentInterface,
      ],
    });

    setChats(updatedChats);
    // Check if model is an image model
    if (modelTypes[config.model].endsWith('->image')) {
      const model = {
        id: config.model,
        architecture: {
          modality: modelTypes[config.model],
          tokenizer: 'none',
          instruct_type: null,
        },
      } as CustomModel;
      return handleImageSubmit(model, updatedChats);
    }

    setGenerating(true);

    try {
      const isStreamSupported =
        modelStreamSupport[chats[currentChatIndex].config.model];
      console.log('[useSubmit] Model streaming support:', {
        model: chats[currentChatIndex].config.model,
        supportsStream: isStreamSupported,
      });
      let data;
      let stream;
      if (chats[currentChatIndex].messages.length === 0)
        throw new Error(t('errors.noMessagesSubmitted') as string);

      const limitedMessages = limitMessageTokens(
        chats[currentChatIndex].messages,
        chats[currentChatIndex].config.max_tokens,
        chats[currentChatIndex].config.model
      );
      if (limitedMessages.length === 0)
        throw new Error(t('errors.messageExceedMaxToken') as string);

      // Check if there's a custom API config for this model
      const modelApiConfigs = useStore.getState().modelApiConfigs || [];
      const customApi = modelApiConfigs.find(
        (config) => config.modelId === chats[currentChatIndex].config.model
      );
      const modality = modelTypes[config.model];
      const customEndpoint = getCustomApiEndpoint(customApi, modality);

      if (!isStreamSupported) {
        if (!apiKey || apiKey.length === 0) {
          // official endpoint
          if (apiEndpoint === officialAPIEndpoint) {
            throw new Error(t('noApiKeyWarning') as string);
          }

          // other endpoints
          data = await getChatCompletion(
            customEndpoint || useStore.getState().apiEndpoint,
            limitedMessages,
            chats[currentChatIndex].config,
            customApi?.apiKey,
            undefined,
            customApi?.apiVersion || useStore.getState().apiVersion
          );
        } else if (apiKey) {
          data = await getChatCompletion(
            customEndpoint || useStore.getState().apiEndpoint,
            limitedMessages,
            chats[currentChatIndex].config,
            customApi?.apiKey || apiKey,
            undefined,
            customApi?.apiVersion || useStore.getState().apiVersion
          );
        }

        if (
          !data ||
          !data.choices ||
          !data.choices[0] ||
          !data.choices[0].message ||
          !data.choices[0].message.content
        ) {
          throw new Error(t('errors.failedToRetrieveData') as string);
        }

        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        const updatedMessages = updatedChats[currentChatIndex].messages;
        (
          updatedMessages[updatedMessages.length - 1]
            .content[0] as TextContentInterface
        ).text += data.choices[0].message.content;
        setChats(updatedChats);
      } else {
        // no api key (possibly free)
        if (!apiKey || apiKey.length === 0) {
          // official endpoint
          if (apiEndpoint === officialAPIEndpoint) {
            throw new Error(t('noApiKeyWarning') as string);
          }

          // other endpoints
          stream = await getChatCompletionStream(
            customEndpoint || useStore.getState().apiEndpoint,
            limitedMessages,
            chats[currentChatIndex].config,
            customApi?.apiKey,
            undefined,
            customApi?.apiVersion || useStore.getState().apiVersion
          );
        } else if (apiKey) {
          // own apikey
          stream = await getChatCompletionStream(
            customEndpoint || useStore.getState().apiEndpoint,
            limitedMessages,
            chats[currentChatIndex].config,
            customApi?.apiKey || apiKey,
            undefined,
            customApi?.apiVersion || useStore.getState().apiVersion
          );
        }

        if (stream) {
          if (stream.locked)
            throw new Error(t('errors.streamLocked') as string);
          const reader = stream.getReader();
          let reading = true;
          let partial = '';
          while (reading && useStore.getState().generating) {
            const { done, value } = await reader.read();
            const result = parseEventSource(
              partial + new TextDecoder().decode(value)
            );
            partial = '';

            if (result === '[DONE]' || done) {
              reading = false;
            } else {
              const resultString = result.reduce((output: string, curr) => {
                if (typeof curr === 'string') {
                  partial += curr;
                } else {
                  const content = curr.choices[0]?.delta?.content ?? null;
                  if (content) output += content;
                }
                return output;
              }, '');

              const updatedChats: ChatInterface[] = JSON.parse(
                JSON.stringify(useStore.getState().chats)
              );
              const updatedMessages = updatedChats[currentChatIndex].messages;
              (
                updatedMessages[updatedMessages.length - 1]
                  .content[0] as TextContentInterface
              ).text += resultString;
              setChats(updatedChats);
            }
          }
          if (useStore.getState().generating) {
            reader.cancel(t('errors.cancelledByUser') as string);
          } else {
            reader.cancel(t('errors.generationCompleted') as string);
          }
          reader.releaseLock();
          stream.cancel();
        }
      }

      // update tokens used in chatting
      const currChats = useStore.getState().chats;
      const countTotalTokens = useStore.getState().countTotalTokens;

      if (currChats && countTotalTokens) {
        const model = currChats[currentChatIndex].config.model;
        const messages = currChats[currentChatIndex].messages;
        updateTotalTokenUsed(
          model,
          messages.slice(0, -1),
          messages[messages.length - 1]
        );
      }

      // generate title for new chats
      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;
        const assistant_message =
          currChats[currentChatIndex].messages[messages_length - 1].content;
        const user_message =
          currChats[currentChatIndex].messages[messages_length - 2].content;

        const message: MessageInterface = {
          role: 'user',
          content: [
            ...user_message,
            ...assistant_message,
            {
              type: 'text',
              text: `Generate a title in less than 6 words for the conversation so far (language: ${i18n.language})`,
            } as TextContentInterface,
          ],
        };

        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        let title = (
          await generateTitle([message], updatedChats[currentChatIndex].config)
        ).trim();
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);

        // update tokens used for generating title
        if (countTotalTokens) {
          const model = _defaultChatConfig.model;
          updateTotalTokenUsed(model, [message], {
            role: 'assistant',
            content: [{ type: 'text', text: title } as TextContentInterface],
          });
        }
      }
    } catch (e: unknown) {
      const err = (e as Error).message;
      console.log(err);
      setError(err);
    }
    setGenerating(false);
  };

  const handleImageSubmit = async (
    model: CustomModel,
    currentChats?: ChatInterface[]
  ) => {
    try {
      if (!currentChats?.[currentChatIndex]) {
        throw new Error(t('errors.failedToSubmit') as string);
      }

      if (!apiKey && apiEndpoint === officialAPIEndpoint) {
        throw new Error(t('noApiKeyWarning') as string);
      }

      setGenerating(true);
      setError('');

      if (currentChats[currentChatIndex].messages.length === 0)
        throw new Error(t('errors.noMessagesSubmitted') as string);

      // Find the last user message
      const lastUserMessage = [...currentChats[currentChatIndex].messages]
        .reverse()
        .find((msg) => msg.role === 'user');

      if (!lastUserMessage) {
        throw new Error(t('errors.noUserMessages') as string);
      }

      const prompt = lastUserMessage.content[0].text;

      // Check if there's a custom API config for this model
      const modelApiConfigs = useStore.getState().modelApiConfigs || [];
      const customApi = modelApiConfigs.find(
        (config) => config.modelId === model.id
      );
      const modality = modelTypes[model.id];
      const customEndpoint = getCustomApiEndpoint(customApi, modality);
      let endpoint = customEndpoint || apiEndpoint;

      endpoint = endpoint.trim();
      // Ensure we're using the correct DALL-E endpoint if we are using openai endpoint (default)
      if (endpoint === officialAPIEndpoint) {
        endpoint = officialImageAPIEndpoint;
      }

      const imageResult = await generateImage(
        endpoint,
        prompt,
        model.id,
        '1024x1024',
        customApi?.apiKey || apiKey,
        undefined,
        customApi?.apiVersion || undefined
      );

      const imageContent: ImageContentInterface = {
        type: 'image_url',
        image_url: {
          url: imageResult.url,
          detail: 'auto' as ImageDetail,
        },
      };

      // Create new assistant message with the revised prompt (if available) and image
      const assistantContent: ContentInterface[] = [];
      if (imageResult.revised_prompt) {
        assistantContent.push({
          type: 'text',
          text: imageResult.revised_prompt,
        } as TextContentInterface);
      }
      assistantContent.push(imageContent);

      const assistantMessage: MessageInterface = {
        role: 'assistant',
        content: assistantContent,
      };

      const updatedChats = [...(currentChats || [])];
      if (updatedChats[currentChatIndex]) {
        updatedChats[currentChatIndex].messages[
          updatedChats[currentChatIndex].messages.length - 1
        ] = assistantMessage;
        setChats(updatedChats);
      }
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message);
    }
    setGenerating(false);
  };

  return { handleSubmit, error };
};

export default useSubmit;
