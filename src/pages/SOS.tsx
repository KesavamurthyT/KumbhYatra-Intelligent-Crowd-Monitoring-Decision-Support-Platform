import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

const safetyTips = [
	{
		icon: "⚡",
		textKey: "keepPhoneCharged",
	},
	{
		icon: "👥",
		textKey: "stayWithGroup",
	},
	{
		icon: "📍",
		textKey: "knowLocation",
	},
];

const SOS_API_BASE = "http://localhost:3001/api";

export default function SOS() {
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const holdRef = useRef(false);
	const [isCreatingIncident, setIsCreatingIncident] = useState(false);
	const { t } = useTranslation();

	// Dynamic emergency types based on current language
	const emergencyTypes = [
		{
			key: "medical",
			icon: "❤️",
			title: t.sos.medical,
			desc: t.sos.emergencyDescriptions.medical,
			severity: "critical",
		},
		{
			key: "security",
			icon: "🛡️",
			title: t.sos.security,
			desc: t.sos.emergencyDescriptions.security,
			severity: "high",
		},
		{
			key: "lost_person",
			icon: "👤",
			title: t.sos.lost,
			desc: t.sos.emergencyDescriptions.lost,
			severity: "medium",
		},
		{
			key: "other",
			icon: "⚠️",
			title: t.sos.other,
			desc: t.sos.emergencyDescriptions.other,
			severity: "high",
		},
	];

	const getCurrentLocation = (): Promise<{ lat: number; lng: number; text: string }> => {
		return new Promise((resolve, reject) => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						resolve({
							lat: position.coords.latitude,
							lng: position.coords.longitude,
							text: "Current location (GPS)"
						});
					},
					(error) => {
						console.warn("GPS not available:", error);
						// Fallback to Har Ki Pauri coordinates (main Kumbh area)
						resolve({
							lat: 29.9457,
							lng: 78.1642,
							text: "Har Ki Pauri area (default location)"
						});
					}
				);
			} else {
				// Fallback to default location
				resolve({
					lat: 29.9457,
					lng: 78.1642,
					text: "Har Ki Pauri area (default location)"
				});
			}
		});
	};

	const createSOSIncident = async (type: string, severity: string, message: string = "") => {
		setIsCreatingIncident(true);
		try {
			// Get current location
			const location = await getCurrentLocation();
			
			// Get user data
			const userData = localStorage.getItem("kumbh-user");
			const userId = userData ? JSON.parse(userData).id : null;

			const incidentData = {
				type,
				severity,
				message: message || `Emergency assistance needed: ${type}`,
				location,
				userId
			};

			console.log("Creating SOS incident:", incidentData);

			const response = await fetch(`${SOS_API_BASE}/sos`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(incidentData),
			});

			const result = await response.json();

			if (result.ok) {
				toast.success(`🚨 ${t.sos.success}`, {
					description: `Incident ID: ${result.incident.incidentId.slice(0, 8)}... | Status: ${result.incident.status}`,
					duration: 5000,
				});
				
				console.log("SOS incident created successfully:", result.incident);
				return result.incident;
			} else {
				throw new Error(result.error || "Failed to create SOS incident");
			}
		} catch (error) {
			console.error("Error creating SOS incident:", error);
			toast.error(t.sos.error, {
				description: error instanceof Error ? error.message : "Please try again or contact emergency services directly",
				duration: 5000,
			});
			return null;
		} finally {
			setIsCreatingIncident(false);
		}
	};

	const handleSOSPress = () => {
		holdRef.current = true;
		timerRef.current = setTimeout(() => {
			if (holdRef.current) {
				activateSOS();
			}
		}, 3000);
	};

	const handleSOSRelease = () => {
		holdRef.current = false;
		if (timerRef.current) clearTimeout(timerRef.current);
	};

	const activateSOS = async () => {
		await createSOSIncident("other", "critical", "Emergency SOS button activated - immediate assistance needed");
	};

	const handleEmergencyTypeClick = async (type: any) => {
		await createSOSIncident(type.key, type.severity, `${type.title} - ${type.desc}`);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col items-center pb-8">
			{/* Header Section */}
			<div className="w-full bg-gradient-to-r from-red-600 to-red-400 py-8 px-4 rounded-b-3xl shadow-md text-center">
				<h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
					{t.sos.title}
				</h1>
				<p className="text-lg text-red-100">
					{t.sos.subtitle}
				</p>
			</div>

			{/* Central SOS Button */}
			<div className="flex flex-col items-center mt-[-3rem] mb-8">
				<button
					className={`w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex flex-col items-center justify-center shadow-2xl border-4 border-white text-white text-3xl font-bold select-none active:scale-95 transition-all ${
						isCreatingIncident ? "opacity-75 cursor-not-allowed" : ""
					}`}
					onMouseDown={handleSOSPress}
					onMouseUp={handleSOSRelease}
					onMouseLeave={handleSOSRelease}
					onTouchStart={handleSOSPress}
					onTouchEnd={handleSOSRelease}
					disabled={isCreatingIncident}
					aria-label="Activate SOS"
				>
					<span className="text-5xl mb-2">
						{isCreatingIncident ? "⏳" : "🛡️"}
					</span>
					<span>{isCreatingIncident ? "..." : "SOS"}</span>
				</button>
				<p className="mt-4 text-gray-600 text-sm">
					{isCreatingIncident ? t.sos.creating : t.sos.pressHoldInstruction}
				</p>
			</div>

			{/* Emergency Types Section */}
			<div className="w-full max-w-5xl px-4 mb-8">
				<h2 className="text-xl font-semibold mb-4 text-red-700">
					{t.sos.emergencyTypes}
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{emergencyTypes.map((type) => (
						<div
							key={type.key}
							className={`bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition cursor-pointer group ${
								isCreatingIncident ? "opacity-75 cursor-not-allowed" : ""
							}`}
							onClick={() => !isCreatingIncident && handleEmergencyTypeClick(type)}
							role="button"
							tabIndex={0}
						>
							<span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
								{type.icon}
							</span>
							<h3 className="font-bold text-lg text-red-700 mb-1">
								{type.title}
							</h3>
							<p className="text-gray-600 text-center text-sm">
								{type.desc}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* Emergency Contacts Section */}
			<div className="w-full max-w-3xl px-4 mb-8">
				<h2 className="text-xl font-semibold text-red-700 mb-1">
					{t.sos.emergencyContacts}
				</h2>
				<p className="text-gray-600 mb-4">
					{t.sos.quickAccess}
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
						<span className="text-4xl mb-2">❤️</span>
						<h3 className="font-bold text-lg text-red-700 mb-1">
							{t.sos.medicalEmergency}
						</h3>
						<p className="text-gray-600 mb-2">108</p>
						<a
							href="tel:108"
							className="mt-2 px-6 py-2 bg-red-500 text-white rounded-full font-semibold shadow hover:bg-red-600 transition"
						>
							{t.sos.call}
						</a>
					</div>
					<div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
						<span className="text-4xl mb-2">🚓</span>
						<h3 className="font-bold text-lg text-red-700 mb-1">{t.sos.police}</h3>
						<p className="text-gray-600 mb-2">100</p>
						<a
							href="tel:100"
							className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-full font-semibold shadow hover:bg-blue-600 transition"
						>
							{t.sos.call}
						</a>
					</div>
				</div>
			</div>

			{/* Safety Tips Section */}
			<div className="w-full max-w-2xl px-4">
				<h2 className="text-xl font-semibold text-red-700 mb-4">{t.sos.safetyTips}</h2>
				<div className="space-y-4">
					{safetyTips.map((tip, idx) => (
						<div
							key={idx}
							className="bg-white rounded-xl shadow-md p-4 flex items-center"
						>
							<span className="text-2xl mr-4">{tip.icon}</span>
							<span className="text-gray-700 text-base">
								{t.sos.safetyTipsList[tip.textKey as keyof typeof t.sos.safetyTipsList]}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}