'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback, useState, useEffect } from 'react';
import { useImageUpload } from '@/hooks/use-image-upload';
import MediaLibrary from '@/components/admin/media-library';

interface EnhancedRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onWordCountChange?: (wordCount: number, charCount: number, readingTime: number) => void;
}

export default function EnhancedRichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  onWordCountChange 
}: EnhancedRichTextEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadImage, isUploading, uploadProgress } = useImageUpload();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 shadow-md cursor-pointer',
        },
        inline: false,
        allowBase64: true, // Allow base64 for loading placeholders
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
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
            }
            return true;
          }
        }
        return false;
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      // Validate URL format
      try {
        new URL(url);
        editor.chain().focus().setImage({ 
          src: url,
          alt: 'Image from URL',
          title: 'Image from URL'
        }).run();
      } catch (error) {
        alert('Please enter a valid image URL');
      }
    }
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;

    try {
      // Create a unique placeholder ID for this upload
      const placeholderId = `uploading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert loading placeholder
      const loadingImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEycHgiIGZpbGw9IiM5OTk5OTkiPlVwbG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=';
      
      editor.chain().focus().setImage({ 
        src: loadingImageSrc,
        alt: placeholderId
      }).run();

      // Upload to Firebase Storage
      const result = await uploadImage(file, 'articles');
      
      // Replace loading image with actual uploaded image
      const { state } = editor;
      const { doc } = state;
      let imagePos = -1;
      
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.alt === placeholderId) {
          imagePos = pos;
          return false;
        }
      });
      
      if (imagePos !== -1) {
        // Use transaction to ensure the replacement happens atomically
        const tr = state.tr;
        tr.setNodeMarkup(imagePos, null, {
          src: result.url,
          alt: file.name || 'Uploaded image',
          title: file.name || 'Uploaded image'
        });
        editor.view.dispatch(tr);
      } else {
        // Fallback: if we can't find the placeholder, just insert the image at cursor
        editor.chain().focus().setImage({ 
          src: result.url, 
          alt: file.name || 'Uploaded image' 
        }).run();
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Try to remove the loading placeholder on error
      const { state } = editor;
      const { doc } = state;
      
      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.alt && node.attrs.alt.startsWith('uploading-')) {
          const tr = state.tr;
          tr.delete(pos, pos + node.nodeSize);
          editor.view.dispatch(tr);
          return false;
        }
      });
      
      // Show error message to user
      alert('Failed to upload image. Please try again.');
    }
  }, [editor, uploadImage]);

  const addImageFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  }, [handleImageUpload]);

  const insertImageFromLibrary = useCallback((imageUrl: string, imageName?: string) => {
    if (editor) {
      editor.chain().focus().setImage({ 
        src: imageUrl,
        alt: imageName || 'Image from library',
        title: imageName || 'Image from library'
      }).run();
      setShowMediaLibrary(false);
    }
  }, [editor]);

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
          disabled={isUploading}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100 disabled:opacity-50"
          title="Upload image file"
        >
          {isUploading ? '⏳' : '📁'} Upload
        </button>
        <button
          type="button"
          onClick={() => setShowMediaLibrary(true)}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100"
          title="Choose from media library"
        >
          📚 Library
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
        
        {/* Image alignment buttons - only show when image is selected */}
        {editor.isActive('image') && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => {
                // Add left alignment class to selected image
                const { state } = editor;
                const { from } = state.selection;
                const node = state.doc.nodeAt(from);
                if (node && node.type.name === 'image') {
                  const tr = state.tr;
                  tr.setNodeMarkup(from, null, {
                    ...node.attrs,
                    class: 'max-w-full h-auto rounded-lg my-4 shadow-md float-left mr-4 mb-4'
                  });
                  editor.view.dispatch(tr);
                }
              }}
              className="px-2 py-1 text-sm rounded hover:bg-gray-100"
              title="Align image left"
            >
              ⬅️
            </button>
            <button
              type="button"
              onClick={() => {
                // Add center alignment class to selected image
                const { state } = editor;
                const { from } = state.selection;
                const node = state.doc.nodeAt(from);
                if (node && node.type.name === 'image') {
                  const tr = state.tr;
                  tr.setNodeMarkup(from, null, {
                    ...node.attrs,
                    class: 'max-w-full h-auto rounded-lg my-4 shadow-md mx-auto block'
                  });
                  editor.view.dispatch(tr);
                }
              }}
              className="px-2 py-1 text-sm rounded hover:bg-gray-100"
              title="Center image"
            >
              ↔️
            </button>
            <button
              type="button"
              onClick={() => {
                // Add right alignment class to selected image
                const { state } = editor;
                const { from } = state.selection;
                const node = state.doc.nodeAt(from);
                if (node && node.type.name === 'image') {
                  const tr = state.tr;
                  tr.setNodeMarkup(from, null, {
                    ...node.attrs,
                    class: 'max-w-full h-auto rounded-lg my-4 shadow-md float-right ml-4 mb-4'
                  });
                  editor.view.dispatch(tr);
                }
              }}
              className="px-2 py-1 text-sm rounded hover:bg-gray-100"
              title="Align image right"
            >
              ➡️
            </button>
          </>
        )}
        
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
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="border-b border-gray-200 px-4 py-2 bg-blue-50">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-blue-700">Uploading image...</div>
            <div className="flex-1 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <div className="text-xs text-blue-600">
              {Math.round(uploadProgress.progress)}%
            </div>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <div 
        className={`min-h-[300px] relative ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
      >
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
        
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center border-2 border-dashed border-blue-300 rounded">
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-blue-700 font-medium">Drop images here to upload</div>
            </div>
          </div>
        )}
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

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Choose Image</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <MediaLibrary
                onSelectImage={insertImageFromLibrary}
                type="articles"
                selectionMode={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}