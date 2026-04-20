'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';

export type FaqItemData = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItemData[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-nox-border2 divide-y">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="border-nox-border2 border-b last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 py-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-nox-txt text-[17px] font-semibold tracking-tight">
                {item.question}
              </span>
              <span
                className={cn(
                  'border-nox-border text-nox-txt3 flex size-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-300',
                  isOpen && 'border-nox-accent bg-nox-accent text-nox-bg rotate-180',
                )}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <p className="text-nox-txt2 pb-6 text-[15px] font-light leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
