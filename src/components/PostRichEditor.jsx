import React, { useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  ImagePlus,
  Heading2,
  Heading3,
  Quote,
} from "lucide-react";

/**
 * PostRichEditor - A contenteditable-based rich text editor with toolbar.
 * Toolbar: Bold, Italic, Underline, Headings, Lists, Blockquote, Link, Add image.
 * onImageSelect: optional () => Promise<string | null> - when provided, used for file upload flow.
 */
function PostRichEditor({
  value = "",
  onChange,
  placeholder = "Write your post...",
  disabled = false,
  minHeight = "200px",
  onImageSelect,
  className = "",
}) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value && !isInternalChange.current) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    isInternalChange.current = true;
    const html = editorRef.current.innerHTML;
    onChange?.(html);
    isInternalChange.current = false;
  }, [onChange]);

  const execCommand = useCallback((cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleInput();
  }, [handleInput]);

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) execCommand("createLink", url);
  }, [execCommand]);

  const handleImageClick = useCallback(async () => {
    let url = null;
    if (onImageSelect) {
      url = await onImageSelect();
    } else {
      url = prompt("Enter image URL:");
    }
    if (url && editorRef.current) {
      editorRef.current.focus();
      // Use insertHTML for better compatibility with long URLs (e.g. presigned S3)
      try {
        const sel = window.getSelection();
        if (sel?.rangeCount) {
          const range = sel.getRangeAt(0);
          const img = document.createElement("img");
          img.src = url;
          img.alt = "";
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          range.insertNode(img);
          range.setStartAfter(img);
          range.setEndAfter(img);
          sel.removeAllRanges();
          sel.addRange(range);
          handleInput();
          return;
        }
      } catch {
        /* fallback to execCommand */
      }
      execCommand("insertImage", url);
    }
  }, [onImageSelect, execCommand, handleInput]);

  const formatBlock = useCallback((tag) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    handleInput();
  }, [handleInput]);

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-600">
        <ToolbarButton
          onClick={() => execCommand("bold")}
          disabled={disabled}
          title="Bold"
          icon={<Bold className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={() => execCommand("italic")}
          disabled={disabled}
          title="Italic"
          icon={<Italic className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={() => execCommand("underline")}
          disabled={disabled}
          title="Underline"
          icon={<Underline className="w-4 h-4" />}
        />
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <ToolbarButton
          onClick={() => formatBlock("h2")}
          disabled={disabled}
          title="Heading 2"
          icon={<Heading2 className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={() => formatBlock("h3")}
          disabled={disabled}
          title="Heading 3"
          icon={<Heading3 className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={() => formatBlock("blockquote")}
          disabled={disabled}
          title="Quote"
          icon={<Quote className="w-4 h-4" />}
        />
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <ToolbarButton
          onClick={() => execCommand("insertUnorderedList")}
          disabled={disabled}
          title="Bullet list"
          icon={<List className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={() => execCommand("insertOrderedList")}
          disabled={disabled}
          title="Numbered list"
          icon={<ListOrdered className="w-4 h-4" />}
        />
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <ToolbarButton
          onClick={handleLink}
          disabled={disabled}
          title="Link"
          icon={<Link className="w-4 h-4" />}
        />
        <ToolbarButton
          onClick={handleImageClick}
          disabled={disabled}
          title="Add image"
          icon={<ImagePlus className="w-4 h-4" />}
        />
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        data-placeholder={placeholder}
        className="post-rich-editor prose prose-sm dark:prose-invert max-w-none p-4 outline-none min-h-[200px] focus:ring-0 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 [&:empty::before]:content-[attr(data-placeholder)] [&:empty::before]:text-gray-400 [&:empty::before]:dark:text-gray-500"
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}

function ToolbarButton({ onClick, disabled, title, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
    </button>
  );
}

export default PostRichEditor;
