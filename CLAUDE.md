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
- `src/components/settings/` - タブ化された設定UI（Basic、Audio、VAD、Advanced）
- 翻訳パイプライン: 音声 → Whisper → ChatGPT → UI

### 音声処理アーキテクチャ
- **録音モード**: 手動録音（`manual`）と自動VAD録音（`auto`）をサポート
- **VAD（Voice Activity Detection）**: 音声レベル検知による自動録音開始・停止
- **音声レベルメーター**: リアルタイム音声レベル表示とVADしきい値の可視化
- **デバイス選択**: 複数音声入力デバイスの選択機能

## 重要事項

### API連携
- WhisperとChatGPT両サービスにOpenAI APIキーが必要
- Web Audio APIでマイクアクセスを使用した音声処理
- 翻訳履歴はlocalStorageに永続化

### 状態管理パターン
- リアクティブ状態にはf-box-reactの`useRBox`を使用
- 非同期処理ではtry/catchよりもTask.of()とEitherパターンを優先
- 状態更新はリアクティブサブスクリプションを通じて自動的にUI再レンダリングをトリガー
- 状態の初期化: `RBox.pack<T>(initialValue)`でリアクティブコンテナを作成
- 状態更新: `set(rboxInstance)(newValue)`パターンを使用

### 主要データ型
- `Config`: アプリケーション設定（API Key、言語、VAD設定、録音モードなど）
- `TranslationHistory`: 翻訳履歴（原文、翻訳文、タイムスタンプ、音声URL）
- `VADSettings`: 音声検知設定（speakingThreshold、silenceThreshold、silenceDuration）
- `RecordingMode`: "manual" | "auto" の録音モード
- `SpeechModel`: "whisper-1" | "gpt-4o-mini-transcribe" の音声認識モデル

### TypeScript設定
- プロジェクト参照付きのストリクトモード有効
- アプリ設定: `tsconfig.app.json`（ES2020、React JSX）
- ビルドツール: `tsconfig.node.json`
- 厳密な型チェック有効（noUnusedLocals、noUnusedParameters）

## 実装上の重要なポイント

### f-boxリアクティブパターン
- コンポーネントで状態を読み取る: `const [value, valueBox] = useRBox(targetBox)`
- 状態を更新する: `const setValue = set(valueBox)` → `setValue(newValue)`
- 直接的な状態取得: `boxInstance.getValue()` （リアクティビティなし）

### 音声処理の実装
- Web Audio API使用時は適切なリソースクリーンアップが必要
- VAD機能は`useAudioRecorder`フック内で音声レベル監視を実装
- 録音モードに応じた条件分岐（manual/auto）が各コンポーネントで必要