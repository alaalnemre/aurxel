import { ModuleData } from '@/lib/types/module-data';

interface RentalDisplayProps {
    moduleData: ModuleData;
}

export function RentalDisplay({ moduleData }: RentalDisplayProps) {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🚗</span>
                <h3 className="text-xl font-semibold text-purple-900">Rental Information</h3>
            </div>

            {/* Rental Rates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {moduleData.hourly_rate && (
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-muted-foreground">Hourly</p>
                        <p className="text-lg font-bold text-purple-700">
                            {moduleData.hourly_rate.toFixed(2)} JOD
                        </p>
                    </div>
                )}
                {moduleData.daily_rate && (
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-muted-foreground">Daily</p>
                        <p className="text-lg font-bold text-purple-700">
                            {moduleData.daily_rate.toFixed(2)} JOD
                        </p>
                    </div>
                )}
                {moduleData.weekly_rate && (
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-muted-foreground">Weekly</p>
                        <p className="text-lg font-bold text-purple-700">
                            {moduleData.weekly_rate.toFixed(2)} JOD
                        </p>
                    </div>
                )}
                {moduleData.monthly_rate && (
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="text-lg font-bold text-purple-700">
                            {moduleData.monthly_rate.toFixed(2)} JOD
                        </p>
                    </div>
                )}
            </div>

            {/* Deposit and Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {moduleData.deposit_required && (
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <div>
                            <p className="text-xs text-muted-foreground">Security Deposit</p>
                            <p className="font-semibold">{moduleData.deposit_required.toFixed(2)} JOD</p>
                        </div>
                    </div>
                )}
                {moduleData.min_rental_period && (
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        <div>
                            <p className="text-xs text-muted-foreground">Min Period</p>
                            <p className="font-semibold">{moduleData.min_rental_period} days</p>
                        </div>
                    </div>
                )}
                {moduleData.max_rental_period && (
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⏰</span>
                        <div>
                            <p className="text-xs text-muted-foreground">Max Period</p>
                            <p className="font-semibold">{moduleData.max_rental_period} days</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Service Options */}
            {(moduleData.pickup_required || moduleData.delivery_available) && (
                <div className="flex gap-2 flex-wrap">
                    {moduleData.pickup_required && (
                        <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                            📦 Pickup Required
                        </span>
                    )}
                    {moduleData.delivery_available && (
                        <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm">
                            🚚 Delivery Available
                        </span>
                    )}
                </div>
            )}

            {/* Rental Terms */}
            {moduleData.rental_terms && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <p className="font-semibold text-sm mb-2">📋 Rental Terms:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {moduleData.rental_terms}
                    </p>
                </div>
            )}
        </div>
    );
}
