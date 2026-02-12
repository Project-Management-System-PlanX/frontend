import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

export function SpaceFormsView() {
	return (
		<div className="flex-1 flex flex-col items-center justify-center bg-white animate-[fadeInUp_0.35s_ease-out] p-8 overflow-hidden h-full">
			<div className="max-w-2xl w-full flex flex-col items-center text-center -mt-10">
				<h2 className="text-[20px] font-bold text-slate-900 mb-2">
					The simple way to collect and track work requests
				</h2>
				<p className="text-[14px] text-slate-500 mb-12 max-w-md mx-auto">
					Use forms to seamlessly create work from stakeholder requests.
				</p>

				{/* Visual Illustration */}
				<div className="relative w-[500px] h-[240px] mb-12 mx-auto">
					{/* Background Blobs */}
					<div className="absolute left-[60px] top-[20px] w-[140px] h-[160px] bg-yellow-100/50 rounded-xl -rotate-3 blur-md transform scale-110" />
					<div className="absolute right-[60px] top-[30px] w-[160px] h-[140px] bg-green-100/50 rounded-full blur-md transform scale-110" />

					{/* Form Card (Left) */}
					<motion.div
						initial={{ x: -25, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
						className="absolute left-[40px] top-[30px] w-[180px] h-[200px] bg-white border border-slate-200 rounded-lg shadow-lg flex flex-col p-4 z-10"
					>
						<div className="flex items-center justify-between mb-4">
							<span className="text-[12px] font-bold text-slate-800">Submit a form</span>
							<div className="w-2 h-2 rounded-full bg-slate-200" />
						</div>
						<div className="space-y-3">
							<div className="h-2 w-3/4 bg-slate-100 rounded" />
							<div className="h-8 w-full bg-slate-50 border border-slate-100 rounded" />
							<div className="h-2 w-1/2 bg-slate-100 rounded" />
							<div className="h-8 w-full bg-slate-50 border border-slate-100 rounded" />
						</div>
					</motion.div>

					{/* Arrow Path */}
					<svg
						className="absolute top-[80px] left-[230px] w-[60px] h-[60px] z-0 pointer-events-none stroke-slate-300 fill-none"
						viewBox="0 0 60 60"
						role="img"
					>
						<title>Workflow Illustration</title>
						<motion.path
							d="M 0 30 C 20 20, 40 40, 60 30"
							strokeWidth="2"
							strokeDasharray="4 4"
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ delay: 0.8, duration: 0.8 }}
						/>
						<motion.path
							d="M 52 24 L 60 30 L 50 36"
							strokeWidth="2"
							strokeLinecap="round"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1.6 }}
						/>
					</svg>

					{/* Table Card (Right) */}
					<motion.div
						initial={{ x: 25, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
						className="absolute right-[40px] top-[50px] w-[200px] h-[150px] bg-[#1e293b] border border-slate-700 rounded-lg shadow-xl flex flex-col p-3 z-0 overflow-hidden"
					>
						<div className="flex items-center justify-between mb-3 text-slate-300">
							<span className="text-[11px] font-semibold text-white">Track requests</span>
							<Plus className="w-3 h-3 text-slate-500" />
						</div>
						<div className="space-y-2">
							{/* Header Row */}
							<div className="flex items-center gap-2 mb-1 opacity-50">
								<div className="h-1.5 w-8 bg-slate-600 rounded-full" />
								<div className="h-1.5 w-4 bg-slate-600 rounded-full ml-auto" />
								<div className="h-1.5 w-4 bg-slate-600 rounded-full" />
							</div>
							{/* Row 1 */}
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: "100%" }}
								transition={{ delay: 1.8, duration: 0.5 }}
								className="h-6 bg-slate-700/50 rounded flex items-center px-1.5 gap-2 overflow-hidden"
							>
								<div className="h-1 w-10 bg-slate-500 rounded-full shrink-0" />
								<div className="h-1 w-6 bg-blue-500 rounded-full ml-auto opacity-70 shrink-0" />
							</motion.div>
							{/* Row 2 */}
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: "100%" }}
								transition={{ delay: 2.0, duration: 0.5 }}
								className="h-6 bg-slate-700/50 rounded flex items-center px-1.5 gap-2 overflow-hidden"
							>
								<div className="h-1 w-12 bg-slate-500 rounded-full shrink-0" />
								<div className="h-1 w-6 bg-green-500 rounded-full ml-auto opacity-70 shrink-0" />
							</motion.div>
							{/* Row 3 */}
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: "100%" }}
								transition={{ delay: 2.2, duration: 0.5 }}
								className="h-6 bg-slate-700/50 rounded flex items-center px-1.5 gap-2 overflow-hidden"
							>
								<div className="h-1 w-8 bg-slate-500 rounded-full shrink-0" />
								<div className="h-1 w-6 bg-purple-500 rounded-full ml-auto opacity-70 shrink-0" />
							</motion.div>
						</div>
					</motion.div>

					{/* Sparkles */}
					<motion.div
						animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: [0, 45, 90] }}
						transition={{ repeat: Infinity, duration: 3, delay: 1 }}
						className="absolute -top-4 left-[200px] text-yellow-400"
					>
						<Sparkles className="w-5 h-5 fill-current" />
					</motion.div>
					<motion.div
						animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, -45, -90] }}
						transition={{ repeat: Infinity, duration: 3.5, delay: 2 }}
						className="absolute bottom-0 right-[220px] text-blue-400"
					>
						<Sparkles className="w-4 h-4 fill-current" />
					</motion.div>
					<motion.div
						animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
						transition={{ repeat: Infinity, duration: 4, delay: 1.5 }}
						className="absolute top-[60px] right-[20px] text-green-400"
					>
						<Sparkles className="w-3 h-3 fill-current" />
					</motion.div>
				</div>

				<div className="grid grid-cols-2 gap-16 w-full max-w-[500px] mb-12">
					<div className="text-center">
						<h3 className="text-[13px] font-bold text-slate-800 mb-1">Capture key details</h3>
						<p className="text-[12px] text-slate-500">and raise requests</p>
					</div>
					<div className="text-center">
						<h3 className="text-[13px] font-bold text-slate-800 mb-1">Prioritize work</h3>
						<p className="text-[12px] text-slate-500">on your board or list</p>
					</div>
				</div>

				<button
					type="button"
					className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[4px] font-medium text-[13px] transition-all hover:shadow-md active:scale-95 group shadow-sm z-20 relative"
				>
					<Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Create form
				</button>
			</div>
		</div>
	);
}
