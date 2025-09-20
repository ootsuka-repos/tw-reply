// Background script for Twitter Reply Enhancer
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Twitter Reply Enhancer installed');

  // 初期設定を追加
  try {
    const result = await chrome.storage.sync.get(['openRouterApiKey', 'selectedModel', 'userProfile']);

    // デフォルト設定がない場合のみ設定
    const updates = {};

    if (!result.selectedModel) {
      updates.selectedModel = 'x-ai/grok-4-fast:free';
    }

    // デフォルトAPIキーは設定しない（ユーザーが手動で設定する必要がある）

    // デフォルトプロフィール
    if (!result.userProfile) {
      updates.userProfile = {
        name: 'デフォルトユーザー',
        personality: '真面目で誠実、思慮深い性格',
        speakingStyle: '丁寧語を基本とし、敬語を適切に使用する品格のある話し方',
        interests: 'ビジネス、学習、社会情勢',
        age: '30代',
        occupation: '会社員',
        catchPhrase: '',
        customInstructions: '常に礼儀正しく、建設的な意見交換を心がける'
      };
    }

    if (Object.keys(updates).length > 0) {
      await chrome.storage.sync.set(updates);
      console.log('Default settings initialized:', updates);
    }
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    handleReplyGeneration(request, sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleReplyGeneration(request, sendResponse) {
  try {
    const { tweetText, authorName, tone } = request;

    // Get API key, model, and profile from storage
    const result = await chrome.storage.sync.get(['openRouterApiKey', 'selectedModel', 'userProfile']);
    const apiKey = result.openRouterApiKey;
    const selectedModel = result.selectedModel || 'x-ai/grok-4-fast:free';
    const userProfile = result.userProfile || {};

    if (!apiKey) {
      sendResponse({
        success: false,
        error: 'APIキーが設定されていません。拡張機能のポップアップから設定してください。'
      });
      return;
    }

    // Define tone prompts
    const tonePrompts = {
      positive: 'あなた自身の経験や考えに基づいて、建設的な賛成意見を述べてください。単純な同意ではなく、なぜそう思うのかという理由や具体例を含めてください。',
      negative: 'あなた自身の視点から、丁寧に異なる意見を提示してください。批判ではなく、別の角度からの見解や懸念点を、根拠を持って説明してください。',
      question: 'あなたが本当に興味を持った点について、より深く知りたいという姿勢で質問してください。表面的な質問ではなく、核心に迫る質問を投げかけてください。',
      neutral: 'あなた自身の分析力を活かして、客観的で公正な視点からコメントしてください。様々な側面を考慮した上での冷静な意見を述べてください。'
    };

    // Create personalized prompt
    const profileSection = userProfile.name ? `
あなたは以下のプロフィールを持つ人物として返信してください:

名前: ${userProfile.name || 'デフォルトユーザー'}
性格: ${userProfile.personality || '親しみやすく、明るい性格'}
話し方: ${userProfile.speakingStyle || '丁寧語を基本とし、親近感のある表現を使う'}
趣味・関心: ${userProfile.interests || 'テクノロジー、音楽、映画'}
年代: ${userProfile.age || '20代'}
職業: ${userProfile.occupation || 'サラリーマン'}${userProfile.catchPhrase ? `
口癖・決め台詞: ${userProfile.catchPhrase}` : ''}${userProfile.customInstructions ? `
追加の指示: ${userProfile.customInstructions}` : ''}

このプロフィールに基づいて、自然で一貫性のある返信を生成してください。` : '';

    const prompt = `あなたは自分なりの考えを持つ個人として、自然で親しみやすい日本語でTwitter返信を作成してください。${profileSection}

以下のツイートに対して${tonePrompts[tone]}

ツイート: "${tweetText}"

重要な条件:
- 140文字以内で簡潔に
- 丁寧語（です・ます調）を基本とする
- 相手の名前や「〜さん」などの呼びかけは使用しない
- あなた自身の考えや経験を交えて発言する
- 親しみやすく自然な表現を心がける
- 建設的で前向きな内容
- 対立や炎上を避ける穏やかな言葉遣い
- 硬すぎず、親近感のある文体

返信文のみを出力してください:`;

    // Call OpenRouter API
    const requestBody = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 10000,
      temperature: 0.7
    };

    console.log('API Request:', {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: selectedModel,
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'none',
      requestBody
    });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://twitter-reply-enhancer.extension',
        'X-Title': 'Twitter Reply Enhancer'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorText
      });

      let errorMessage = `API呼び出しに失敗しました (${response.status}): ${errorText}`;
      if (response.status === 401) {
        errorMessage = 'APIキーが無効です。正しいキーを設定してください。';
      } else if (response.status === 402) {
        errorMessage = 'クレジットが不足しています。OpenRouterアカウントを確認してください。';
      } else if (response.status === 429) {
        errorMessage = 'APIの利用制限に達しました。しばらく待ってから再試行してください。';
      }

      sendResponse({ success: false, error: errorMessage });
      return;
    }

    const data = await response.json();
    console.log('OpenRouter API full response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure:', data);
      sendResponse({ success: false, error: 'APIから無効な応答が返されました。' });
      return;
    }

    const reply = data.choices[0].message.content;
    console.log('Raw reply content:', reply);

    if (!reply || reply.trim() === '') {
      console.error('Empty reply received from API:', {
        reply,
        replyType: typeof reply,
        replyLength: reply?.length,
        fullResponse: data
      });

      sendResponse({ success: false, error: `APIから空の返信が返されました。モデル: ${selectedModel}, APIキー: ${apiKey ? 'あり' : 'なし'}` });
      return;
    }

    sendResponse({ success: true, reply: reply.trim() });

  } catch (error) {
    console.error('Error in background script:', error);
    sendResponse({
      success: false,
      error: 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
    });
  }
}