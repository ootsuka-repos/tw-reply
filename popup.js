// Popup script for Twitter Reply Enhancer
document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modelInput = document.getElementById('modelInput');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const status = document.getElementById('status');

  // Profile elements
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const profileName = document.getElementById('profileName');
  const profileAge = document.getElementById('profileAge');
  const profilePersonality = document.getElementById('profilePersonality');
  const profileSpeakingStyle = document.getElementById('profileSpeakingStyle');
  const profileOccupation = document.getElementById('profileOccupation');
  const profileInterests = document.getElementById('profileInterests');
  const profileCatchPhrase = document.getElementById('profileCatchPhrase');
  const profileCustomInstructions = document.getElementById('profileCustomInstructions');

  // Load saved settings
  try {
    const result = await chrome.storage.sync.get(['openRouterApiKey', 'selectedModel', 'userProfile']);
    if (result.openRouterApiKey) {
      apiKeyInput.value = result.openRouterApiKey;
    }
    if (result.selectedModel) {
      modelInput.value = result.selectedModel;
    } else {
      // デフォルトモデルを設定
      modelInput.value = 'x-ai/grok-4-fast:free';
    }

    // Load profile data
    if (result.userProfile) {
      const profile = result.userProfile;
      profileName.value = profile.name || '';
      profileAge.value = profile.age || '';
      profilePersonality.value = profile.personality || '';
      profileSpeakingStyle.value = profile.speakingStyle || '';
      profileOccupation.value = profile.occupation || '';
      profileInterests.value = profile.interests || '';
      profileCatchPhrase.value = profile.catchPhrase || '';
      profileCustomInstructions.value = profile.customInstructions || '';
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  // Save settings
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const selectedModel = modelInput.value.trim();

    if (!apiKey) {
      showStatus('APIキーを入力してください', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-or-v1-')) {
      showStatus('有効なOpenRouter APIキーを入力してください', 'error');
      return;
    }

    if (!selectedModel) {
      showStatus('AIモデル名を入力してください', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({
        openRouterApiKey: apiKey,
        selectedModel: selectedModel
      });
      showStatus('設定を保存しました', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showStatus('保存に失敗しました', 'error');
    }
  });

  // Test API connection
  testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('APIキーを入力してください', 'error');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'テスト中...';

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showStatus('API接続に成功しました！', 'success');
      } else {
        showStatus('API接続に失敗しました。キーを確認してください。', 'error');
      }
    } catch (error) {
      console.error('API test failed:', error);
      showStatus('接続テストに失敗しました', 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '接続テスト';
    }
  });

  // Save profile
  saveProfileBtn.addEventListener('click', async () => {
    const profileData = {
      name: profileName.value.trim(),
      age: profileAge.value.trim(),
      personality: profilePersonality.value.trim(),
      speakingStyle: profileSpeakingStyle.value.trim(),
      occupation: profileOccupation.value.trim(),
      interests: profileInterests.value.trim(),
      catchPhrase: profileCatchPhrase.value.trim(),
      customInstructions: profileCustomInstructions.value.trim()
    };

    try {
      await chrome.storage.sync.set({ userProfile: profileData });
      showStatus('プロフィールを保存しました', 'success');
    } catch (error) {
      console.error('Failed to save profile:', error);
      showStatus('プロフィールの保存に失敗しました', 'error');
    }
  });

  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      // Add active class to clicked tab
      tab.classList.add('active');

      // Show corresponding content
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // Show status message
  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';

    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }
});