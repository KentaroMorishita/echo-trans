# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

EchoTransは、OpenAIのWhisper音声認識とChatGPTを組み合わせたリアルタイム音声翻訳アプリケーションです。React、TypeScript、Viteで構築されています。

## 開発コマンド

```bash
# 開発サーバー起動（ポート5173）
npm run dev

# プロダクションビルド
npm run build

# コードリンティング
npm run lint

# プロダクションビルドのプレビュー
npm run preview
```

## 主要アーキテクチャ

### f-boxによる状態管理
- **f-box-core**と**f-box-react**を使用した関数型リアクティブプログラミング
- 状態コンテナは**RBox**（リアクティブボックス）で管理
- 非同期処理は従来のPromiseではなく**Task**と**Either**モナドを使用
- 主要な状態ファイル:
  - `src/box/config.ts` - アプリケーション設定状態
  - `src/box/translations.ts` - 翻訳履歴状態

### サービスアーキテクチャ
- `src/services/handleAudioData.ts` - 音声テキスト変換用Whisper API連携
- `src/services/handleTranslation.ts` - 翻訳用ChatGPT API連携
- `src/services/arrayRBoxHandlers.ts` - RBox内配列状態管理ユーティリティ

### コンポーネント構造
- `src/components/AudioRecorder.tsx` - Web Audio APIを使用するメイン録音インターフェース
- `src/hooks/useAudioRecorder.ts` - VAD付きコア音声録音ロジック
- 翻訳パイプライン: 音声 → Whisper → ChatGPT → UI

## 重要事項

### API連携
- WhisperとChatGPT両サービスにOpenAI APIキーが必要
- Web Audio APIでマイクアクセスを使用した音声処理
- 翻訳履歴はlocalStorageに永続化

### 状態管理パターン
- リアクティブ状態にはf-box-reactの`useRBox`を使用
- 非同期処理ではtry/catchよりもTask.of()とEitherパターンを優先
- 状態更新はリアクティブサブスクリプションを通じて自動的にUI再レンダリングをトリガー

### TypeScript設定
- プロジェクト参照付きのストリクトモード有効
- アプリ設定: `tsconfig.app.json`（ES2020、React JSX）
- ビルドツール: `tsconfig.node.json`