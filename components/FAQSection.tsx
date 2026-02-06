"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

type FAQItem = {
	question: string;
	answer: string;
};
type FAQSectionProps = {
	title?: string;
	faqs?: FAQItem[];
};
const defaultFAQs: FAQItem[] = [
	{
		question: "What is TeamUp and how does it work?",
		answer:
			"TeamUp is an AI-powered intelligence layer that connects all your communication tools—calls, chats, and meetings—into a unified system. It analyzes conversations in real-time to provide insights on sentiment, tone, team alignment, and collaboration patterns. Simply integrate TeamUp with your existing tools like Slack, Zoom, or Microsoft Teams, and start gaining actionable insights immediately.",
	},
	{
		question: "How does TeamUp use my data to build a custom AI chat?",
		answer:
			"TeamUp processes your communication data using advanced natural language processing and machine learning models. All data is encrypted end-to-end and processed in compliance with enterprise-grade security standards. Your data is never shared with third parties, and you maintain complete control over what gets analyzed. The AI learns from patterns in your team's communication to provide personalized insights specific to your organization.",
	},
	{
		question: "How do I get started with TeamUp and what are the pricing options?",
		answer:
			"Getting started is simple: sign up for a free trial, connect your communication tools, and start analyzing within minutes. We offer flexible pricing tiers: Starter (free for small teams), Professional ($29/user/month), and Enterprise (custom pricing with dedicated support). All plans include core features like sentiment analysis and real-time insights. Contact our sales team for volume discounts and custom enterprise solutions.",
	},
];
export const FAQSection = ({
	title = "Frequently asked questions",
	faqs = defaultFAQs,
}: FAQSectionProps) => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};
	return (
		<section className="w-full py-24 px-8 bg-white">
			<div className="max-w-7xl mx-auto">
				<div className="grid lg:grid-cols-12 gap-16">
					{/* Left Column - Title */}
					<div className="lg:col-span-4">
						<h2
							className="text-[40px] leading-tight font-normal text-[#202020] tracking-tight sticky top-24"
							style={{
								fontFamily: "var(--font-figtree), Figtree",
								fontWeight: "400",
								fontSize: "40px",
							}}
						>
							{title}
						</h2>
					</div>

					{/* Right Column - FAQ Items */}
					<div className="lg:col-span-8">
						<div className="space-y-0">
							{faqs.map((faq, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: simple static faq list
								<div key={index} className="border-b border-[#e5e5e5] last:border-b-0">
									<button
										type="button"
										onClick={() => toggleFAQ(index)}
										className="w-full flex items-center justify-between py-6 text-left group hover:opacity-70 transition-opacity duration-150"
										aria-expanded={openIndex === index}
									>
										<span
											className="text-lg leading-7 text-[#202020] pr-8"
											style={{
												fontFamily: "var(--font-figtree), Figtree",
												fontWeight: "400",
											}}
										>
											{faq.question}
										</span>
										<motion.div
											animate={{
												rotate: openIndex === index ? 45 : 0,
											}}
											transition={{
												duration: 0.2,
												ease: [0.4, 0, 0.2, 1],
											}}
											className="flex-shrink-0"
										>
											<Plus className="w-6 h-6 text-[#202020]" strokeWidth={1.5} />
										</motion.div>
									</button>

									<AnimatePresence initial={false}>
										{openIndex === index && (
											<motion.div
												initial={{
													height: 0,
													opacity: 0,
												}}
												animate={{
													height: "auto",
													opacity: 1,
												}}
												exit={{
													height: 0,
													opacity: 0,
												}}
												transition={{
													duration: 0.3,
													ease: [0.4, 0, 0.2, 1],
												}}
												className="overflow-hidden"
											>
												<div className="pb-6 pr-12">
													<p
														className="text-lg leading-6 text-[#666666]"
														style={{
															fontFamily: "var(--font-figtree), Figtree",
														}}
													>
														{faq.answer}
													</p>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
