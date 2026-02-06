import React from 'react';
import { Message } from '../types';
import { CrossIcon, FileIcon } from './Icons';

interface MessageBubbleProps {
  message: Message;
}

const parseInline = (text: string) => {
    // Basic inline parsing for bold, italic
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
            return <em key={index} className="italic opacity-90">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const formatText = (text: string, isFirstMessage: boolean) => {
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((paragraph, i) => {
    // Headers (### )
    if (paragraph.startsWith('### ')) {
        return (
            <h3 key={i} className="text-lg md:text-xl font-display font-bold text-royal-800 mt-5 mb-2 border-b border-gold-300/30 pb-1">
                {parseInline(paragraph.replace(/^###\s+/, ''))}
            </h3>
        );
    }
     // Headers (## )
     if (paragraph.startsWith('## ')) {
        return (
            <h2 key={i} className="text-xl md:text-2xl font-display font-bold text-royal-900 mt-6 mb-3">
                {parseInline(paragraph.replace(/^##\s+/, ''))}
            </h2>
        );
    }

    // Blockquotes (> )
    if (paragraph.startsWith('> ')) {
        return (
            <blockquote key={i} className="border-l-4 border-gold-400 pl-4 py-2 my-4 italic text-base md:text-lg text-church-800 bg-gold-50/50 rounded-r-lg">
                 {parseInline(paragraph.replace(/^>\s+/, ''))}
            </blockquote>
        );
    }

    // Lists
    if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        const listItems = paragraph.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
        if(listItems.length > 0) {
            return (
                <ul className="list-none pl-1 md:pl-2 my-3 space-y-2" key={i}>
                {listItems.map((item, k) => (
                    <li key={k} className="flex gap-3 items-start">
                        <span className="text-gold-500 mt-1.5 text-[10px]">◆</span>
                        <span className="leading-relaxed text-church-900 text-base md:text-[1.05rem]">{parseInline(item.replace(/^[-*]\s/, ''))}</span>
                    </li>
                ))}
                </ul>
            )
        }
    }

    // Standard Paragraph
    const isVeryFirst = isFirstMessage && i === 0 && !paragraph.startsWith('**');
    
    return (
      <p key={i} className={`mb-3 md:mb-4 last:mb-0 leading-relaxed text-base md:text-[1.05rem] text-church-900 ${isVeryFirst ? 'first-letter:text-4xl first-letter:font-display first-letter:text-gold-600 first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-6px]' : ''}`}>
        {parseInline(paragraph)}
      </p>
    );
  });
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isWelcome = message.id === 'welcome';
  const isEmpty = !message.content || message.content.trim() === '';

  return (
    <div 
        id={`msg-${message.id}`} 
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up mb-2 px-1 scroll-mt-24`}
    >
      <div
        className={`flex flex-col max-w-[95%] md:max-w-[80%] lg:max-w-[70%] rounded-2xl transition-all relative ${
           isUser ? 'items-end' : 'items-start'
        }`}
      >
          <div className={`w-full px-5 py-4 md:px-7 md:py-6 rounded-2xl shadow-sm relative overflow-hidden ${
            isUser
                ? 'bg-gradient-to-br from-royal-900 to-royal-800 text-white rounded-tr-sm'
                : 'bg-white text-church-900 border border-church-100 rounded-tl-sm shadow-md'
            }`}>
            
            {/* Texture Overlay for User */}
            {isUser && (
                <div className="absolute inset-0 bg-leather-texture opacity-20 pointer-events-none mix-blend-overlay"></div>
            )}

            {/* AI Header Badge */}
            {!isUser && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gold-100">
                <div className="text-gold-600 bg-gold-50 p-1 rounded-full border border-gold-200">
                    <CrossIcon className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-display font-bold text-gold-600 tracking-[0.2em] uppercase">Divine Assistant</span>
            </div>
            )}

            {/* Attachment Indicator */}
            {message.attachment && (
              <div className={`mb-3 flex items-center gap-3 p-3 rounded-lg text-xs font-serif italic ${
                isUser ? 'bg-white/10 border border-white/10' : 'bg-church-50 border border-church-200'
              }`}>
                <FileIcon />
                <span className="truncate max-w-[180px]">{message.attachment.name}</span>
              </div>
            )}

            <div className={`font-serif relative z-10 ${isUser ? 'text-base font-sans font-light tracking-wide text-gold-50/90' : ''}`}>
                {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                ) : (
                    <div>
                        {isEmpty ? (
                           <div className="flex items-center gap-1.5 py-1">
                               <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                               <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                               <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                           </div>
                        ) : (
                            formatText(message.content, isWelcome)
                        )}
                    </div>
                )}
            </div>

            <div
                className={`text-[10px] mt-3 text-right font-sans uppercase tracking-wider flex items-center justify-end gap-1 opacity-60 ${
                isUser ? 'text-gold-200' : 'text-church-400'
                }`}
            >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
      </div>
    </div>
  );
};

export default MessageBubble;