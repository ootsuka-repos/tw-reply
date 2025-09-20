# Twitter Reply Enhancer 🤖

AIを使ってTwitterの返信を自動生成するブラウザ拡張機能です。OpenRouter APIとGrok-4を使用して、4つの異なるトーン（肯定、否定、疑問、中立）で返信を生成できます。

## 特徴

- 🎯 **4つの返信トーン**: 肯定、否定、疑問、中立から選択
- 🤖 **AI生成**: Grok-4による自然な日本語返信
- ⚡ **簡単操作**: ワンクリックで返信生成・挿入
- 🎨 **直感的UI**: Twitter/Xに統合されたきれいなデザイン
- 🔧 **カスタマイズ可能**: OpenRouter APIキーの設定

## インストール方法

### 1. ファイルの準備
```bash
git clone <このリポジトリ>
cd tw-enhance
```

### 2. アイコンファイルの作成
SVGからPNGアイコンを生成する必要があります：

```bash
# オンラインSVG→PNG変換ツールを使用するか、以下のコマンドを実行
# ImageMagickがインストールされている場合：
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### 3. ブラウザに拡張機能をインストール

#### Chrome/Edge の場合:
1. `chrome://extensions/` にアクセス
2. 「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このフォルダ（tw-enhance）を選択

#### Firefox の場合:
1. `about:debugging` にアクセス
2. 「この Firefox」をクリック
3. 「一時的なアドオンを読み込む」をクリック
4. `manifest.json` ファイルを選択

## 設定方法

### OpenRouter APIキーの取得
1. [OpenRouter](https://openrouter.ai/)でアカウントを作成
2. [API Keys](https://openrouter.ai/keys)ページでAPIキーを生成
3. APIキーをコピー（`sk-or-v1-` で始まります）

### 拡張機能での設定
1. ブラウザの拡張機能アイコンをクリック
2. 「OpenRouter APIキー」フィールドにAPIキーを入力
3. 「設定を保存」をクリック

## 使用方法

1. **Twitter/X にアクセス**: https://twitter.com または https://x.com
2. **ツイートを表示**: 返信したいツイートを開く
3. **AI返信ボタンをクリック**: ツイートの下にある 🤖 AI返信 ボタンをクリック
4. **トーンを選択**: 4つのボタンから返信のトーンを選択
   - 👍 **肯定**: 共感・賛成の返信
   - 👎 **否定**: 建設的な異論・反対意見
   - ❓ **疑問**: 質問形式の返信
   - 😐 **中立**: 客観的・バランス型の返信
5. **返信を生成**: AIが自動で返信を生成
6. **確認・編集**: 生成された返信を確認、必要に応じて編集
7. **返信を投稿**: 「この返信を使用」ボタンで返信欄に挿入

## ファイル構成

```
tw-enhance/
├── manifest.json          # 拡張機能の設定
├── content.js            # Twitterページに注入されるスクリプト
├── styles.css            # UIのスタイリング
├── background.js         # バックグラウンドスクリプト
├── popup.html            # 設定画面のHTML
├── popup.js              # 設定画面のスクリプト
├── icon.svg              # アイコンのSVGファイル
├── icon16.png            # 16x16アイコン（要生成）
├── icon48.png            # 48x48アイコン（要生成）
├── icon128.png           # 128x128アイコン（要生成）
└── README.md             # このファイル
```

## トラブルシューティング

### 拡張機能が動作しない
- ブラウザの拡張機能一覧で有効になっているか確認
- Twitter/Xページを再読み込み
- APIキーが正しく設定されているか確認

### AI返信が生成されない
- OpenRouter APIキーが有効か確認
- インターネット接続を確認
- APIの利用制限に達していないか確認

### 返信が挿入されない
- Twitterの返信ボックスが開いているか確認
- ページを再読み込みして再試行

## 制限事項

- OpenRouter APIの利用制限に依存
- Twitter/XのDOM構造変更により動作しなくなる可能性
- 現在は日本語のみ対応

## ライセンス

MIT License

## 貢献

バグ報告や機能要求は GitHub Issues でお願いします。

## 免責事項

この拡張機能は教育・研究目的で作成されました。利用は自己責任でお願いします。Twitter/Xの利用規約を遵守してご利用ください。