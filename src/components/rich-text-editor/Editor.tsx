"use client";
import {useEditor, EditorContent} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Menubar from "./Menubar";
import { useEffect } from "react";
import TextAlign from "@tiptap/extension-text-align";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export function RichTextEditor({ value = "", onChange, onBlur }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({
      types: ['heading', 'paragraph'],
    })],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onBlur,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border rounded-md">
      <Menubar editor={editor}/>
      <div className="border-t">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}