'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback, useState, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onWordCountChange?: (wordCount: number, charCount: number, readingTime: number) => void;
}

export default function RichTextEditor({ content, onChange, placeholder, onWordCountChange }: RichTextEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Calculate word count, character count, and reading time
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const readTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute
      
      setWordCount(words);
      setCharCount(chars);
      setReadingTime(readTime);
      
      if (onWordCountChange) {
        onWordCountChange(words, chars, readTime);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addImageFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        try {
          // Create a temporary URL for immediate preview
          const tempUrl = URL.createObjectURL(file);
          editor.chain().focus().setImage({ src: tempUrl }).run();
          
          // Note: This is a simplified approach for file upload preview
          // The actual upload integration is handled by the enhanced rich text editor
          console.log('File selected for upload:', file.name);
          
          // For now, we'll keep the temporary URL
          // The actual upload integration will be handled by the image upload modal
        } catch (error) {
          console.error('Error handling image upload:', error);
        }
      }
    };
    input.click();
  }, [editor]);

  // Update counts when content changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const readTime = Math.max(1, Math.ceil(words / 200));
      
      setWordCount(words);
      setCharCount(chars);
      setReadingTime(readTime);
      
      if (onWordCountChange) {
        onWordCountChange(words, chars, readTime);
      }
    }
  }, [content, editor, onWordCountChange]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('bold') ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('italic') ? 'bg-gray-200 italic' : ''
          }`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('strike') ? 'bg-gray-200 line-through' : ''
          }`}
        >
          Strike
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          H3
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
        >
          1. List
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          }`}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 font-mono ${
            editor.isActive('code') ? 'bg-gray-200' : ''
          }`}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 font-mono ${
            editor.isActive('codeBlock') ? 'bg-gray-200' : ''
          }`}
        >
          Code Block
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 text-sm rounded hover:bg-gray-100 ${
            editor.isActive('link') ? 'bg-gray-200' : ''
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={addImage}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100"
          title="Add image from URL"
        >
          🖼️ URL
        </button>
        <button
          type="button"
          onClick={addImageFromFile}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100"
          title="Upload image file"
        >
          📁 File
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100"
          title="Insert horizontal rule"
        >
          ―
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100 disabled:opacity-50"
          title="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100 disabled:opacity-50"
          title="Redo"
        >
          ↷
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().clearContent().run()}
          className="px-2 py-1 text-sm rounded hover:bg-red-100 text-red-600"
          title="Clear all content"
        >
          🗑️
        </button>
      </div>
      
      {/* Editor Content */}
      <div className="min-h-[300px]">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>
      
      {/* Statistics Footer */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex space-x-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>{readingTime} min read</span>
        </div>
        <div className="text-gray-400">
          {editor?.isFocused ? 'Editing...' : 'Ready'}
        </div>
      </div>
    </div>
  );
}