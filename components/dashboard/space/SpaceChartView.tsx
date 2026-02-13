"use client";

export function SpaceChartView() {
	return (
		<div className="flex-1 flex items-center justify-center bg-slate-50/50 p-10 animate-[fadeInUp_0.3s_ease-out]">
			<div className="text-center">
				<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
					<span className="text-2xl font-bold">📈</span>
				</div>
				<h3 className="text-lg font-semibold text-slate-900 mb-2">Space Chart View</h3>
				<p className="text-slate-500 max-w-sm mx-auto">
					Detailed analytics and chart visualizations for your sales team data.
				</p>
			</div>
		</div>
	);
}
