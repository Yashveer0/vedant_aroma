"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button'; // shadcn/ui बटन

// Tiptap के लिए टूलबार कंपोनेंट
const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input bg-transparent rounded-t-md p-2 flex items-center gap-2 flex-wrap">
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        Strike
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        List
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Button>
    </div>
  );
};

// मुख्य रिच टेक्स्ट एडिटर कंपोनेंट
interface RichTextEditorProps {
  content: string;
  onChange: (richText: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // यहाँ आप बुलेट लिस्ट, हेडिंग आदि को कॉन्फ़िगर कर सकते हैं
      }),
    ],
    content: content,
    // जब एडिटर में कुछ भी टाइप किया जाता है, तो यह onChange फ़ंक्शन को कॉल करता है
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    // एडिटर को shadcn/ui जैसा दिखाने के लिए स्टाइलिंग
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert min-h-[250px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
    // यह SSR एरर से बचाता है, लेकिन हम इसे डायनामिक इम्पोर्ट से भी संभाल रहे हैं
    immediatelyRender: false, 
  });

  return (
    <div className="flex flex-col">
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

// इसे डिफ़ॉल्ट रूप से एक्सपोर्ट करें
export default RichTextEditor;