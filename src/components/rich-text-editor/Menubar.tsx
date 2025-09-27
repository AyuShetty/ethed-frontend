import { type Editor } from "@tiptap/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconCode, IconList, IconListNumbers, IconQuote, IconAlignLeft, IconAlignCenter, IconAlignRight, IconH1, IconH2, IconH3, IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface MenubarProps {
  editor: Editor | null;
}

export default function Menubar({ editor }: MenubarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-t-lg p-2 bg-card flex flex-wrap gap-1 items-center">
      <TooltipProvider>
        <div className="flex flex-wrap gap-1">
          {/* Undo/Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={false}
                onPressedChange={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="rounded"
              >
                <IconArrowLeft className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={false}
                onPressedChange={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="rounded"
              >
                <IconArrowRight className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("heading", { level: 1 })} 
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("rounded", editor.isActive("heading", { level: 1 }) && "bg-primary text-primary-foreground")}
              >
                <IconH1 className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("heading", { level: 2 })} 
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("rounded", editor.isActive("heading", { level: 2 }) && "bg-primary text-primary-foreground")}
              >
                <IconH2 className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("heading", { level: 3 })} 
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn("rounded", editor.isActive("heading", { level: 3 }) && "bg-primary text-primary-foreground")}
              >
                <IconH3 className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          {/* Text Formatting */}
          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("bold")} 
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                className={cn("rounded", editor.isActive("bold") && "bg-primary text-primary-foreground")}
              >
                <IconBold className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("italic")} 
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                className={cn("rounded", editor.isActive("italic") && "bg-primary text-primary-foreground")}
              >
                <IconItalic className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("underline")} 
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                className={cn("rounded", editor.isActive("underline") && "bg-primary text-primary-foreground")}
              >
                <IconUnderline className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("strike")} 
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                className={cn("rounded", editor.isActive("strike") && "bg-primary text-primary-foreground")}
              >
                <IconStrikethrough className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("code")} 
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                className={cn("rounded", editor.isActive("code") && "bg-primary text-primary-foreground")}
              >
                <IconCode className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Code</TooltipContent>
          </Tooltip>

          {/* Lists */}
          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("bulletList")} 
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("rounded", editor.isActive("bulletList") && "bg-primary text-primary-foreground")}
              >
                <IconList className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("orderedList")} 
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("rounded", editor.isActive("orderedList") && "bg-primary text-primary-foreground")}
              >
                <IconListNumbers className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          {/* Block Elements */}
          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive("blockquote")} 
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn("rounded", editor.isActive("blockquote") && "bg-primary text-primary-foreground")}
              >
                <IconQuote className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Quote</TooltipContent>
          </Tooltip>

          {/* Alignment */}
          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive({ textAlign: "left" })} 
                onPressedChange={() => editor.chain().focus().setTextAlign("left").run()} 
                className={cn("rounded", editor.isActive({ textAlign: "left" }) && "bg-primary text-primary-foreground")}
              >
                <IconAlignLeft className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive({ textAlign: "center" })} 
                onPressedChange={() => editor.chain().focus().setTextAlign("center").run()} 
                className={cn("rounded", editor.isActive({ textAlign: "center" }) && "bg-primary text-primary-foreground")}
              >
                <IconAlignCenter className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle 
                size="sm" 
                pressed={editor.isActive({ textAlign: "right" })} 
                onPressedChange={() => editor.chain().focus().setTextAlign("right").run()} 
                className={cn("rounded", editor.isActive({ textAlign: "right" }) && "bg-primary text-primary-foreground")}
              >
                <IconAlignRight className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}