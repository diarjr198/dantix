import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Faq = { id?: string; question: string; answer: string };

export function FaqSection({ faqs, title = 'Semua yang perlu kamu tahu' }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  const columns = [faqs.filter((_, index) => index % 2 === 0), faqs.filter((_, index) => index % 2 === 1)];
  return <section id="tentang-kami" aria-labelledby="faq-title" className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 sm:py-20"><div className="flex items-center gap-3"><h2 id="faq-title" className="shrink-0 text-3xl font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">{title}</h2><span className="hidden h-[3px] flex-1 bg-black sm:block" /></div><Accordion defaultValue={[]} className="mt-8 grid gap-x-8 lg:grid-cols-2">{columns.map((column, columnIndex) => <div key={columnIndex} className="space-y-4">{column.map((faq, rowIndex) => { const index = rowIndex * 2 + columnIndex; return <AccordionItem key={faq.id ?? index} value={faq.id ?? `faq-${index}`} className="border-2 border-black bg-white px-4 shadow-shadow"><AccordionTrigger className="text-sm font-heading no-underline hover:no-underline">{faq.question}</AccordionTrigger><AccordionContent className="text-sm leading-6 text-slate-700">{faq.answer}</AccordionContent></AccordionItem>; })}</div>)}</Accordion></section>;
}
