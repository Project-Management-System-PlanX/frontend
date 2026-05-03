"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

// Small wrapper so heavy emoji-mart data + UI live in their own chunk
// and can be dynamically imported where needed.

// biome-ignore lint/suspicious/noExplicitAny: emoji-mart types aren't exported
export interface EmojiPickerProps {
	onSelect: (emoji: any) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
	return (
		<Picker
			data={data}
			onEmojiSelect={onSelect}
			theme="light"
			previewPosition="none"
			skinTonePosition="none"
			maxFrequentRows={2}
		/>
	);
}
