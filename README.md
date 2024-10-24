# EchoTrans

**EchoTrans**は、音声認識技術「Whisper」と AI 言語モデル「ChatGPT」を組み合わせた翻訳システムです。ユーザーは音声入力を通じてリアルタイムで翻訳を行い、翻訳履歴を管理・ダウンロードすることができます。

## 📌 目次

- [特徴](#特徴)
- [技術スタック](#技術スタック)
- [インストール](#インストール)
- [使用方法](#使用方法)
- [設定](#設定)
- [翻訳履歴のダウンロード](#翻訳履歴のダウンロード)
- [貢献](#貢献)
- [ライセンス](#ライセンス)
- [お問い合わせ](#お問い合わせ)

## 🌟 特徴

- **音声入力とリアルタイム翻訳**: Whisper を使用した高精度な音声認識と ChatGPT による自然な翻訳。
- **翻訳履歴管理**: 翻訳結果を一覧で表示し、新しい順・古い順に並べ替え可能。
- **履歴のダウンロード**: 翻訳履歴を JSON 形式でダウンロードし、保存や共有が簡単。
- **設定モーダル**: API キーや言語設定、使用するデバイスの選択などを簡単に行えるユーザーインターフェース。
- **レスポンシブデザイン**: モバイルからデスクトップまで、様々なデバイスで快適に利用可能。


## 🛠 技術スタック

- **フロントエンド**:

  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [React Icons](https://react-icons.github.io/react-icons/)

- **バックエンド**:

  - [OpenAI Whisper](https://openai.com/research/whisper)
  - [ChatGPT API](https://openai.com/api/)

- **その他**:
  - [LocalStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)

## 📥 インストール

### 前提条件

- [Node.js](https://nodejs.org/) (推奨バージョン: 14.x 以上)
- [npm](https://www.npmjs.com/) または [yarn](https://yarnpkg.com/)

### 手順

1. **リポジトリをクローン**

   ```bash
   git clone git@bitbucket.org:paxcreation/echo-trans.git
   cd echo-trans
   ```

2. **依存関係のインストール**

   ```bash
   npm install
   # または
   yarn install
   ```

4. **アプリケーションの起動**

   ```bash
   npm run dev
   # または
   yarn dev
   ```

   viteが起動するのでブラウザで `http://localhost:5173` を開き、EchoTrans をお楽しみください。

## 📝 使用方法

1. **設定**

   画面右上の**設定ボタン（⚙️）**をクリックし、以下の設定を行います。

   - **API キー**: OpenAI の API キーを入力。
   - **翻訳元言語**: 音声入力の元の言語を選択。
   - **翻訳先言語**: 翻訳先の言語を選択。
   - **使用デバイス**: 音声入力に使用するデバイスを選択。

2. **音声入力**

   音声入力ボタンをクリックして、話し始めます。音声がテキストに変換され、リアルタイムで翻訳が表示されます。

3. **翻訳履歴の管理**

   翻訳結果は「Translation History」セクションに表示されます。ソートアイコンをクリックすることで、新しい順と古い順に並べ替えが可能です。

4. **履歴のダウンロード**

   「Translation History」セクションのダウンロードアイコンをクリックすると、翻訳履歴を JSON ファイルとしてダウンロードできます。

## ⚙️ 設定

設定モーダルでは、以下の項目を設定できます。

- **API キー**: OpenAI の API キーを入力・保存。
- **翻訳元言語**: 音声入力の元の言語を選択（例: 日本語、英語など）。
- **翻訳先言語**: 翻訳先の言語を選択。
- **使用デバイス**: 音声入力に使用するマイクデバイスを選択。

## 💾 翻訳履歴のダウンロード

翻訳履歴を JSON 形式でダウンロードするには、以下の手順を行います。

1. **「Translation History」セクションのダウンロードアイコン（⬇️）をクリック**。
2. **ダウンロードが自動的に開始**され、`translations-YYYYMMDD HHMMSS.json` ファイルが保存されます。

> **注意**: 翻訳履歴が存在しない場合、ダウンロードは行われません。


## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細については [LICENSE](./LICENSE) をご覧ください。

