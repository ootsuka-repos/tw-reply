// Twitter Reply Enhancer - Content Script
class TwitterReplyEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.injectStyles();
    this.observePageChanges();
    this.addButtons();
  }

  injectStyles() {
    if (document.getElementById('tre-styles')) return;

    const style = document.createElement('style');
    style.id = 'tre-styles';
    style.textContent = `
      .tre-button {
        background: linear-gradient(135deg, #1da1f2, #0d8bd9);
        color: white;
        border: none;
        border-radius: 20px;
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        margin-left: 8px;
        transition: all 0.2s ease;
        position: relative;
        z-index: 1000;
      }

      .tre-button:hover {
        background: linear-gradient(135deg, #0d8bd9, #0a7bc4);
        transform: translateY(-1px);
      }

      .tre-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999998;
        display: none;
      }

      .tre-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #e1e8ed;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        width: 400px;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 999999;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .tre-header {
        padding: 16px;
        border-bottom: 1px solid #e1e8ed;
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .tre-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #657786;
      }

      .tre-close:hover {
        color: #1da1f2;
      }

      .tre-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 16px;
      }

      .tre-tone-btn {
        padding: 12px 8px;
        border: 2px solid #e1e8ed;
        border-radius: 12px;
        background: #f7f9fa;
        color: #14171a;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }

      .tre-tone-btn:hover {
        border-color: #1da1f2;
        background: #e8f5fe;
        color: #1da1f2;
      }

      .tre-tone-btn.positive:hover { background: #17bf63; border-color: #17bf63; color: white; }
      .tre-tone-btn.negative:hover { background: #f91880; border-color: #f91880; color: white; }
      .tre-tone-btn.question:hover { background: #ffad1f; border-color: #ffad1f; color: white; }
      .tre-tone-btn.neutral:hover { background: #1da1f2; border-color: #1da1f2; color: white; }

      .tre-result {
        padding: 16px;
        border-top: 1px solid #e1e8ed;
        display: none;
      }

      .tre-textarea {
        width: 100%;
        min-height: 80px;
        border: 2px solid #e1e8ed;
        border-radius: 12px;
        padding: 12px;
        font-size: 14px;
        resize: vertical;
        outline: none;
        box-sizing: border-box;
      }

      .tre-textarea:focus {
        border-color: #1da1f2;
      }

      .tre-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .tre-use-btn {
        flex: 1;
        background: #1da1f2;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .tre-use-btn:hover {
        background: #0d8bd9;
      }

      .tre-regenerate-btn {
        background: #f7f9fa;
        color: #657786;
        border: 1px solid #e1e8ed;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .tre-regenerate-btn:hover {
        background: #e8f5fe;
        color: #1da1f2;
        border-color: #1da1f2;
      }

      .tre-loading {
        display: none;
        padding: 32px 16px;
        text-align: center;
        color: #657786;
      }

      .tre-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e1e8ed;
        border-top: 2px solid #1da1f2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Dark mode */
      html[data-theme="dark"] .tre-modal-overlay {
        background: rgba(0, 0, 0, 0.8);
      }

      html[data-theme="dark"] .tre-popup {
        background: #192734;
        border-color: #38444d;
        color: white;
      }

      html[data-theme="dark"] .tre-header {
        border-bottom-color: #38444d;
      }

      html[data-theme="dark"] .tre-tone-btn {
        background: #253341;
        border-color: #38444d;
        color: white;
      }

      html[data-theme="dark"] .tre-textarea {
        background: #253341;
        border-color: #38444d;
        color: white;
      }
    `;
    document.head.appendChild(style);
  }

  observePageChanges() {
    const observer = new MutationObserver(() => {
      this.addButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  addButtons() {
    // Twitter/X のツイートを見つける
    const tweets = document.querySelectorAll('[data-testid="tweet"]');

    tweets.forEach(tweet => {
      if (tweet.querySelector('.tre-button')) return;

      // ツイートのヘッダー部分を見つける（ユーザー名やタイムスタンプがある部分）
      const tweetHeader = tweet.querySelector('[data-testid="User-Name"]')?.closest('div')?.parentElement;

      if (tweetHeader) {
        // AIボタンを作成
        const aiButton = this.createAIButton(tweet);

        // ヘッダーの右側に追加
        aiButton.style.cssText += `
          position: absolute !important;
          right: 16px !important;
          top: 12px !important;
          margin: 0 !important;
        `;

        // ツイート要素を相対位置に設定
        tweet.style.position = 'relative';

        tweet.appendChild(aiButton);
      }
    });
  }

  createAIButton(tweetElement) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'inline-block';

    const button = document.createElement('button');
    button.className = 'tre-button';
    button.innerHTML = '🤖 AI';
    button.title = 'AI返信生成';

    const modalContainer = this.createPopup(tweetElement);
    const overlay = modalContainer.querySelector('.tre-modal-overlay');
    const popup = modalContainer.querySelector('.tre-popup');

    container.appendChild(button);
    document.body.appendChild(modalContainer);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 他のモーダルを閉じる
      document.querySelectorAll('.tre-modal-overlay').forEach(o => {
        if (o !== overlay) {
          o.style.display = 'none';
          o.parentElement.querySelector('.tre-popup').style.display = 'none';
        }
      });

      const isVisible = overlay.style.display === 'block';
      overlay.style.display = isVisible ? 'none' : 'block';
      popup.style.display = isVisible ? 'none' : 'block';
    });

    return container;
  }

  createPopup(tweetElement) {
    const modalContainer = document.createElement('div');

    const overlay = document.createElement('div');
    overlay.className = 'tre-modal-overlay';

    const popup = document.createElement('div');
    popup.className = 'tre-popup';

    popup.innerHTML = `
      <div class="tre-header">
        AI返信生成
        <button class="tre-close">×</button>
      </div>

      <div class="tre-buttons">
        <button class="tre-tone-btn positive" data-tone="positive">👍 肯定</button>
        <button class="tre-tone-btn negative" data-tone="negative">👎 否定</button>
        <button class="tre-tone-btn question" data-tone="question">❓ 疑問</button>
        <button class="tre-tone-btn neutral" data-tone="neutral">😐 中立</button>
      </div>

      <div class="tre-loading">
        <div class="tre-spinner"></div>
        AI返信を生成中...
      </div>

      <div class="tre-result">
        <textarea class="tre-textarea" id="tre-textarea-${Date.now()}" name="replyText" placeholder="生成された返信がここに表示されます"></textarea>
        <div class="tre-actions">
          <button class="tre-regenerate-btn">再生成</button>
          <button class="tre-use-btn">この返信を使用</button>
        </div>
      </div>
    `;

    modalContainer.appendChild(overlay);
    modalContainer.appendChild(popup);

    this.attachPopupEvents(modalContainer, popup, overlay, tweetElement);
    return modalContainer;
  }

  attachPopupEvents(modalContainer, popup, overlay, tweetElement) {
    const closeBtn = popup.querySelector('.tre-close');
    const toneButtons = popup.querySelectorAll('.tre-tone-btn');
    const useBtn = popup.querySelector('.tre-use-btn');
    const regenerateBtn = popup.querySelector('.tre-regenerate-btn');
    const textarea = popup.querySelector('.tre-textarea');
    const loading = popup.querySelector('.tre-loading');
    const result = popup.querySelector('.tre-result');

    let currentTone = null;

    const closeModal = () => {
      overlay.style.display = 'none';
      popup.style.display = 'none';
    };

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', closeModal);

    toneButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        currentTone = btn.dataset.tone;
        await this.generateReply(tweetElement, currentTone, popup);
      });
    });

    regenerateBtn.addEventListener('click', async () => {
      if (currentTone) {
        await this.generateReply(tweetElement, currentTone, popup);
      }
    });

    useBtn.addEventListener('click', () => {
      const replyText = textarea.value;
      if (replyText) {
        this.insertReplyToTwitter(replyText);
        closeModal();
      }
    });
  }

  async generateReply(tweetElement, tone, popup) {
    const loading = popup.querySelector('.tre-loading');
    const result = popup.querySelector('.tre-result');
    const textarea = popup.querySelector('.tre-textarea');

    console.log('generateReply called:', { tone, tweetElement, popup });

    loading.style.display = 'block';
    result.style.display = 'none';

    try {
      const tweetText = this.extractTweetText(tweetElement);
      const authorName = this.extractAuthorName(tweetElement);

      console.log('Extracted data:', { tweetText, authorName, tone });

      const reply = await this.callAPI(tweetText, authorName, tone);

      console.log('API response:', reply);

      textarea.value = reply;
      loading.style.display = 'none';
      result.style.display = 'block';
    } catch (error) {
      console.error('Reply generation failed:', error);
      textarea.value = `エラーが発生しました: ${error.message}`;
      loading.style.display = 'none';
      result.style.display = 'block';
    }
  }

  extractTweetText(tweetElement) {
    const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
    return textElement ? textElement.textContent.trim() : 'ツイートテキストが見つかりません';
  }

  extractAuthorName(tweetElement) {
    const nameElement = tweetElement.querySelector('[data-testid="User-Name"] span');
    return nameElement ? nameElement.textContent.trim() : 'ユーザー';
  }

  async callAPI(tweetText, authorName, tone) {
    return new Promise((resolve, reject) => {
      console.log('Sending message to background script:', { tweetText, authorName, tone });

      chrome.runtime.sendMessage({
        action: 'generateReply',
        tweetText,
        authorName,
        tone
      }, response => {
        console.log('Background script response:', response);

        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response && response.success) {
          resolve(response.reply);
        } else {
          reject(new Error(response?.error || 'API呼び出しに失敗しました'));
        }
      });
    });
  }

  insertReplyToTwitter(replyText) {
    try {
      // 返信ボタンをクリック
      const replyButton = document.querySelector('[data-testid="reply"]');
      if (replyButton) {
        replyButton.click();

        // 複数回試行してcomposerを見つける
        this.waitForComposer(replyText, 0);
      } else {
        // 返信ボタンが見つからない場合はクリップボードにコピー
        this.copyToClipboard(replyText);
      }
    } catch (error) {
      console.error('insertReplyToTwitter error:', error);
      this.copyToClipboard(replyText);
    }
  }

  waitForComposer(replyText, attempts) {
    if (attempts >= 20) { // 最大2秒待機
      console.log('Composer not found, copying to clipboard');
      this.copyToClipboard(replyText);
      return;
    }

    setTimeout(() => {
      const composer = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                      document.querySelector('[contenteditable="true"][data-testid*="tweet"]') ||
                      document.querySelector('[role="textbox"]');

      if (composer) {
        this.setComposerText(composer, replyText);
      } else {
        this.waitForComposer(replyText, attempts + 1);
      }
    }, 100);
  }

  setComposerText(composer, text) {
    try {
      composer.focus();

      // Reactの内部プロパティを使用してテキストを設定
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLDivElement.prototype, 'textContent'
      ).set;

      nativeInputValueSetter.call(composer, text);

      // 複数のイベントを発火
      const events = ['input', 'change', 'keydown', 'keyup'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        composer.dispatchEvent(event);
      });

      // React用の特殊なイベント
      const reactEvent = new Event('input', { bubbles: true });
      reactEvent.simulated = true;
      composer.dispatchEvent(reactEvent);

      console.log('Reply text inserted successfully');
    } catch (error) {
      console.error('Failed to set composer text:', error);
      this.copyToClipboard(text);
    }
  }

  copyToClipboard(text) {
    try {
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification('返信をクリップボードにコピーしました');
      }).catch(() => {
        // フォールバック
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showNotification('返信をクリップボードにコピーしました');
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1da1f2;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// 初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TwitterReplyEnhancer();
  });
} else {
  new TwitterReplyEnhancer();
}